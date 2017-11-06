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

  // This is mainly here to test whether I could get this to work
  // Might want to move all the app.dock stuff to a different element
  handleDockBounce = dockBounce => {
    if (dockBounce) {
      this.dockBounceId = this.root.electronApp.dock.bounce(
        dockBounce === true ? undefined : dockBounce
      );
    } else {
      if (this.dockBounceId !== undefined) {
        this.root.electronApp.dock.cancelBounce(this.dockBounceId);
      }
    }
  };

  /**
   * An object containing all props that this elements can handle, with their
   * actual handlers.
   */
  get propHandlers() {
    return {
      dockBounce: this.handleDockBounce
    };
  }

  /**
   * First finalization pass. Here we check whether we'll need to do anything
   * in `commitMount` by checking if any of the handled props has a value.
   */
  finalizeInitialChildren(props) {
    let commitMount = false;

    Object.entries(props).forEach(([propKey, eventHandler]) => {
      if (this.propHandlers.hasOwnProperty(propKey)) {
        commitMount = true;
      }

      // TODO: move actual event registration to commitMount
      const eventName = PropToEvent[propKey];

      if (eventName) {
        this.root.electronApp.on(eventName, eventHandler);
      }
    });

    return commitMount;
  }

  /**
   * Handle any props that were passed in the initial mount of the element. We
   * should probably register any events here as well, instead of in
   * `finalizeInitialChildren`
   */
  commitMount(props) {
    Object.entries(props).forEach(([propKey, propValue]) => {
      if (this.propHandlers.hasOwnProperty(propKey)) {
        this.propHandlers[propKey](propValue);
      }
    });
  }

  /**
   * Diff all props and check whether we're handling them in this element
   * instance. If a handled prop was changed, return the change as
   * `updatePayload` so `commitUpdate` can work with the changes.
   *
   * `updatePayload` will be a list of tuples: [[propKey, newValue]]
   */
  prepareUpdate(oldProps, newProps) {
    const updatePayload = [];
    const mergedProps = {};

    Object.entries(oldProps).forEach(([key, value]) => {
      if (!this.propHandlers.hasOwnProperty(key)) {
        return;
      }

      mergedProps[key] = [value, undefined];
    });

    Object.entries(newProps).forEach(([key, value]) => {
      if (!this.propHandlers.hasOwnProperty(key)) {
        return;
      }

      if (mergedProps[key]) {
        mergedProps[key][1] = value;
        return;
      }

      mergedProps[key] = [undefined, value];
    });

    Object.entries(mergedProps).forEach(([propKey, [oldValue, newValue]]) => {
      if (oldValue !== newValue) {
        updatePayload.push([propKey, newValue]);
      }
    });

    return updatePayload.length ? updatePayload : null;
  }

  /**
   * Handle any props (that this element handles) that changed since the last
   * pass. See `prepareUpdate` for the origin / shape of `updatePayload`.
   */
  commitUpdate(updatePayload, oldProps, newProps) {
    updatePayload.forEach(([propKey, value]) => {
      if (this.propHandlers.hasOwnProperty(propKey)) {
        this.propHandlers[propKey](value);
      }
    });
  }
}

export default App;
