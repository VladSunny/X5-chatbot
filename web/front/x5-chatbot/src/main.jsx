import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
// import Header from './components/Header.jsx';
import App from './pages/App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex flex-col h-screen">
        {/* <Header /> */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>
);