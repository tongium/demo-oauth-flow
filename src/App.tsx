import { Component, Show } from 'solid-js';
import styles from './App.module.css';
import { useExchangeToken, useIsLogin } from './hooks/auth';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';

const params = new URLSearchParams(window.location.search)
if (params.has('code')) {
  await useExchangeToken(params.get('code') || "")
} else if (params.has('error_description')) {
  alert(params.get('error_description'))
}

const isLogin = await useIsLogin()

const App: Component = () => {
  return (
    <main class={styles.App}>
      <div class='flex flex-col items-center justify-center pt-16'>
        <Show
          when={isLogin}
          fallback={Welcome}
        >
          <Dashboard />
        </Show>
      </div>
    </main >
  );
};

export default App;
