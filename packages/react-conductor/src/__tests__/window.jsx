import React, { Component } from 'react';
import { app, BrowserWindow } from 'electron';

import { Window } from '../index';
import { render } from '../index';

jest.mock('electron');
jest.useFakeTimers();

async function testRender(element, launchInfo) {
  const renderPromise = render(element);
  app.once.mock.calls[0][1](launchInfo);
  return renderPromise;
}

class MockBrowserWindow {
  constructor(...args) {
    this.args = args;
  }
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
  setPosition(...position) {
    this.position = position;
  }
  getPosition() {
    return this.position;
  }
  setMovable(resizable) {
    this.resizable = resizable;
  }
  getMovable() {
    return this.resizable;
  }
  loadURL = jest.fn();
  on = jest.fn();
  removeListener = jest.fn();
  destroy = jest.fn();
}

describe('Window', () => {
  let mockWindows = [];

  beforeEach(() => {
    mockWindows = [];
    BrowserWindow.mockReset();
    BrowserWindow.mockImplementation((...args) => {
      const newWindow = new MockBrowserWindow(...args);
      mockWindows.push(newWindow);
      return newWindow;
    });
    app.once = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    delete app.once;
  });

  test('renders', () => {
    const Application = () => <Window />;

    testRender(<Application />);

    expect(mockWindows.length).toBe(1);
  });

  test('unmounts', () => {
    class Application extends React.Component {
      state = {
        render: true
      };

      componentDidMount() {
        setTimeout(() => {
          this.setState({
            render: false
          });
        }, 2000);
      }

      render() {
        return this.state.render && <Window />;
      }
    }

    testRender(<Application />);

    expect(mockWindows.length).toBe(1);
    expect(mockWindows[0].destroy).not.toBeCalled();

    jest.runTimersToTime(2000);
    expect(mockWindows[0].destroy).toBeCalled();
  });

  test('can render more than once', () => {
    const Application = () => [<Window key="1" />, <Window key="2" />];

    testRender(<Application />);

    expect(mockWindows.length).toBe(2);
  });

  test('returns a `BrowserWindow` as ref', () => {
    let windowRef;
    const Application = () => (
      <Window
        ref={ref => {
          windowRef = ref;
        }}
      />
    );

    testRender(<Application />);

    expect(windowRef).toBe(mockWindows[0]);
  });

  test('can be nested', () => {
    const Application = () => (
      <Window>
        <Window>
          <Window />
        </Window>
      </Window>
    );

    testRender(<Application />);

    expect(mockWindows.length).toBe(3);

    expect(mockWindows[0].args[0].parent).toBeUndefined();
    expect(mockWindows[1].args[0].parent).toBe(mockWindows[0]);
    expect(mockWindows[2].args[0].parent).toBe(mockWindows[1]);
  });

  describe('registers child windows correctly', () => {
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
          return <Window>{this.state.childWindow && <Window />}</Window>;
        }
      }

      testRender(<Application />);
    });

    test('when adding', () => {
      // Again, there is currently no way to test this, as it's not visible
      // from the outside that the windows are nested.
    });

    test('when removing', () => {
      jest.runTimersToTime(2000);
      // Again, there is currently no way to test this, as it's not visible
      // from the outside that the windows are nested.

      expect(mockWindows[0].destroy).not.toBeCalled();
      expect(mockWindows[1].destroy).toBeCalled();
    });
  });

  test('is hidden by default', () => {
    const Application = () => <Window />;

    testRender(<Application />);
    expect(mockWindows[0].args).toEqual([
      {
        show: false
      }
    ]);
  });

  test('can be shown', async () => {
    const Application = () => <Window show />;

    testRender(<Application />);
    expect(mockWindows[0].args).toEqual([
      {
        show: true
      }
    ]);
  });

  test('handles `path` prop', () => {
    class Application extends React.Component {
      state = {
        path: 'path/to/initial/file.html'
      };

      componentDidMount() {
        setTimeout(() => {
          this.setState({
            path: 'path/to/other/file.html'
          });
        }, 2000);
      }

      render() {
        return <Window path={this.state.path} />;
      }
    }

    testRender(<Application />);
    const mockWindow = mockWindows[0];
    expect(mockWindow.loadURL).toBeCalledWith(
      'file://path/to/initial/file.html'
    );

    jest.runTimersToTime(2000);

    expect(mockWindow.loadURL).toBeCalledWith('file://path/to/other/file.html');
  });

  describe('correctly handles `defaultSize`, `size`, and `onResize`', () => {
    describe('on mount', () => {
      test('if only `defaultSize` is set', () => {
        const Application = () => <Window defaultSize={[100, 200]} />;

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getSize()).toEqual([100, 200]);
        expect(mockWindow.getResizable()).toBe(true);
      });

      test('if only `size` is set', () => {
        const Application = () => <Window size={[100, 200]} />;

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getSize()).toEqual([100, 200]);
        expect(mockWindow.getResizable()).toBe(false);
      });

      test('if `size` and `onResize` are set', () => {
        const onResize = jest.fn();
        const Application = () => (
          <Window size={[100, 200]} onResize={onResize} />
        );

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getSize()).toEqual([100, 200]);
        expect(mockWindow.getResizable()).toBe(true);
        expect(mockWindow.on).toBeCalled();
        expect(mockWindow.on.mock.calls[0][0]).toBe('resize');
        const onResizeHandler = mockWindow.on.mock.calls[0][1];
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
            return <Window defaultSize={this.state.defaultSize} />;
          }
        }

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getSize()).toEqual([100, 200]);
        expect(mockWindow.getResizable()).toBe(true);

        jest.runTimersToTime(2000);

        // TODO: we probably shouldn't allow this, update the test once we
        // update the implementation
        expect(mockWindow.getSize()).toEqual([200, 400]);
        expect(mockWindow.getResizable()).toBe(true);
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
            return <Window size={this.state.size} />;
          }
        }

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getSize()).toEqual([100, 200]);
        expect(mockWindow.getResizable()).toBe(false);

        jest.runTimersToTime(2000);

        expect(mockWindow.getSize()).toEqual([200, 400]);
        expect(mockWindow.getResizable()).toBe(false);
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
              <Window size={this.state.size} onResize={this.state.onResize} />
            );
          }
        }

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getSize()).toEqual([100, 200]);
        expect(mockWindow.getResizable()).toBe(true);
        expect(mockWindow.on).toBeCalled();
        expect(mockWindow.on.mock.calls[0][0]).toBe('resize');
        const onResizeHandler1 = mockWindow.on.mock.calls[0][1];
        onResizeHandler1();
        expect(onResize1).toBeCalledWith([100, 200]);

        mockWindow.on.mockClear();
        onResize1.mockClear();
        onResize2.mockClear();
        jest.runTimersToTime(2000);

        expect(mockWindow.getSize()).toEqual([200, 400]);
        expect(mockWindow.getResizable()).toBe(true);
        expect(mockWindow.on).not.toBeCalled();

        mockWindow.on.mockClear();
        onResize1.mockClear();
        onResize2.mockClear();
        jest.runTimersToTime(2000);

        expect(mockWindow.getSize()).toEqual([200, 400]);
        expect(mockWindow.getResizable()).toBe(true);
        expect(mockWindow.removeListener).toBeCalled();
        expect(mockWindow.removeListener.mock.calls[0][0]).toBe('resize');
        expect(mockWindow.on).toBeCalled();
        expect(mockWindow.on.mock.calls[0][0]).toBe('resize');
        const onResizeHandler2 = mockWindow.on.mock.calls[0][1];
        onResizeHandler2();
        expect(onResize1).not.toBeCalled();
        expect(onResize2).toBeCalledWith([200, 400]);
      });
    });
  });

  describe('correctly handles `defaultPosition`, `position`, and `onMove`', () => {
    describe('on mount', () => {
      test('if only `defaultPosition` is set', () => {
        const Application = () => <Window defaultPosition={[100, 200]} />;

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getPosition()).toEqual([100, 200]);
        expect(mockWindow.getMovable()).toBe(true);
      });

      test('if only `position` is set', () => {
        const Application = () => <Window position={[100, 200]} />;

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getPosition()).toEqual([100, 200]);
        expect(mockWindow.getMovable()).toBe(false);
      });

      test('if `position` and `onMove` are set', () => {
        const onMove = jest.fn();
        const Application = () => (
          <Window position={[100, 200]} onMove={onMove} />
        );

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getPosition()).toEqual([100, 200]);
        expect(mockWindow.getMovable()).toBe(true);
        expect(mockWindow.on).toBeCalled();
        expect(mockWindow.on.mock.calls[0][0]).toBe('move');
        const onMoveHandler = mockWindow.on.mock.calls[0][1];
        onMoveHandler();
        expect(onMove).toBeCalledWith([100, 200]);
      });
    });

    describe('on update', () => {
      test('if only `defaultPosition` is set', () => {
        class Application extends React.Component {
          state = {
            defaultPosition: [100, 200]
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                defaultPosition: [200, 400]
              });
            }, 2000);
          }

          render() {
            return <Window defaultPosition={this.state.defaultPosition} />;
          }
        }

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getPosition()).toEqual([100, 200]);
        expect(mockWindow.getMovable()).toBe(true);

        jest.runTimersToTime(2000);

        // TODO: we probably shouldn't allow this, update the test once we
        // update the implementation
        expect(mockWindow.getPosition()).toEqual([200, 400]);
        expect(mockWindow.getMovable()).toBe(true);
      });

      test('if only `position` is set', () => {
        class Application extends React.Component {
          state = {
            position: [100, 200]
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                position: [200, 400]
              });
            }, 2000);
          }

          render() {
            return <Window position={this.state.position} />;
          }
        }

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getPosition()).toEqual([100, 200]);
        expect(mockWindow.getMovable()).toBe(false);

        jest.runTimersToTime(2000);

        expect(mockWindow.getPosition()).toEqual([200, 400]);
        expect(mockWindow.getMovable()).toBe(false);
      });

      test('if `position` and `onMove` are set', () => {
        const onMove1 = jest.fn();
        const onMove2 = jest.fn();

        class Application extends React.Component {
          state = {
            position: [100, 200],
            onMove: onMove1
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                position: [200, 400]
              });

              setTimeout(() => {
                this.setState({
                  onMove: onMove2
                });
              }, 2000);
            }, 2000);
          }

          render() {
            return (
              <Window
                position={this.state.position}
                onMove={this.state.onMove}
              />
            );
          }
        }

        testRender(<Application />);
        const mockWindow = mockWindows[0];
        expect(mockWindow.getPosition()).toEqual([100, 200]);
        expect(mockWindow.getMovable()).toBe(true);
        expect(mockWindow.on).toBeCalled();
        expect(mockWindow.on.mock.calls[0][0]).toBe('move');
        const onMoveHandler1 = mockWindow.on.mock.calls[0][1];
        onMoveHandler1();
        expect(onMove1).toBeCalledWith([100, 200]);

        mockWindow.on.mockClear();
        onMove1.mockClear();
        onMove2.mockClear();
        jest.runTimersToTime(2000);

        expect(mockWindow.getPosition()).toEqual([200, 400]);
        expect(mockWindow.getMovable()).toBe(true);
        expect(mockWindow.on).not.toBeCalled();

        mockWindow.on.mockClear();
        onMove1.mockClear();
        onMove2.mockClear();
        jest.runTimersToTime(2000);

        expect(mockWindow.getPosition()).toEqual([200, 400]);
        expect(mockWindow.getMovable()).toBe(true);
        expect(mockWindow.removeListener).toBeCalled();
        expect(mockWindow.removeListener.mock.calls[0][0]).toBe('move');
        expect(mockWindow.on).toBeCalled();
        expect(mockWindow.on.mock.calls[0][0]).toBe('move');
        const onMoveHandler2 = mockWindow.on.mock.calls[0][1];
        onMoveHandler2();
        expect(onMove1).not.toBeCalled();
        expect(onMove2).toBeCalledWith([200, 400]);
      });
    });
  });
});
