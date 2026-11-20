// client/src/App.jsx
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import apiClient from './api/client';

export function App() {
  useEffect(() => {
    // Non-blocking pre-warm ping on initial site visit to eliminate cold-start lag
    apiClient.get('/health').catch(() => {});
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
