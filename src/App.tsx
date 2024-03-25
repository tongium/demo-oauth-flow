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
    <div class={styles.App}>
      <nav class='w-1/1 text-right p-1 text-sm'>
        <a href="https://github.com/tongium/demo-oauth-flow" target="_blank">Github</a>
      </nav>
      <main class='flex flex-col items-center justify-center pt-8'>
        <Show
          when={isLogin}
          fallback={<Welcome />}
        >
          <Dashboard />
        </Show>
      </main>
    </div >
  );
};

export default App;
