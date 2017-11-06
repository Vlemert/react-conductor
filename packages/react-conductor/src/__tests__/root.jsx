import React from 'react';
import { app, BrowserWindow } from 'electron';

import { Window } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');

describe('Root', () => {
  beforeEach(() => {
    BrowserWindow.mockReset();
  });

  test('is rendered as the root of the element tree', () => {
    const Application = () => null;

    const wrapper = testRender(<Application />);

    expect(wrapper.electronApp).toBe(app);
  });

  test('throws if something else than an App is appended to it', () => {
    // Hide react error details from the console
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const Application = () => <Window />;

    expect(() => testRender(<Application />)).toThrowErrorMatchingSnapshot();

    // And restore console.error behaviour
    console.error = originalConsoleError;
  });
});
