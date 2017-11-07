import React, { Component } from 'react';
import { Menu as ElectronMenu } from 'electron';

import { App, Menu } from '../index';
import testRender from '../test-renderer';

jest.mock('electron');
jest.useFakeTimers();

describe('Menu', () => {
  beforeEach(() => {
    ElectronMenu.mockReset();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('can render inside App', () => {
    const Application = () => (
      <App>
        <Menu />
      </App>
    );

    const wrapper = testRender(<Application />);

    expect(wrapper.appElement.childMenus.size).toBe(1);
    const childIterator = wrapper.appElement.childMenus.values();
    expect(childIterator.next().value.menu).toBeInstanceOf(ElectronMenu);
  });
});
