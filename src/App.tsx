import { Component, ParentProps } from 'solid-js';
import styles from './App.module.css';


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
