import { Menu as ElectronMenu } from 'electron';

import createEventManager from '../utils/create-event-manager';
import Base from './base';

/**
 * Menus are an interesting concept in Electron. You can create as many
 * instances of menus as you want, and they won't do anything until you either
 * set them as an applicationMenu or pop them up as a context menu.
 *
 * I think we can leverage this, by making their behaviour depend on where they
 * are rendered. e.g. we could make a menu inside a window the applicationMenu
 * when the window gets focus, or do something smart with context menus.
 *
 * For now, we'll start with a basic implementation.
 */
class Menu extends Base {
  constructor(props) {
    super(props);

    this.menu = new ElectronMenu();
    this.eventManager = createEventManager(this.menu);
  }

  getPublicInstance() {
    // TODO: think about whether we want to grant the user full access here
    return this.menu;
  }

  get propEvents() {
    return {};
  }

  /**
   * Note: we need to bind the handlers to preserve `this` context.
   */
  get propHandlers() {
    return {};
  }
}

export default Menu;
