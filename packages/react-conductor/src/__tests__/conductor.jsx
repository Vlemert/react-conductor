import React, { Component } from 'react';
import { app, BrowserWindow } from 'electron';

import { Window, render } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');

describe('renderer', () => {
  beforeEach(() => {
    BrowserWindow.mockReset();
  });

  test('renders a root', () => {
    const App = () => null;

    const wrapper = testRender(<App />);

    expect(wrapper.electronApp).toBe(app);
  });

  test('renders a window', () => {
    const App = () => <Window />;

    const wrapper = testRender(<App />);

    expect(wrapper.childWindows.size).toBe(1);
    const childIterator = wrapper.childWindows.values();
    expect(childIterator.next().value.browserWindow).toBeInstanceOf(
      BrowserWindow
    );
  });

  test('renders multiple windows', () => {
    const App = () => [<Window key="1" />, <Window key="2" />];

    const wrapper = testRender(<App />);

    expect(wrapper.childWindows.size).toBe(2);
    const childIterator = wrapper.childWindows.values();
    expect(childIterator.next().value.browserWindow).toBeInstanceOf(
      BrowserWindow
    );
    expect(childIterator.next().value.browserWindow).toBeInstanceOf(
      BrowserWindow
    );
  });

  test('renders windows in windows', () => {
    const App = () => (
      <Window>
        <Window />
      </Window>
    );

    const wrapper = testRender(<App />);

    expect(wrapper.childWindows.size).toBe(1);
    const appChildIterator = wrapper.childWindows.values();
    const appChild = appChildIterator.next().value;
    expect(appChild.browserWindow).toBeInstanceOf(BrowserWindow);

    expect(appChild.childWindows.size).toBe(1);
    const windowChildIterator = appChild.childWindows.values();
    const windowChild = windowChildIterator.next().value;
    expect(windowChild.browserWindow).toBeInstanceOf(BrowserWindow);
  });

  test('window is hidden by default', () => {
    const App = () => <Window />;

    testRender(<App />);
    expect(BrowserWindow.mock.calls[0][0].show).toBe(false);
  });

  test('window can be shown', async () => {
    const App = () => <Window show />;

    testRender(<App />);
    expect(BrowserWindow.mock.calls[0][0].show).toBe(true);
  });

  test('update', async () => {
    BrowserWindow.mockClear();

    class App extends Component {
      state = {
        bool: false
      };

      // componentDidMount() {
      //   setTimeout(() => {
      //     this.setState({
      //       bool: true
      //     });
      //   }, 1000);
      // }

      render() {
        return <Window />;
      }
    }

    const wrapper = testRender(<App />);
    // await new Promise(resolve => setTimeout(resolve, 3000));
  });
});
