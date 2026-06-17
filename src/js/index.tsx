import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './components/pages/App';
import configureStore from './store';
import * as serviceWorker from './serviceWorker';
import { SWUpdateDialog } from './components/organisms/SWUpdateDialog';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <Provider store={configureStore()}>
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
