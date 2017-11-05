import { app } from 'electron';

import Window from './window';

// This creates the document instance
class App {
  constructor() {
    this.electronApp = app;

    this.childWindows = new Set();
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

export default App;
