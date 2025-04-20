import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from "./router/AppRouter"
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { store } from './store'
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

Modal.setAppElement('#root');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <Provider store={ store }>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </Provider>
  </StrictMode>,
)
