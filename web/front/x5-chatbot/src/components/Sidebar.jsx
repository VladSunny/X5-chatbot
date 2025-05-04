import React from 'react';

export default function Sidebar({ isSidebarOpen, toggleSidebar, isLoggedIn, setShowLoginModal, setIsLoggedIn, setShowGlossaryModal }) {
  const handleLogin = () => setShowLoginModal(true);
  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setIsLoggedIn(false);
  };
  const handleGlossary = () => {
    setShowGlossaryModal(true);
    if (isSidebarOpen) toggleSidebar();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:translate-x-0 md:w-64 z-10`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-xl text-green-700 dark:text-green-400 flex items-center">
        X5 Chatbot
      </div>
      <button
        onClick={handleGlossary}
        className="sidebar-button text-left text-gray-600 dark:text-gray-100 hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-200"
      >
        <span className="mr-2">📖</span> Глоссарий
      </button>
      <button
        onClick={isLoggedIn ? handleLogout : handleLogin}
        className="sidebar-button text-left text-gray-600 dark:text-gray-100 hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-200"
      >
        <span className="mr-2">{isLoggedIn ? '🚪' : '🔑'}</span> {isLoggedIn ? 'Выйти' : 'Войти'}
      </button>
      {/* <button
        className="md:hidden sidebar-button text-gray-600 dark:text-gray-100 hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-200"
        onClick={toggleSidebar}
      >
        <span className="mr-2">✖</span> Закрыть
      </button> */}
    </aside>
  );
}