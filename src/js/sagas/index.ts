import { call, put } from 'redux-saga/effects';
import * as actions from '../actions';
import { Visitor } from '../types/global';
import { fetchJson } from './common';

export default function* rootSaga() {
  // DB初期設定
  yield call(initDB);
}

function* initDB() {
  try {
    const json: Visitor[] = yield call(fetchJson, 'https://rtain.jp/api/ajax/index.php?url=https://rtain.jp/util/reception_data/visitorList.json?t=' + new Date().getTime());
    yield put(actions.updateVisitorList(json));

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
