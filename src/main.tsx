import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from "./router/AppRouter"
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { store } from './store'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <Provider store={ store }>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </Provider>
  </StrictMode>,
)