import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import { RootState } from '../reducers';
import { loginCheck, logoutDiscord, oauthDiscord } from './discord';
import { Accepted, CommonResponse, Visitor } from '../types/global';
import { fetchJson, postJson } from './common';

export default function* rootSaga() {
  yield takeEvery(actions.callPostReception, postReception);
  yield takeEvery(actions.loginDiscord, oauthDiscord);
  yield takeEvery(actions.logoutDiscord, logoutDiscord);
  yield takeEvery(actions.fetchVisitorList, fetchVisitorList);
  yield takeEvery(actions.flushPendingAccepts, flushPendingAccepts);

  // DB初期設定
  yield call(initConfig);

  yield call(loginCheck);
  // yield put(actions.storeDiscordUserName('テストユーザ'));

  yield call(updateVisitorList);
  yield call(updateAccepted);
  // 前回セッションで未送信のまま残った受付があれば再送を試みる
  yield call(flushPendingAccepts);
}

/** Config取得 */
function* initConfig() {
  try {
    const json: RootState['content']['config'] = yield call(fetchJson, './config.json?t=' + new Date().getTime());
    yield put(actions.updateConfig(json));
  } catch (e) {
    yield call(errorHandler, e);
  }
}

/** 全入場者のリストを更新 */
function* updateVisitorList() {
  try {
    const state: RootState = yield select();
    if (!state.content.discord.username) {
      return;
    }

    const visitor: CommonResponse<Visitor[]> = yield call(fetchJson, state.content.config.api.visitor + '?t=' + new Date().getTime(), {
      'x-app-token': state.content.config.api.token,
    });
    const badgeholder: CommonResponse<Visitor[]> = yield call(fetchJson, state.content.config.api.badgeholder + '?t=' + new Date().getTime(), {
      'x-app-token': state.content.config.api.token,
    });
    const visitorList: Visitor[] = [];
    let isError = false;
    if (visitor.status === 'ok') {
      console.log('fetch visitor: ok');
      visitorList.push(
        ...visitor.data.map((item) => {
          return { ...item, isDailyAccept: true };
        }),
      );
    } else {
      isError = true;
    }
    if (badgeholder.status === 'ok') {
      console.log('fetch badgeholder: ok');
      visitorList.push(...badgeholder.data);
    } else {
      isError = true;
    }
    console.log(`入場者数：` + visitorList.length);
    yield put(actions.updateVisitorList(visitorList));

    if (isError) {
      throw new Error('入場者情報の取得でエラーが発生しました');
    }
    yield put(actions.updateStatus('ok'));
  } catch (e) {
    yield call(errorHandler, e);
  }
}

function* updateAccepted() {
  try {
    const state: RootState = yield select();
    if (!state.content.discord.username) {
      return;
    }

    const json: {
      status: string;
      data: Accepted[];
    } = yield call(fetchJson, state.content.config.api.accepted + '?t=' + new Date().getTime(), {
      'x-app-token': state.content.config.api.token,
    });
    // postのレスポンスは、現在登録されてる全データなのでこれを保持する
    if (json.status === 'ok') {
      yield put(actions.updateAcceptedList(json.data));
    }
    yield put(actions.updateStatus('ok'));
  } catch (e) {
    yield call(errorHandler, e);
  }
}

function* errorHandler(error: any) {
  try {
    const message = (error.message as string) || '予期せぬエラーが発生しました。';
    yield put(actions.changeNotify(true, 'error', message));
    yield put(actions.updateStatus('error'));
  } catch (e) {
    console.error('★激辛だ★');
  }
}

/**
 * 読み取った受付情報を登録する
 */
export function* postReception(action: ReturnType<typeof actions.callPostReception>) {
  try {
    const state: RootState = yield select();
    const body: any = action.payload;

    const baseurl = state.content.config.api.accepted;
    const json: {
      status: string;
      data: any;
    } = yield call(postJson, `${baseurl}`, body, {
      'x-app-token': state.content.config.api.token,
    });

    // レスポンスを保存
    if (json.status === 'ok') {
      yield put(actions.updateAcceptedList(json.data));
      yield put(actions.updateStatus('ok'));
      // 疎通が確認できたので、保留中の受付があればここで再送する
      yield call(flushPendingAccepts);
    } else {
      // 登録失敗をオペレーターに通知する（従来は何も表示されず失敗に気付けなかった）
      yield put(actions.changeNotify(true, 'error', '受付の登録に失敗しました。'));
      yield put(actions.updateStatus('error'));
    }
  } catch (e) {
    // サーバへ記録できなかった受付は失わずキューへ退避し、ローカルでは入場済みとして扱う。
    // 事業継続を優先し、疎通回復時に自動再送する。
    console.error(e);
    const pending: Accepted = {
      name: action.payload.name,
      code: action.payload.code,
      category: action.payload.category,
      timestamp: new Date().toISOString(),
    };
    yield put(actions.enqueuePendingAccept(pending));
    yield put(actions.changeNotify(true, 'warning', 'オフラインのため受付を保留しました。通信回復時に自動送信します。'));
  }
}

/**
 * 保留中（未送信）の受付をサーバへ再送する。
 * 1件でも失敗した時点で残りは次回に回す（順序を保つ）。
 */
export function* flushPendingAccepts() {
  const state: RootState = yield select();
  const pending = state.content.pendingAccepts;
  if (!pending || pending.length === 0) {
    return;
  }

  const baseurl = state.content.config.api.accepted;
  const token = state.content.config.api.token;

  let sent = 0;
  for (const item of pending) {
    try {
      const json: { status: string; data: any } = yield call(postJson, `${baseurl}`, { name: item.name, category: item.category, code: item.code }, { 'x-app-token': token });
      if (json.status === 'ok') {
        yield put(actions.updateAcceptedList(json.data));
        sent++;
      } else {
        // サーバ起因の失敗。残りは次回に回す
        break;
      }
    } catch (e) {
      // まだ疎通していない。残りは次回に回す
      console.error(e);
      break;
    }
  }

  if (sent > 0) {
    yield put(actions.setPendingAccepts(pending.slice(sent)));
    yield put(actions.changeNotify(true, 'info', `保留していた受付 ${sent} 件を送信しました。`));
  }
}

export function* fetchVisitorList(action: ReturnType<typeof actions.fetchVisitorList>) {
  try {
    yield call(updateVisitorList);
    yield call(updateAccepted);
    // 手動更新のタイミングでも保留分の再送を試みる
    yield call(flushPendingAccepts);
    yield put(actions.changeNotify(true, 'info', '更新完了'));
  } catch (e) {
    // yield を付け忘れると errorHandler が実行されない（ジェネレータが回らない）
    yield call(errorHandler, e);
  }
}
