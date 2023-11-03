import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import { RootState } from '../reducers';
import { Accepted, Visitor } from '../types/global';
import { fetchJson, postJson } from './common';

export default function* rootSaga() {
  yield takeEvery(actions.callPostReception, postReception);

  // DB初期設定
  yield call(initConfig);
  yield call(updateVisitorList);
  yield call(updateAccepted);
}

/** Config取得 */
function* initConfig() {
  try {
    const json: RootState['content']['config'] = yield call(fetchJson, './config.json?t=' + new Date().getTime());
    yield put(actions.updateConfig(json));
    yield put(actions.updateStatus('ok'));
  } catch (e) {
    yield call(errorHandler, e);
  }
}

/** 全入場者のリストを更新 */
function* updateVisitorList() {
  try {
    const state: RootState = yield select();

    const visitor: Visitor[] = yield call(fetchJson, state.content.config.api.visitor + '?t=' + new Date().getTime());
    const badgeholder: Visitor[] = yield call(fetchJson, state.content.config.api.badgeholder + '?t=' + new Date().getTime());
    const visitorList: Visitor[] = [...visitor, ...badgeholder];
    yield put(actions.updateVisitorList(visitorList));

    yield put(actions.updateStatus('ok'));
  } catch (e) {
    yield call(errorHandler, e);
  }
}

function* updateAccepted() {
  try {
    const state: RootState = yield select();

    const json: {
      status: string;
      data: Accepted[];
    } = yield call(fetchJson, state.content.config.api.accepted + '?t=' + new Date().getTime());
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
    } = yield call(postJson, `${baseurl}`, body);

    // レスポンスを保存
    if (json.status === 'ok') {
      yield put(actions.updateAcceptedList(json.data));
      yield put(actions.updateStatus('ok'));
    } else {
      yield put(actions.updateStatus('error'));
    }
  } catch (e) {
    console.error(e);
  }
}
