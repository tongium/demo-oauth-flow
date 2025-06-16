import { Component } from 'solid-js';
import styles from './App.module.css';
import { Router, Route } from "@solidjs/router";
import Home from './pages/Home';
import Callback from './pages/authz/Callback';

import type { ParentProps } from 'solid-js';
import NotFound from './pages/NotFound';


const Layout = (props: ParentProps) => {
  return (
    <div class={styles.App}>
      <main class='min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-2'>
        {props.children}
      </main>
      <footer>
        <a href="https://github.com/tongium/demo-oauth-flow" class='hover:text-yellow-300' target="_blank">Github</a>
      </footer>
    </div >
  );
}

const App: Component = () => {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/authz/callback" component={Callback} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
};

export default App;
