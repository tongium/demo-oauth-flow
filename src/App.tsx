import { Component, ParentProps } from 'solid-js';

const App: Component = (props: ParentProps) => {
  return (
    <main class='min-h-screen flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-zinc-100'>
      {props.children}
    </main>
  );
};

export default App;
