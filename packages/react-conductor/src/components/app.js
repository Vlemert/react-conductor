import Base from './base';
import Window from './window';

class App extends Base {
  constructor(root, props) {
    super(root, props);

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

  // This is mainly here to test whether I could get this to work
  // Might want to move all the app.dock stuff to a different element
  handleDockBounce(newValue) {
    if (newValue) {
      this.dockBounceId = this.root.electronApp.dock.bounce(
        newValue === true ? undefined : newValue
      );
    } else {
      if (this.dockBounceId !== undefined) {
        this.root.electronApp.dock.cancelBounce(this.dockBounceId);
      }
    }
  }

  handleEvent(event) {
    // TODO: make event handling more generic + remove old handlers on change
    return (newValue, oldValue) => {
      this.root.electronApp.on(event, newValue);
    };
  }

  get propEvents() {
    return {
      onWillFinishLaunching: 'will-finish-launching',
      // Will not trigger because we wait with rendering until this event has
      // passed. Should probably call this in commitMount if set
      onReady: 'ready',
      onWindowAllClosed: 'window-all-closed',
      onBeforeQuit: 'before-quit',
      onWillQuit: 'will-quit',
      onQuit: 'quit',
      // open-file needs to be registered very early, should probably do that in
      // the constructor and call the prop/handler in commitMount
      onOpenFile: 'open-file',
      // Same as open-file
      onOpenUrl: 'open-url',
      onActivate: 'activate',
      onContinueActivity: 'continue-activity',
      onNewWindowForTab: 'new-window-for-tab',
      onBrowserWindowBlur: 'browser-window-blur',
      onBrowserWindowFocus: 'browser-window-focus',
      onBrowserWindowCreated: 'browser-window-created',
      onWebContentsCreated: 'web-contents-created',
      onCertificateError: 'certificate-error',
      onSelectClientCertificate: 'select-client-certificate',
      onLogin: 'login',
      onGpuProcessCrashed: 'gpu-process-crashed',
      onAccessibilitySupportChanged: 'accessibility-support-changed'
    };
  }

  /**
   * Note: we need to bind the handlers to preserve `this` context.
   */
  get propHandlers() {
    return {
      dockBounce: this.handleDockBounce.bind(this)
    };
  }
}

export default App;
