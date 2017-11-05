import React from 'react';
import { render, App, Window } from '../../react-conductor/src/index';

const Application = () => (
  <App onBrowserWindowBlur={() => console.log('blurrrrr')}>
    <Window show>
      <Window show />
      <Window show />
    </Window>
  </App>
);

render(<Application />);
