import './index.css';

import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

const client = new QueryClient({});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider {...{ client }}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
