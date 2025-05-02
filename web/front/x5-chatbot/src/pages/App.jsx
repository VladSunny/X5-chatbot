import React, { useState, useEffect } from 'react';
import '../styles/App.css';

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привет! Чем могу помочь?' },
  ]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input };
    const replyMessage = {
      role: 'assistant',
      text: 'Спасибо за вопрос! (Здесь будет ответ от AI 🧠)',
    };

    setMessages([...messages, userMessage, replyMessage]);
    setInput('');
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
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-bubble animate-fade-in ${
                msg.role === 'user' ? 'message-user' : 'message-assistant'
              } max-w-full sm:max-w-xl`}
            >
              {msg.text}
            </div>
          ))}
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