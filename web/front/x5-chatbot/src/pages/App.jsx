import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LoginModal from '../components/LoginModal';
import ChatWindow from '../components/ChatWindow';
import '../styles/App.css';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привет! Чем могу помочь?', id: 'initial' },
  ]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('apiKey'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const generateId = () => crypto.randomUUID();

  const handleLogin = async () => {
    if (!apiKeyInput.trim()) {
      setError('Введите API ключ');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: apiKeyInput }),
      });

      if (!response.ok) {
        throw new Error('Неверный API ключ');
      }

      localStorage.setItem('apiKey', apiKeyInput);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setError(null);
      setApiKeyInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setIsLoggedIn(false);
    setMessages([{ role: 'assistant', text: 'Пожалуйста, войдите в аккаунт', id: 'initial' }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!isLoggedIn) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Пожалуйста, войдите в аккаунт', id: generateId() },
      ]);
      return;
    }

    const userMessage = { role: 'user', text: input, id: generateId() };
    setMessages([...messages, userMessage]);
    setInput('');
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка при обращении к серверу');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { ...data, id: generateId() }]);
    } catch (err) {
      setError('Не удалось получить ответ от сервера');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Ошибка: ' + err.message, id: generateId() },
      ]);
    }
  };

  const handleFeedback = async (messageId, value) => {
    if (!isLoggedIn) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
        },
        body: JSON.stringify({ message_id: messageId, feedback: value }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке фидбека');
      }

      setFeedback((prev) => ({ ...prev, [messageId]: value }));
    } catch (err) {
      setError('Не удалось отправить фидбек');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isLoggedIn={isLoggedIn}
        handleLogin={() => setShowLoginModal(true)}
        handleLogout={handleLogout}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-0"
          onClick={toggleSidebar}
        ></div>
      )}
      <LoginModal
        show={showLoginModal}
        apiKeyInput={apiKeyInput}
        setApiKeyInput={setApiKeyInput}
        handleLogin={handleLogin}
        handleCancel={() => setShowLoginModal(false)}
        error={error}
      />
      <ChatWindow
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        feedback={feedback}
        handleFeedback={handleFeedback}
        isLoggedIn={isLoggedIn}
        error={error}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
}