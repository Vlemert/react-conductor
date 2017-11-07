import React from 'react';
import { render, App, Window } from '@react-conductor/core';

const Application = () => (
  <App>
    <Window show path="https://www.google.com" />
  </App>
);

render(<Application />);
