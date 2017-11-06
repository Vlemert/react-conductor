import React, { Component } from 'react';
import { BrowserWindow } from 'electron';

import { App, Window } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');

describe('Window', () => {
  beforeEach(() => {
    BrowserWindow.mockReset();
  });

  test('can render inside App', () => {
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

  test('can render more than once in App', () => {
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

  test('can be nested', () => {
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

  test('is hidden by default', () => {
    const Application = () => (
      <App>
        <Window />
      </App>
    );

    testRender(<Application />);
    expect(BrowserWindow.mock.calls[0][0].show).toBe(false);
  });

  test('can be shown', async () => {
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
