import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducer from '../reducers';
import rootSaga from '../sagas';
import { initial } from '../reducers/notify';
import { initial as contentInitial } from '../reducers/content';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const STATE_STORAGE_KEY = 'reception_reduxState_conntent';

export default function configureStore() {
  const sagaMiddleware = createSagaMiddleware();
  // const store = createStore(reducer, composeEnhancers(applyMiddleware(sagaMiddleware)));

  const stateStr = localStorage.getItem(STATE_STORAGE_KEY);
  const persistedState = stateStr
    ? {
        notify: initial as any,
        content: {
          ...contentInitial,
          ...JSON.parse(stateStr),
        },
      }
    : {};

  const store = createStore(reducer, persistedState as any, composeEnhancers(applyMiddleware(sagaMiddleware)));
  // 変更があったときに保存する
  store.subscribe(() => {
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(store.getState().content));
  });

  sagaMiddleware.run(rootSaga);
  return store;
}
