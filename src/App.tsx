import { Component, Show } from 'solid-js';
import styles from './App.module.css';
import { useRequestTokensByAuthorizationCode, useIsLogin } from './hooks/auth';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';

const params = new URLSearchParams(window.location.search)
if (params.has('code')) {
  const code = params.get('code')
  if (code) {
    await useRequestTokensByAuthorizationCode(code)
  }
} else if (params.has('error_description')) {
  alert(params.get('error_description'))
}

const isLogin = await useIsLogin()

const App: Component = () => {
  return (
    <div class={styles.App}>
      <main class='min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-2'>
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
