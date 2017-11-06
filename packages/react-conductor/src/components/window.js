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
}

export default Window;
