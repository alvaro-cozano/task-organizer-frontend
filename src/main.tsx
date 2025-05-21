
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import Modal from 'react-modal';
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { AppRouter } from "./router/AppRouter"
import { store } from './store'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'gridstack/dist/gridstack.min.css';

import './index.css'

if (typeof global === "undefined") {
  window.global = window;
}

Modal.setAppElement('#root');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="953403003242-r97lfvcorglqk3pvccnq2410ndvtkkjn.apps.googleusercontent.com">
      <Provider store={ store }>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
