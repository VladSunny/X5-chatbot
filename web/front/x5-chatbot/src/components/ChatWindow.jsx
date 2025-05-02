import React from 'react';
import Message from './Message';

export default function ChatWindow({
  messages,
  input,
  setInput,
  handleSend,
  feedback,
  handleFeedback,
  isLoggedIn,
  error,
  toggleSidebar,
}) {
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