class Base {
  constructor(root, props) {
    this.root = root;
    this.props = props;
  }

  getPublicInstance() {
    return this;
  }

  /**
   * Default event handler. Not yet implemented until we make events more
   * generic. For now handled in subclass.
   */
  handleEvent(event) {
    throw new Error('event handler not implemented');
  }

  /**
   * Definition of all (non-event) props that an element handles. Format can
   * be either:
   * { propKey: handlerFunction }
   * or:
   * { propKey: [mountHandler, updateHandler] }
   * Should be overridden in subclass
   *
   * If you use the same handler for multiple props, it will get called only
   * once on mount / update when multiple props are set / update.
   *
   * TODO: `propHandlers` being an object prevents us from forcing a processing
   * order, might want to change that. (App.onInit and App.onReady are in the
   * correct order by accident for example)
   */
  get propHandlers() {
    return {};
  }

  /**
   * Definition of all event props that an element handles. Format:
   * { propKey: 'event-name' }
   * * Should be overridden in subclass
   *
   * TODO: think about whether we want to support some kind of `once` event
   * handling, vs `on`.
   */
  get propEvents() {
    return {};
  }

  /**
   * Helper that turns all entries in `propEvents` into actual event handlers.
   * Changes:
   * { propKey: 'event-name' }
   * Into:
   * { propKey: handlerFunction }
   * Where `handlerFunction` defaults to `this.handleEvent('event-name')`.
   */
  propEventHandlers = Object.entries(
    this.propEvents
  ).reduce((eventHandlers, [propKey, eventName]) => {
    eventHandlers[propKey] = this.handleEvent(eventName);
    return eventHandlers;
  }, {});

  /**
   * An object containing all props that an element handles, based on
   * `propHandlers` and `propEvents`.
   */
  allPropHandlers = {
    ...this.propHandlers,
    ...this.propEventHandlers
  };

  /**
   * First finalization pass. Here we check whether we'll need to do anything
   * in `commitMount` by checking if any of the handled props has a value.
   */
  finalizeInitialChildren(props) {
    let commitMount = false;

    Object.entries(props).forEach(([propKey, eventHandler]) => {
      if (this.allPropHandlers.hasOwnProperty(propKey)) {
        commitMount = true;
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
    // We keep a list of handlers we've already called. We assume that if the
    // same handler is used for multiple props in a subclass, that handler will
    // make sure that calling it once is sufficient (we pass all props as a
    // second argument for that situation).
    const calledHandlers = new Set();
    Object.entries(props).forEach(([propKey, propValue]) => {
      if (this.allPropHandlers.hasOwnProperty(propKey)) {
        const handler = this.allPropHandlers[propKey];

        if (Array.isArray(handler)) {
          const mountHandler = handler[0];
          if (mountHandler && !calledHandlers.has(mountHandler)) {
            mountHandler(propValue, props);
            calledHandlers.add(mountHandler);
          }
          return;
        }

        handler(propValue, props);
        calledHandlers.add(handler);
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
      if (!this.allPropHandlers.hasOwnProperty(key)) {
        return;
      }

      mergedProps[key] = [value, undefined];
    });

    Object.entries(newProps).forEach(([key, value]) => {
      if (!this.allPropHandlers.hasOwnProperty(key)) {
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
    // Same as in `commitMount`, but this time we pass the full sets of old and
    // new props so handlers can do their thing.
    const calledHandlers = new Set();
    updatePayload.forEach(([propKey, value]) => {
      if (this.allPropHandlers.hasOwnProperty(propKey)) {
        const handler = this.allPropHandlers[propKey];

        if (Array.isArray(handler)) {
          const updateHandler = handler[1];
          if (updateHandler && !calledHandlers.has(updateHandler)) {
            updateHandler(value, newProps, oldProps);
            calledHandlers.add(updateHandler);
          }
          return;
        }

        handler(value, newProps, oldProps);
        calledHandlers.add(handler);
      }
    });
  }
}

export default Base;
