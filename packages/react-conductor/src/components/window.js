import { BrowserWindow } from 'electron';

import Base from './base';

class Window extends Base {
  constructor(root, props) {
    super(root, props);

    this.childWindows = new Set();

    this.browserWindow = new BrowserWindow({
      show: !!props.show
    });
  }

  appendChild(child) {
    if (child instanceof Window) {
      this.childWindows.add(child);
    }
  }

  removeChild(child) {
    if (child instanceof Window) {
      this.childWindows.delete(child);
    }
  }

  getPublicInstance() {
    // TODO: think about whether we want to grant the user full access here
    return this.browserWindow;
  }
}

export default Window;
