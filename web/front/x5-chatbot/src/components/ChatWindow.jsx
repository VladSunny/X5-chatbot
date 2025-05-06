import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';

export default function ChatWindow({ toggleSidebar, isLoggedIn }) {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages
      ? JSON.parse(savedMessages)
      : [{ role: 'assistant', text: 'Привет! Чем могу помочь?', id: 'initial' }];
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const messagesEndRef = useRef(null);

  const generateId = () => crypto.randomUUID();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

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
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);

    try {
      const response = await fetch('https://vladg00dman.website/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          throw new Error('Слишком много запросов. Пожалуйста, подождите минуту и попробуйте снова.');
        }
        throw new Error(data.detail || 'Ошибка при обращении к серверу');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message);
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
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) {
        throw new Error('Сообщение не найдено');
      }

      const messageToSave = messages[messageIndex];
      let userQuery = null;
      if (messageToSave.role === 'assistant' && messageIndex > 0 && messages[messageIndex - 1].role === 'user') {
        userQuery = messages[messageIndex - 1];
      }

      const response = await fetch('https://vladg00dman.website/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
        },
        body: JSON.stringify({
          message_id: messageId,
          feedback: value,
          message: messageToSave,
          userQuery: userQuery,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Слишком много запросов. Пожалуйста, подождите минуту и попробуйте снова.');
        }
        throw new Error('Ошибка при отправке фидбека');
      }

      setFeedback((prev) => ({ ...prev, [messageId]: value }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'assistant', text: 'Привет! Чем могу помочь?', id: 'initial' }]);
    setFeedback({});
    setError(null);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  };

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
          className="transition-all duration-200 hover:scale-110"
          onClick={handleClear}
        >
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
        <div ref={messagesEndRef} />
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