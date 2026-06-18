import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers';
import rootSaga from '../sagas';
import { initial as notifyInitial } from '../reducers/notify';
import { initial as contentInitial } from '../reducers/content';

const STATE_STORAGE_KEY = 'reception_reduxState_conntent';

export default function setupStore() {
  const sagaMiddleware = createSagaMiddleware();

  // content を localStorage から復元（旧実装と互換のキー・形を維持）
  const stateStr = localStorage.getItem(STATE_STORAGE_KEY);
  const preloadedState = stateStr
    ? {
        notify: notifyInitial,
        content: {
          ...contentInitial,
          ...JSON.parse(stateStr),
        },
      }
    : undefined;

  const store = configureStore({
    reducer: rootReducer,
    // 形は rootReducer の state と一致。theme(MUI Theme) を含むため any キャスト
    preloadedState: preloadedState as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // state に MUI Theme(関数を含む非シリアライズ値) を保持するため serializableCheck を無効化
        serializableCheck: false,
      }).concat(sagaMiddleware),
  });

  // 変更があったときに content を保存する
  store.subscribe(() => {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(store.getState().content));
  });

  sagaMiddleware.run(rootSaga);
  return store;
}
