import React from 'react';
import { render, Window } from '../../react-conductor/src/index';

const App = () => (
  <Window show>
    <Window show />
    <Window show />
  </Window>
);

render(<App />);
