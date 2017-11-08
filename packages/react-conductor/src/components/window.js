import { BrowserWindow } from 'electron';

import createEventManager from '../utils/create-event-manager';
import Base from './base';

class Window extends Base {
  constructor(props) {
    super(props);

    this.childWindows = new Set();

    this.browserWindow = new BrowserWindow({
      show: !!props.show
    });
    this.eventManager = createEventManager(this.browserWindow);
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

  handleEvent(event) {
    // TODO: can we move this to base?
    return newValue => {
      this.eventManager(event, newValue);
    };
  }

  /**
   * This handler will make sure the `defaultSize`, `size`, and `onResize` props
   * are handled correctly. It will
   *
   * We can probably improve this code by looking at the implementation in the
   * react codebase (ReactDOMFiberInput.js for example).
   */
  handleSize(propValue, newProps, oldProps) {
    // TODO: fix this check, only do it in dev (need to setup environments)
    // if (oldProps && newProps.defaultSize !== oldProps.defaultSize) {
    //   console.log(newProps.defaultSize, oldProps.defaultSize);
    //   console.warn('You cannot change the value of `defaultSize` after mount');
    // }

    if (
      (!oldProps && newProps.onResize) ||
      (oldProps && newProps.onResize !== oldProps.onResize)
    ) {
      this.eventManager('resize', () => {
        newProps.onResize(this.browserWindow.getSize());
      });
    }

    if (!newProps.defaultSize && !newProps.size) {
      this.browserWindow.setResizable(true);
      return;
    }

    // TODO: only do this on mount?
    if (newProps.defaultSize) {
      this.browserWindow.setSize(...newProps.defaultSize);
      this.browserWindow.setResizable(true);
      return;
    }

    if (newProps.size && !newProps.onResize) {
      // TODO: reactdom would warn if you do this, something like:
      // "If the field should be mutable use `defaultValue`. Otherwise, set
      // either `onChange` or `readOnly`."
      this.browserWindow.setSize(...newProps.size);
      this.browserWindow.setResizable(false);
      return;
    }

    if (newProps.size && newProps.onResize) {
      this.browserWindow.setSize(...newProps.size);
      this.browserWindow.setResizable(true);
    }
  }

  /**
   * Same as `handleSize` above. This is a lot of practically the same code, we
   * might want to do something with that in the future. Lets wait with that
   * until the implementation is complete (including error/warning messages).
   */
  handlePosition(propValue, newProps, oldProps) {
    if (
      (!oldProps && newProps.onMove) ||
      (oldProps && newProps.onMove !== oldProps.onMove)
    ) {
      this.eventManager('move', () => {
        newProps.onMove(this.browserWindow.getPosition());
      });
    }

    if (!newProps.defaultPosition && !newProps.position) {
      this.browserWindow.setMovable(true);
      return;
    }

    // TODO: only do this on mount?
    if (newProps.defaultPosition) {
      this.browserWindow.setPosition(...newProps.defaultPosition);
      this.browserWindow.setMovable(true);
      return;
    }

    if (newProps.position && !newProps.onMove) {
      // TODO: reactdom would warn if you do this, something like:
      // "If the field should be mutable use `defaultValue`. Otherwise, set
      // either `onChange` or `readOnly`."
      this.browserWindow.setPosition(...newProps.position);
      this.browserWindow.setMovable(false);
      return;
    }

    if (newProps.position && newProps.onMove) {
      this.browserWindow.setPosition(...newProps.position);
      this.browserWindow.setMovable(true);
    }
  }

  /**
   * Set a path for the window to load. If the path doesn't start with either
   * http://, https://, or file://, we assume it's a local path and prepend it
   * with file://
   */
  handlePath(path) {
    if (
      path.indexOf('file://') === 0 ||
      path.indexOf('http://') === 0 ||
      path.indexOf('https://') === 0
    ) {
      this.browserWindow.loadURL(path);
      return;
    }

    this.browserWindow.loadURL(`file://${path}`);
  }

  /**
   * Note: we need to bind the handlers to preserve `this` context.
   */
  get propHandlers() {
    const handleSize = this.handleSize.bind(this);
    const handlePosition = this.handlePosition.bind(this);
    return {
      // We can bind multiple props to the same handler because the base class
      // will only call each handler once when props change. This does mean our
      // handler needs to look at all the props when it's called.
      defaultSize: handleSize,
      size: handleSize,
      // I think it would be nice if this could be handled like other events.
      // That would mean event handling needs some kind of mapping support. (to
      // map the raw event to something 'nice' for the user)
      onResize: handleSize,
      // We handle position in the same way as we do with size
      defaultPosition: handlePosition,
      position: handlePosition,
      onMove: handlePosition,
      path: this.handlePath.bind(this)
    };
  }
}

export default Window;
