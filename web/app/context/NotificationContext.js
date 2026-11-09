'use client';

import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState('');

  function showNotification(msg) {
    setMessage(msg);

    setTimeout(() => {
      setMessage('');
    }, 3000);
  }

  return (
    <NotificationContext.Provider
      value={{ message, showNotification }}
    >
      <div>
        {message && (
          <div style={{
            backgroundColor: 'green',
            color: 'white',
            padding: '10px',    
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {children}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}