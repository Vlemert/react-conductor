class Base {
  constructor(root, props) {
    this.root = root;
    this.props = props;
  }

  /**
   * Default event handler. Not yet implemented until we make events more
   * generic. For now handled in subclass.
   */
  handleEvent(event) {
    throw new Error('event handler not implemented');
  }

  /**
   * Definition of all (non-event) props that an element handles. Format:
   * { propKey: handlerFunction }
   * Should be overridden in subclass
   */
  get propHandlers() {
    return {};
  }

  /**
   * Definition of all event props that an element handles. Format:
   * { propKey: 'event-name' }
   * * Should be overridden in subclass
   */
  get propEvents() {
    return {};
  }

  /**
   * Helper that turns all entries in `propEvents` into actual event handlers
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
    Object.entries(props).forEach(([propKey, propValue]) => {
      if (this.allPropHandlers.hasOwnProperty(propKey)) {
        this.allPropHandlers[propKey](propValue);
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
    updatePayload.forEach(([propKey, value]) => {
      if (this.allPropHandlers.hasOwnProperty(propKey)) {
        this.allPropHandlers[propKey](value);
      }
    });
  }
}

export default Base;
