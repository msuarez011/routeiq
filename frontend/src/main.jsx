import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import './styles/global.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <App />
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);