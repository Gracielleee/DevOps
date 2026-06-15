// frontend/components/ChatInput.js
import React, { useState } from 'react';

export default function ChatInput({ onSubmit }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Error / Validation State handling
    if (!inputValue.trim()) {
      setError('This field cannot be empty');
      return;
    }

    // Success State handling
    setError('');
    onSubmit(inputValue);
    setInputValue(''); // Clears input field after success
  };

  return (
    <form onSubmit={handleSubmit} data-testid="chat-form">
      <div>
        <input
          type="text"
          placeholder="type your question"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">send</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}