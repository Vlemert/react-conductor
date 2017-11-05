import Window from './window';

const props = [];

const PropToEvent = {
  onWillFinishLaunching: 'will-finish-launching',
  onReady: 'ready',
  onWindowAllClosed: 'window-all-closed',
  onBeforeQuit: 'before-quit',
  onWillQuit: 'will-quit',
  onQuit: 'quit',
  onOpenFile: 'open-file',
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

  commitMount(instance, type, props) {
    // noop
  }

  commitUpdate() {
    // noop
  }
}

export default App;
