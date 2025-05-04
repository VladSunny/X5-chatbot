import React, { useState, useEffect } from 'react';
import '../styles/GlossaryModal.css';

export default function GlossaryModal({ show, setShowGlossaryModal }) {
  const [glossary, setGlossary] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;

    const fetchGlossary = async () => {
      try {
        const response = await fetch('/glossary.json');
        if (!response.ok) {
          throw new Error('Не удалось загрузить глоссарий');
        }
        const data = await response.json();
        setGlossary(data);
      } catch (err) {
        setError('Ошибка при загрузке глоссария');
      }
      
    };

    fetchGlossary();
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="glossary-modal bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Глоссарий</h2>
        {error && (
          <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
        )}
        <div className="glossary-container">
          {Object.entries(glossary).map(([term, definition]) => (
            <div key={term} className="glossary-item">
              <span className="glossary-term">{term}</span>
              <span className="glossary-definition">{definition}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowGlossaryModal(false)}
          className="mt-4 bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition w-full"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}