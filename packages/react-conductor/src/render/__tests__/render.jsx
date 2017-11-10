import React from 'react';
import { app, BrowserWindow } from 'electron';

import { Window } from '../../index';
import render from '../index';

jest.mock('electron');

/**
 * We should probably reorganize the tests. This no longer tests `Root`.
 */
describe('render', () => {
  beforeEach(() => {
    BrowserWindow.mockReset();
    app.once = jest.fn();
  });

  afterEach(() => {
    delete app.once;
  });

  async function testRender(element) {
    const renderPromise = render(element);
    app.once.mock.calls[0][1]();
    return renderPromise;
  }

  test('returns the component instance of the root element passed to it', async () => {
    class Application extends React.Component {
      render() {
        return <Window />;
      }
    }

    const renderResult = await testRender(<Application />);

    expect(renderResult).toBeInstanceOf(Application);
  });

  test('throws when trying to render a string', async () => {
    // Hide react error details from the console
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const Application = () => 'hello';

    await expect(testRender(<Application />)).rejects.toMatchSnapshot();

    // And restore console.error behaviour
    console.error = originalConsoleError;
  });

  test('throws when trying to render an invalid component', async () => {
    // Hide react error details from the console
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const Fake = 'fake';
    const Application = () => <Fake />;

    await expect(testRender(<Application />)).rejects.toMatchSnapshot();

    // And restore console.error behaviour
    console.error = originalConsoleError;
  });
});
