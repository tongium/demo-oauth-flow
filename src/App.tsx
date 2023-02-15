import type { Component } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';

const authURL = "https://auth-qa.finnomena.com"
const authClientID = "bacon"

console.log(window.location.protocol, window.location.hostname)

const loginURL = (): string => {
  return `${authURL}/oauth2/auth?client_id=${authClientID}&redirect_uri=`
}

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Landing Page
        </p>
        <a
          class={styles.link}
          href={loginURL()}
          rel="noopener noreferrer"
        >
          Connect to FINNOMENA
        </a>
      </header>
    </div >
  );
};

export default App;
