import Window from './window';

const props = [];

const PropToEvent = {
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

class App {
  constructor(root, props) {
    this.root = root;
    this.props = props;

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

  finalizeInitialChildren(props) {
    Object.entries(props).forEach(([propKey, eventHandler]) => {
      const eventName = PropToEvent[propKey];

      if (eventName) {
        this.root.electronApp.on(eventName, eventHandler);
      }
    });

    return false;
  }

  // This is mainly here to test whether I could get this to work
  // Might want to move all the app.dock stuff to a different element
  handleDockBounce = dockBounce => {
    if (dockBounce) {
      this.dockBounceId = this.root.electronApp.dock.bounce(
        dockBounce === true ? undefined : dockBounce
      );
    } else {
      this.root.electronApp.dock.cancelBounce(this.dockBounceId);
    }
  };

  commitMount(props) {
    this.handleDockBounce(props.dockBounce);
  }

  commitUpdate(oldProps, newProps) {
    if (oldProps.dockBounce !== newProps.dockBounce) {
      this.handleDockBounce(newProps.dockBounce);
    }
  }
}

export default App;
