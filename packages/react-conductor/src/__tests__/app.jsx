import React from 'react';
import { app } from 'electron';

import { App } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');

describe('App', () => {
  test('can render', () => {
    const Application = () => <App />;

    const wrapper = testRender(<Application />);

    // Not sure what to assert here..
    expect(wrapper.appElement.root.electronApp).toBe(app);
  });

  test('registers app events', () => {
    app.on = jest.fn();
    const Application = () => <App onBrowserWindowBlur={blurHandler} />;

    const blurHandler = () => {};
    testRender(<Application />);

    expect(app.on).toBeCalledWith('browser-window-blur', blurHandler);
    delete app.on;
  });
});
