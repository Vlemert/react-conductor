import React, { Component } from 'react';
import { BrowserWindow } from 'electron';

import { App, Window } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');
jest.useFakeTimers();

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

  test('returns a `BrowserWindow` as ref', () => {
    let windowRef;
    const Application = () => (
      <App>
        <Window
          ref={ref => {
            windowRef = ref;
          }}
        />
      </App>
    );

    testRender(<Application />);

    expect(windowRef).toBeInstanceOf(BrowserWindow);
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

  describe('registers child windows correctly', () => {
    let wrapper;
    beforeEach(() => {
      class Application extends React.Component {
        state = {
          childWindow: true
        };

        componentDidMount() {
          setTimeout(() => {
            this.setState({
              childWindow: false
            });
          }, 2000);
        }

        render() {
          return (
            <App>
              <Window>{this.state.childWindow && <Window />}</Window>
            </App>
          );
        }
      }

      wrapper = testRender(<Application />);
    });

    test('when adding', () => {
      const appChildIterator = wrapper.appElement.childWindows.values();
      const appChild = appChildIterator.next().value;
      expect(appChild.childWindows.size).toBe(1);
    });

    test('when removing', () => {
      jest.runTimersToTime(2000);
      const appChildIterator = wrapper.appElement.childWindows.values();
      const appChild = appChildIterator.next().value;
      expect(appChild.childWindows.size).toBe(0);
    });
  });

  describe('does nothing with non-window children', () => {
    let wrapper;
    beforeEach(() => {
      class Application extends React.Component {
        state = {
          child: true
        };

        componentDidMount() {
          setTimeout(() => {
            this.setState({
              child: false
            });
          }, 2000);
        }

        render() {
          return (
            <App>
              <Window>{this.state.child && <App />}</Window>
            </App>
          );
        }
      }

      wrapper = testRender(<Application />);
    });

    test('when adding', () => {
      const appChildIterator = wrapper.appElement.childWindows.values();
      const appChild = appChildIterator.next().value;
      expect(appChild.childWindows.size).toBe(0);
    });

    test('when removing', () => {
      jest.runTimersToTime(2000);
      const appChildIterator = wrapper.appElement.childWindows.values();
      const appChild = appChildIterator.next().value;
      expect(appChild.childWindows.size).toBe(0);
    });
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

  describe('correctly handles `defaultSize`, `size`, and `onResize`', () => {
    class BrowserWindowMock {
      setSize(...size) {
        this.size = size;
      }
      getSize() {
        return this.size;
      }
      setResizable(resizable) {
        this.resizable = resizable;
      }
      getResizable() {
        return this.resizable;
      }
      on = jest.fn();
      removeListener = jest.fn();
    }

    let browserWindowInstance;

    beforeEach(() => {
      BrowserWindow.mockImplementation(() => {
        browserWindowInstance = new BrowserWindowMock();
        return browserWindowInstance;
      });
    });

    afterEach(() => {
      BrowserWindow.mockClear();
    });

    describe('on mount', () => {
      test('if only `defaultSize` is set', () => {
        const Application = () => (
          <App>
            <Window defaultSize={[100, 200]} />
          </App>
        );

        testRender(<Application />);
        expect(browserWindowInstance.getSize()).toEqual([100, 200]);
        expect(browserWindowInstance.getResizable()).toBe(true);
      });

      test('if only `size` is set', () => {
        const Application = () => (
          <App>
            <Window size={[100, 200]} />
          </App>
        );

        testRender(<Application />);
        expect(browserWindowInstance.getSize()).toEqual([100, 200]);
        expect(browserWindowInstance.getResizable()).toBe(false);
      });

      test('if `size` and `onResize` are set', () => {
        const onResize = jest.fn();
        const Application = () => (
          <App>
            <Window size={[100, 200]} onResize={onResize} />
          </App>
        );

        testRender(<Application />);
        expect(browserWindowInstance.getSize()).toEqual([100, 200]);
        expect(browserWindowInstance.getResizable()).toBe(true);
        expect(browserWindowInstance.on).toBeCalled();
        expect(browserWindowInstance.on.mock.calls[0][0]).toBe('resize');
        const onResizeHandler = browserWindowInstance.on.mock.calls[0][1];
        onResizeHandler();
        expect(onResize).toBeCalledWith([100, 200]);
      });
    });

    describe('on update', () => {
      test('if only `defaultSize` is set', () => {
        class Application extends React.Component {
          state = {
            defaultSize: [100, 200]
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                defaultSize: [200, 400]
              });
            }, 2000);
          }

          render() {
            return (
              <App>
                <Window defaultSize={this.state.defaultSize} />
              </App>
            );
          }
        }

        testRender(<Application />);
        expect(browserWindowInstance.getSize()).toEqual([100, 200]);
        expect(browserWindowInstance.getResizable()).toBe(true);

        jest.runTimersToTime(2000);

        // TODO: we probably shouldn't allow this, update the test once we
        // update the implementation
        expect(browserWindowInstance.getSize()).toEqual([200, 400]);
        expect(browserWindowInstance.getResizable()).toBe(true);
      });

      test('if only `size` is set', () => {
        class Application extends React.Component {
          state = {
            size: [100, 200]
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                size: [200, 400]
              });
            }, 2000);
          }

          render() {
            return (
              <App>
                <Window size={this.state.size} />
              </App>
            );
          }
        }

        testRender(<Application />);
        expect(browserWindowInstance.getSize()).toEqual([100, 200]);
        expect(browserWindowInstance.getResizable()).toBe(false);

        jest.runTimersToTime(2000);

        expect(browserWindowInstance.getSize()).toEqual([200, 400]);
        expect(browserWindowInstance.getResizable()).toBe(false);
      });

      test('if `size` and `onResize` are set', () => {
        const onResize1 = jest.fn();
        const onResize2 = jest.fn();

        class Application extends React.Component {
          state = {
            size: [100, 200],
            onResize: onResize1
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                size: [200, 400]
              });

              setTimeout(() => {
                this.setState({
                  onResize: onResize2
                });
              }, 2000);
            }, 2000);
          }

          render() {
            return (
              <App>
                <Window size={this.state.size} onResize={this.state.onResize} />
              </App>
            );
          }
        }

        testRender(<Application />);
        expect(browserWindowInstance.getSize()).toEqual([100, 200]);
        expect(browserWindowInstance.getResizable()).toBe(true);
        expect(browserWindowInstance.on).toBeCalled();
        expect(browserWindowInstance.on.mock.calls[0][0]).toBe('resize');
        const onResizeHandler1 = browserWindowInstance.on.mock.calls[0][1];
        onResizeHandler1();
        expect(onResize1).toBeCalledWith([100, 200]);

        browserWindowInstance.on.mockClear();
        onResize1.mockClear();
        onResize2.mockClear();
        jest.runTimersToTime(2000);

        expect(browserWindowInstance.getSize()).toEqual([200, 400]);
        expect(browserWindowInstance.getResizable()).toBe(true);
        expect(browserWindowInstance.on).not.toBeCalled();

        browserWindowInstance.on.mockClear();
        onResize1.mockClear();
        onResize2.mockClear();
        jest.runTimersToTime(2000);

        expect(browserWindowInstance.getSize()).toEqual([200, 400]);
        expect(browserWindowInstance.getResizable()).toBe(true);
        expect(browserWindowInstance.removeListener).toBeCalled();
        expect(browserWindowInstance.removeListener.mock.calls[0][0]).toBe(
          'resize'
        );
        expect(browserWindowInstance.on).toBeCalled();
        expect(browserWindowInstance.on.mock.calls[0][0]).toBe('resize');
        const onResizeHandler2 = browserWindowInstance.on.mock.calls[0][1];
        onResizeHandler2();
        expect(onResize1).not.toBeCalled();
        expect(onResize2).toBeCalledWith([200, 400]);
      });
    });
  });
});
