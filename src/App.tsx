import type { Component } from 'solid-js';
import styles from './App.module.css';
import { useExchangeToken, useIsLogin } from './hooks/auth';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';

const params = new URLSearchParams(window.location.search)
if (params.has('code')) {
  useExchangeToken(params.get('code') || "")
} else if (params.has('error')) {
  alert(params.get('error'))
}

const isLogin = await useIsLogin()

const App: Component = () => {
  return (
    <div class={styles.App}>
      {isLogin ? (
        <Dashboard />
      ) : (
        <Welcome />
      )}
    </div >
  );
};

export default App;
