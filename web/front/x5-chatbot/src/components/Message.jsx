import React from 'react';

export default function Message({ message, feedback, handleFeedback, isLoggedIn }) {
  return (
    <div
      className={`message-bubble animate-fade-in ${
        message.role === 'user' ? 'message-user' : 'message-assistant'
      } max-w-full sm:max-w-xl`}
    >
      <div>{message.text}</div>
      {message.role === 'assistant' && isLoggedIn && (
        <div className="feedback-buttons mt-2 flex gap-2 justify-end">
          <button
            className={`feedback-button ${feedback === 'like' ? 'feedback-like-active' : ''}`}
            onClick={() => handleFeedback(message.id, 'like')}
            title="Нравится"
          >
            👍
          </button>
          <button
            className={`feedback-button ${feedback === 'dislike' ? 'feedback-dislike-active' : ''}`}
            onClick={() => handleFeedback(message.id, 'dislike')}
            title="Не нравится"
          >
            👎
          </button>
        </div>
      )}
    </div>
  );
}