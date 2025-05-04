import React, { useState } from 'react';

export default function LoginModal({ show, setShowLoginModal, setIsLoggedIn }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [error, setError] = useState(null);

  if (!show) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white dark:bg-[rgba(41,42,46,255)] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Вход</h2>
        <input
          type="text"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Введите API ключ"
          className="w-full border rounded-lg p-2 mb-4 bg-gray-50 dark:bg-[rgba(41,42,46,255)] text-white dark:text-white placeholder-[rgba(62,66,74,255)] dark:placeholder-[rgba(62,66,74,255)] outline-none focus:ring-2 focus:ring-[rgba(84,139,57,1)]"
        />
        {error && (
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleLogin}
            className="bg-[rgba(84,139,57,1)] text-white px-4 py-2 rounded-lg hover:bg-[rgba(84,139,57,1)] transition"
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
  );
}