import { BrowserWindow } from 'electron';

import createEventManager from '../utils/create-event-manager';
import Base from './base';

class Window extends Base {
  /**
   * This generates the context that is passed to the direct children of an
   * instance of this element class. Check the constructor to see how it's used
   * here.
   *
   * TODO: we could also move this to the base class, as this is pretty generic.
   */
  static getHostContext() {
    return {
      // I'm not sure if using the constructor name is the smartest idea here,
      // but it works
      type: this.name
    };
  }

  constructor(type, props, rootContainerInstance, hostContext) {
    super(type, props, rootContainerInstance, hostContext);

    this.childWindows = new Set();

    // When creating a BrowserWindow, we need to pass the parent into it's
    // constructor. (setting it later works on Linux and macOS, but ironically
    // not on Windows).
    // Fiber will call all our constructors from the leaves to the root of the
    // tree, which means that if a window has a parent, that order is opposite
    // of what we want to do. (the child is created first)
    // Our solution here is to defer initialization of a window if it has a
    // window as the parent (current implementation is direct parent!). Then,
    // when the window gets added to the parent, that parent window will be
    // responsible for initializing it's children.
    if (hostContext.type !== this.constructor.name) {
      this.init(props);
    } else {
      // initFromParent is the init function, but with it's context (this) and
      // first argument (props) already bound. That way, the parent only needs
      // to supply it's BrowserWindow instance as the `parent` argument.
      this.initFromParent = this.init.bind(this, props);
    }
  }

  /**
   * Creates a BrowserWindow instance given props and a parent. This function
   * is either called from this instance's constructor, or from a parent
   * instance if that parent is a window as well.
   */
  init(props, parent) {
    this.browserWindow = new BrowserWindow({
      show: !!props.show,
      parent
    });
    this.eventManager = createEventManager(this.browserWindow);

    // If init was called from the constructor, children are not yet appended
    // and this will do nothing. Therefore `appendChild` will also do a check,
    // and initialize the child if `init` was already called.
    this.childWindows.forEach(child =>
      child.initFromParent(this.browserWindow)
    );
  }

  appendChild(child) {
    if (child instanceof Window) {
      this.childWindows.add(child);

      // If this element's BrowserWindow is already initialized, we immediately
      // initialize the child here. It could be that this element is inside of
      // another window as well, which means that `init` is not yet called and
      // we cannot initialize the children yet.
      if (this.browserWindow) {
        child.initFromParent(this.browserWindow);
      }
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
