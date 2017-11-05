import { app } from 'electron';

import App from './app';

class Root {
  constructor() {
    this.electronApp = app;
  }

  appendChild(child) {
    // Not sure if we want to enforce this, but don't want to deal with the
    // repercussions of not enforcing this right now. (windows being children
    // of root etc)
    if (!(child instanceof App)) {
      throw new Error('Root element should be an App!');
    }

    this.appElement = child;
  }

  removeChild(child) {
    this.appElement = null;
  }
}

export default Root;
