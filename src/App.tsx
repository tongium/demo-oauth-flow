import { Component, ParentProps, Show } from 'solid-js';
import styles from './App.module.css';
import Dashboard from './components/User';
import Welcome from './components/Settings';
import { useIsLogin, useRequestTokensByAuthorizationCode } from './hooks/auth';

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

const App: Component = (props: ParentProps) => {
  return (
    <div class={styles.App}>
      <main class='min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-2'>
        {props.children}
      </main>
    </div >
  );
};

export default App;
