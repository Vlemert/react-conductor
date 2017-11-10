import React, { Component } from 'react';
import { app, Menu as ElectronMenu } from 'electron';

import { Menu } from '../index';
import { render } from '../index';

jest.mock('electron');
jest.useFakeTimers();

async function testRender(element, launchInfo) {
  const renderPromise = render(element);
  app.once.mock.calls[0][1](launchInfo);
  return renderPromise;
}

class MockMenu {
  constructor(...args) {
    this.args = args;
  }
}

describe('Menu', () => {
  let mockMenus = [];

  beforeEach(() => {
    mockMenus = [];
    ElectronMenu.mockReset();
    ElectronMenu.mockImplementation((...args) => {
      const newMenu = new MockMenu(...args);
      mockMenus.push(newMenu);
      return newMenu;
    });
    app.once = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    delete app.once;
  });

  test('can render', () => {
    const Application = () => <Menu />;

    testRender(<Application />);

    expect(mockMenus.length).toBe(1);
  });

  test('returns a `Menu` as ref', () => {
    let menuRef;
    const Application = () => (
      <Menu
        ref={ref => {
          menuRef = ref;
        }}
      />
    );

    testRender(<Application />);

    expect(menuRef).toBe(mockMenus[0]);
  });
});
