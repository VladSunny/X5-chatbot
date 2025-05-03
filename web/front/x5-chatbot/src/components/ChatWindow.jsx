import React, { useState } from 'react';
import Message from './Message';

export default function ChatWindow({ toggleSidebar, isLoggedIn }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привет! Чем могу помочь?', id: 'initial' },
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});

  const generateId = () => crypto.randomUUID();

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
    console.log(messages)
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

  const handleClear = () => {
    if (!isLoggedIn) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }

    setMessages([
      { role: 'assistant', text: 'Привет! Чем могу помочь?', id: 'initial' },
    ])
  }

  return (
    <main className="flex-1 flex flex-col">
      <header className="p-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-lg font-semibold flex items-center justify-between">
        <button
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        AI-ассистент
        <button
        className='transition-all duration-200 hover:scale-110'
        onClick={handleClear}>
          🗑️
        </button>
      </header>
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg}
            feedback={feedback[msg.id]}
            handleFeedback={handleFeedback}
            isLoggedIn={isLoggedIn}
          />
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
  );
}