import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LoginModal from '../components/LoginModal';
import ChatWindow from '../components/ChatWindow';
import GlossaryModal from '../components/GlossaryModal';
import '../styles/App.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('apiKey'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (!savedMessages) {
      localStorage.setItem(
        'chatMessages',
        JSON.stringify([{ role: 'assistant', text: 'Привет! Чем могу помочь?', id: 'initial' }])
      );
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isLoggedIn={isLoggedIn}
        setShowLoginModal={setShowLoginModal}
        setIsLoggedIn={setIsLoggedIn}
        setShowGlossaryModal={setShowGlossaryModal}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-0"
          onClick={toggleSidebar}
        ></div>
      )}
      <LoginModal
        show={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        setIsLoggedIn={setIsLoggedIn}
      />
      <GlossaryModal
        show={showGlossaryModal}
        setShowGlossaryModal={setShowGlossaryModal}
      />
      <ChatWindow toggleSidebar={toggleSidebar} isLoggedIn={isLoggedIn} />
    </div>
  );
}