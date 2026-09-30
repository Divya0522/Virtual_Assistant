import { createRoot } from 'react-dom/client'
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import UserContext from './context/UserContext.jsx';
import {ToastContainer} from "react-toastify";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <UserContext>
    <App />
    <ToastContainer/>
  </UserContext>
  </BrowserRouter>
)
