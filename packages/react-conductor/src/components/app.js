import { app } from 'electron';

import createEventManager from '../utils/create-event-manager';
import Base from './base';
import Window from './window';
import Menu from './menu';

class App extends Base {
  constructor(props, rootContainerInstance) {
    super(props);

    this.electronApp = app;
    this.launchInfo = rootContainerInstance.launchInfo;
    this.eventManager = createEventManager(this.electronApp);
  }

  getPublicInstance() {
    // TODO: think about whether we want to grant the user full access here
    return this.electronApp;
  }

  // This is mainly here to test whether I could get this to work
  // Might want to move all the app.dock stuff to a different element
  handleDockBounce(newValue) {
    if (newValue) {
      this.dockBounceId = this.electronApp.dock.bounce(
        newValue === true ? undefined : newValue
      );
    } else {
      if (this.dockBounceId !== undefined) {
        this.electronApp.dock.cancelBounce(this.dockBounceId);
      }
    }
  }

  handleInit(onInit) {
    onInit(process.argv, process.cwd());
  }

  handleOnReady(onReady) {
    onReady(this.launchInfo);
  }

  handleEvent(event) {
    // TODO: can we move this to base?
    return newValue => {
      this.eventManager(event, newValue);
    };
  }

  get propEvents() {
    return {
      onWillFinishLaunching: 'will-finish-launching',
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
      dockBounce: this.handleDockBounce.bind(this),
      // onInit is a hook users can use to access the `process.argv` and
      // `process.cwd()` values. This prop/handler can later on also be called
      // when we implement `app.makeSingleInstance(callback)`, making the API
      // uniform to the user. Note the array notation which makes sure this
      // prop only gets called on mount.
      onInit: [this.handleInit.bind(this)],
      // As we wait with rendering anything until the `app.onReady` event is
      // called, we have to call it ourselves on mount.
      onReady: [this.handleOnReady.bind(this)]
    };
  }
}

export default App;
