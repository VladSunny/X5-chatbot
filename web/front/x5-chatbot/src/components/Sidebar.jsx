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
      className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[rgba(41,42,46,255)] shadow-lg flex flex-col transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:static md:translate-x-0 md:w-64 z-10`}
    >
      <div className="p-4 border-b border-[rgba(62,66,74,255)] dark:border-[rgba(62,66,74,255)] font-bold text-xl text-[rgba(84,139,57,1)] dark:text-[rgba(84,139,57,1)] flex items-center gap-4">
        <img 
          src="src/assets/x5_logo.png" 
          alt="Company Logo" 
          className="w-[50px] h-[50px] bg-[#bebebc] rounded-lg" 
        />
        <span className="font-bold text-xl text-[rgba(84,139,57,1)] dark:text-[rgba(84,139,57,1)">
          Chatbot
        </span>
      </div>
      <button
        onClick={handleGlossary}
        className="w-full p-4 mx-auto text-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
      >
        Глоссарий
      </button>
      <button
        onClick={isLoggedIn ? handleLogout : handleLogin}
        className="w-full p-4 mx-auto text-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
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