import React, { Component } from 'react';
import { app, BrowserWindow } from 'electron';

import { App, Window, render } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');

describe('renderer', () => {
  beforeEach(() => {
    BrowserWindow.mockReset();
  });

  test('renders a root', () => {
    const Application = () => null;

    const wrapper = testRender(<Application />);

    expect(wrapper.electronApp).toBe(app);
  });

  test('throws if the root element is not an App', () => {
    // Hide react error details from the console
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const Application = () => <Window />;

    expect(() => testRender(<Application />)).toThrowErrorMatchingSnapshot();

    // And restore console.error behaviour
    console.error = originalConsoleError;
  });

  test('renders an app', () => {
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

  test('renders a window', () => {
    const Application = () => (
      <App>
        <Window />
      </App>
    );

    const wrapper = testRender(<Application />);

    expect(wrapper.appElement.childWindows.size).toBe(1);
    const childIterator = wrapper.appElement.childWindows.values();
    expect(childIterator.next().value.browserWindow).toBeInstanceOf(
      BrowserWindow
    );
  });

  test('renders multiple windows', () => {
    const Application = () => (
      <App>
        <Window key="1" />
        <Window key="2" />
      </App>
    );

    const wrapper = testRender(<Application />);

    expect(wrapper.appElement.childWindows.size).toBe(2);
    const childIterator = wrapper.appElement.childWindows.values();
    expect(childIterator.next().value.browserWindow).toBeInstanceOf(
      BrowserWindow
    );
    expect(childIterator.next().value.browserWindow).toBeInstanceOf(
      BrowserWindow
    );
  });

  test('renders windows in windows', () => {
    const Application = () => (
      <App>
        <Window>
          <Window />
        </Window>
      </App>
    );

    const wrapper = testRender(<Application />);

    expect(wrapper.appElement.childWindows.size).toBe(1);
    const appChildIterator = wrapper.appElement.childWindows.values();
    const appChild = appChildIterator.next().value;
    expect(appChild.browserWindow).toBeInstanceOf(BrowserWindow);

    expect(appChild.childWindows.size).toBe(1);
    const windowChildIterator = appChild.childWindows.values();
    const windowChild = windowChildIterator.next().value;
    expect(windowChild.browserWindow).toBeInstanceOf(BrowserWindow);
  });

  test('window is hidden by default', () => {
    const Application = () => (
      <App>
        <Window />
      </App>
    );

    testRender(<Application />);
    expect(BrowserWindow.mock.calls[0][0].show).toBe(false);
  });

  test('window can be shown', async () => {
    const Application = () => (
      <App>
        <Window show />
      </App>
    );

    testRender(<Application />);
    expect(BrowserWindow.mock.calls[0][0].show).toBe(true);
  });

  test('update', async () => {
    BrowserWindow.mockClear();

    class Application extends Component {
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
        return (
          <App>
            <Window />
          </App>
        );
      }
    }

    const wrapper = testRender(<Application />);
    // await new Promise(resolve => setTimeout(resolve, 3000));
  });
});
