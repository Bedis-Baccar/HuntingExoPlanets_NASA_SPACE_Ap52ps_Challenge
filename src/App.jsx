import React from 'react';
import { AppProvider } from './AppContext.jsx';
import { ToastProvider } from './components/ToastContainer.jsx';
import Layout from './components/Layout';
import './styles/globals.css';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Layout showPluto={true}>
          <Home />
        </Layout>
      </ToastProvider>
    </AppProvider>
  );
}
