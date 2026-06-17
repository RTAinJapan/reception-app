import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './components/pages/App';
import configureStore from './store';
import * as actions from './actions';
import * as serviceWorker from './serviceWorker';
import { SWUpdateDialog } from './components/organisms/SWUpdateDialog';

const store = configureStore();

// 通信が回復したら、保留中（未送信）の受付を自動的に再送する
window.addEventListener('online', () => {
  store.dispatch(actions.flushPendingAccepts());
});

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

if (import.meta.hot) {
  import.meta.hot.accept();
}

serviceWorker.register({
  onSuccess: (registration) => {
    console.log(`'ServiceWorker registration successful with scope: ${registration.scope}`);
  },
  onUpdate: (registration) => {
    if (registration.waiting) {
      const swContainer = document.querySelector('.SW-update-dialog');
      if (swContainer) {
        createRoot(swContainer).render(<SWUpdateDialog registration={registration} />);
      }
    }
  },
});
