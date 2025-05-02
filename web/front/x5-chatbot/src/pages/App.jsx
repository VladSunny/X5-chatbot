import React, { useState, useEffect } from 'react';
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
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 md:w-64 z-10`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-xl text-green-700 dark:text-green-400">
          5X Chatbot
        </div>
        <button
          onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}
          className="p-4 text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {isLoggedIn ? 'Выйти' : 'Войти'}
        </button>
        <button
          className="md:hidden p-4 text-gray-600 dark:text-gray-300"
          onClick={toggleSidebar}
        >
          Закрыть
        </button>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-0"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Вход</h2>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Введите API ключ"
              className="w-full border rounded-lg p-2 mb-4 bg-gray-50 dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-400"
            />
            {error && (
              <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Войти
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-lg font-semibold flex items-center justify-between">
          <button
            className="md:hidden text-gray-600 dark:text-gray-300"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          AI-ассистент
        </header>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble animate-fade-in ${
                msg.role === 'user' ? 'message-user' : 'message-assistant'
              } max-w-full sm:max-w-xl`}
            >
              <div>{msg.text}</div>
              {msg.role === 'assistant' && isLoggedIn && (
                <div className="feedback-buttons mt-2 flex gap-2 justify-end">
                  <button
                    className={`feedback-button ${
                      feedback[msg.id] === 'like' ? 'feedback-like-active' : ''
                    }`}
                    onClick={() => handleFeedback(msg.id, 'like')}
                    title="Нравится"
                  >
                    👍
                  </button>
                  <button
                    className={`feedback-button ${
                      feedback[msg.id] === 'dislike' ? 'feedback-dislike-active' : ''
                    }`}
                    onClick={() => handleFeedback(msg.id, 'dislike')}
                    title="Не нравится"
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          ))}
          {error && (
            <div className="text-red-500 dark:text-red-400 p-4 text-center">
              {error}
            </div>
          )}
        </div>
        <footer className="p-4 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Задайте вопрос..."
            className="flex-1 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 w-full"
          />
          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
          >
            Отправить
          </button>
        </footer>
      </main>
    </div>
  );
}