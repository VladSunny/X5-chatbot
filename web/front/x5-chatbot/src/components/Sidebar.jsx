import React from 'react';

export default function Sidebar({ isSidebarOpen, toggleSidebar, isLoggedIn, handleLogin, handleLogout }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:translate-x-0 md:w-64 z-10`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-xl text-green-700 dark:text-green-400">
        5X Chatbot
      </div>
      <button
        onClick={isLoggedIn ? handleLogout : handleLogin}
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
  );
}