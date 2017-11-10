import React from 'react';
import { app } from 'electron';

import { App } from '../index';
import { render } from '../index';

jest.mock('electron');
jest.useFakeTimers();

// TODO: this is the same in three test files already
async function testRender(element, launchInfo) {
  const renderPromise = render(element);
  app.once.mock.calls[0][1](launchInfo);
  return renderPromise;
}

describe('App', () => {
  beforeEach(() => {
    app.once = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    delete app.once;
  });

  test('app events are registered, updated, and removed', () => {
    const handler1 = () => {};
    const handler2 = () => {};

    app.on = jest.fn();
    app.removeListener = jest.fn();

    class Application extends React.Component {
      state = {
        blurHandler: handler1
      };

      componentDidMount() {
        setTimeout(() => {
          this.setState({
            blurHandler: handler2
          });

          setTimeout(() => {
            this.setState({
              blurHandler: undefined
            });
          }, 2000);
        }, 2000);
      }

      render() {
        return <App onBrowserWindowBlur={this.state.blurHandler} />;
      }
    }

    testRender(<Application />);

    expect(app.on).toBeCalledWith('browser-window-blur', handler1);
    expect(app.removeListener).not.toBeCalled();

    app.on.mockClear();
    app.removeListener.mockClear();
    jest.runTimersToTime(2000);

    expect(app.removeListener).toBeCalledWith('browser-window-blur', handler1);
    expect(app.on).toBeCalledWith('browser-window-blur', handler2);

    app.on.mockClear();
    app.removeListener.mockClear();
    jest.runTimersToTime(2000);

    expect(app.removeListener).toBeCalledWith('browser-window-blur', handler2);

    delete app.on;
    delete app.removeListener;
  });

  test('returns `app` as ref', () => {
    let appRef;
    const Application = () => (
      <App
        ref={ref => {
          appRef = ref;
        }}
      />
    );

    testRender(<Application />);

    expect(appRef).toBe(app);
  });

  test('calls `onInit` props with process.argv and process.cwd()', () => {
    const onInit = jest.fn();
    const Application = () => <App onInit={onInit} />;

    testRender(<Application />);

    expect(onInit).toBeCalledWith(process.argv, process.cwd());
  });

  test('calls `onReady` with launchInfo', () => {
    const onReady = jest.fn();
    const Application = () => <App onReady={onReady} />;

    const launchInfo = {};
    testRender(<Application />, launchInfo);

    expect(onReady).toBeCalledWith(launchInfo);
  });

  describe('correctly handles dockBounce', () => {
    const bounceId = 100;
    beforeEach(() => {
      app.dock = {
        bounce: jest.fn(() => bounceId),
        cancelBounce: jest.fn()
      };
    });

    afterEach(() => {
      delete app.dock;
    });

    describe('on mount', () => {
      test('if not set', () => {
        const Application = () => <App />;

        testRender(<Application />);

        expect(app.dock.bounce).not.toBeCalled();
      });

      test('if false', () => {
        const Application = () => <App dockBounce={false} />;

        testRender(<Application />);

        expect(app.dock.bounce).not.toBeCalled();
      });

      test('if true', () => {
        const Application = () => <App dockBounce />;

        testRender(<Application />);

        expect(app.dock.bounce).toBeCalledWith(undefined);
      });

      test('if any other value', () => {
        const Application = () => <App dockBounce="some value" />;

        testRender(<Application />);

        expect(app.dock.bounce).toBeCalledWith('some value');
      });
    });

    describe('on update', () => {
      test('from unset to set and back', () => {
        class Application extends React.Component {
          state = {
            dockBounce: undefined
          };

          componentDidMount() {
            setTimeout(() => {
              this.setState({
                dockBounce: true
              });

              setTimeout(() => {
                this.setState({
                  dockBounce: 'some value'
                });

                setTimeout(() => {
                  this.setState({
                    dockBounce: undefined
                  });
                }, 2000);
              }, 2000);
            }, 2000);
          }

          render() {
            return <App dockBounce={this.state.dockBounce} />;
          }
        }

        testRender(<Application />);

        expect(app.dock.bounce).not.toBeCalled();
        jest.runTimersToTime(2000);
        expect(app.dock.bounce).toBeCalledWith(undefined);
        jest.runTimersToTime(2000);
        expect(app.dock.bounce).toBeCalledWith('some value');
        jest.runTimersToTime(2000);
        expect(app.dock.cancelBounce).toBeCalledWith(bounceId);
      });
    });
  });
});
