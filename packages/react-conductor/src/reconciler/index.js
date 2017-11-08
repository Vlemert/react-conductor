const Reconciler = require('react-reconciler');

import createElement from '../utils/create-element';

/**
 * This is where we create our renderer. We can pass in a configuration object
 * that tells Fiber what to do in each step of it's lifecycle. Most of that is
 * explained below.
 */
const ElectronRenderer = Reconciler({
  /**
   * `hostContext` allows us to pass information down to the create and update
   * functions of lower lying elements. We're not using it at the moment, but
   * in this function we could create the `rootHostContext` that gets passed
   * down. This function will only get called for the root.
   */
  getRootHostContext(rootContainerInstance) {
    return null;
  },

  /**
   * This function will get called for every node in the tree that is not the
   * root. We can expand on a parent's hostContext here, and pass an extended
   * object further down.
   * We could probably use this to keep track of windows in windows, or whether
   * a menu lives in a window.
   */
  getChildHostContext(parentHostContext, type, rootContainerInstance) {
    return null;
  },

  /**
   * When `ref` is used on one of our components, this is what will be returned.
   * We let the instance decide what should be returned.
   */
  getPublicInstance(instance) {
    return instance.getPublicInstance();
  },

  /**
   * prepareForCommit and resetAfterCommit will be called before and after every
   * commit Fiber does (which I guess would be every batch of commitMount or
   * commitUpdate). This gives us a chance to 'save' some stuff that might get
   * lost during the commit. react-dom uses this to pause events, and save
   * selection information (which element has focus at the time of the commit).
   */
  prepareForCommit() {
    // We don't have any use for this right now
  },

  /**
   * See above, this is where react-dom turns events back on and restores
   * selection information.
   */
  resetAfterCommit() {
    // We don't have any use for this right now
  },

  /**
   * This will be called for every element in the user's tree that is not a
   * custom component. In our case, `createElement` knows what to do with each
   * element type, and creates the instances for us.
   */
  createInstance(type, props, rootContainerInstance, hostContext) {
    return createElement(type, props, rootContainerInstance, hostContext);
  },

  /**
   * This will get called before the first mount for every child in the tree,
   * except for direct children of the root. Note that we don't need initial
   * insert or remove, as before the first mount there are no children yet, and
   * every child can simply be appended.
   * (I would expect a root/container equivalent here, but that is down in the
   *  `mutation` section under `appendChildToContainer`)
   */
  appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },

  finalizeInitialChildren(instance, type, props) {
    return instance.finalizeInitialChildren(props);
  },

  prepareUpdate(instance, type, oldProps, newProps) {
    return instance.prepareUpdate(oldProps, newProps);
  },

  shouldSetTextContent(type, props) {
    return false;
  },

  shouldDeprioritizeSubtree(type, props) {
    return false;
  },

  createTextInstance(text, rootContainerInstance) {
    throw new Error(
      'TextElements are not supported! (do you have some text in your JSX?)'
    );
  },

  now: () => {},

  useSyncScheduling: true,

  mutation: {
    commitMount(instance, type, props) {
      instance.commitMount(props);
    },

    commitUpdate(instance, updatePayload, type, oldProps, newProps) {
      instance.commitUpdate(updatePayload, oldProps, newProps);
    },

    resetTextContent(wordElement) {
      // noop
    },

    commitTextUpdate(textInstance, oldText, newText) {
      throw new Error(
        'TextElements are not supported! (do you have some text in your JSX?)'
      );
    },

    appendChild(parentInstance, child) {
      parentInstance.appendChild(child);
    },

    appendChildToContainer(container, child) {
      container.appendChild(child);
    },

    insertBefore(parentInstance, child, beforeChild) {
      // noop
    },

    insertInContainerBefore(container, child, beforeChild) {
      // noop
    },

    removeChild(parentInstance, child) {
      parentInstance.removeChild(child);
    },

    removeChildFromContainer(container, child) {
      container.removeChild(child);
    }
  }
});

export default ElectronRenderer;
