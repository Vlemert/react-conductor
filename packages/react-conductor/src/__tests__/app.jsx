import React from 'react';
import { app } from 'electron';

import { App, Window } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');
jest.useFakeTimers();

describe('App', () => {
  test('can render', () => {
    const Application = () => <App />;

    const wrapper = testRender(<Application />);

    // Not sure what to assert here..
    expect(wrapper.appElement.root.electronApp).toBe(app);
  });

  test('registers app events', () => {
    app.on = jest.fn();

    const blurHandler = () => {};
    const Application = () => <App onBrowserWindowBlur={blurHandler} />;

    testRender(<Application />);

    expect(app.on).toBeCalledWith('browser-window-blur', blurHandler);
    delete app.on;
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
          return <App>{this.state.childWindow && <Window />}</App>;
        }
      }

      wrapper = testRender(<Application />);
    });

    test('when adding', () => {
      expect(wrapper.appElement.childWindows.size).toBe(1);
    });

    test('when removing', () => {
      jest.runTimersToTime(2000);
      expect(wrapper.appElement.childWindows.size).toBe(0);
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
          return <App>{this.state.child && <App />}</App>;
        }
      }

      wrapper = testRender(<Application />);
    });

    test('when adding', () => {
      expect(wrapper.appElement.childWindows.size).toBe(0);
    });

    test('when removing', () => {
      jest.runTimersToTime(2000);
      expect(wrapper.appElement.childWindows.size).toBe(0);
    });
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
