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

function* initConfig() {
  try {
    const json: RootState['content']['config'] = yield call(fetchJson, './config.json?t=' + new Date().getTime());
    yield put(actions.updateConfig(json));
    yield put(actions.updateStatus('ok'));
  } catch (e) {
    yield call(errorHandler, e);
  }
}

function* updateVisitorList() {
  try {
    const state: RootState = yield select();

    const visitor: Visitor[] = yield call(fetchJson, state.content.config.data.visitor + '?t=' + new Date().getTime());
    const runner: Visitor[] = yield call(fetchJson, state.content.config.data.runner + '?t=' + new Date().getTime());
    const commentator: Visitor[] = yield call(fetchJson, state.content.config.data.commentator + '?t=' + new Date().getTime());
    const volunteer: Visitor[] = yield call(fetchJson, state.content.config.data.volunteer + '?t=' + new Date().getTime());
    const visitorList: Visitor[] = [...visitor, ...runner, ...commentator, ...volunteer];
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
    } = yield call(fetchJson, state.content.config.data.accepted + '?t=' + new Date().getTime());
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
    const formKey = state.content.config.api.formKey;
    const body: any = {};
    body[formKey.name] = action.payload.name;
    body[formKey.date] = action.payload.date;
    body[formKey.code] = action.payload.code;

    const baseurl = state.content.config.api.reception;
    yield call(postJson, `${baseurl}`, body);

    yield call(updateAccepted);
  } catch (e) {
    console.error(e);
  }
}
