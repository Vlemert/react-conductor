const Reconciler = require('react-reconciler');

import getElementClass from '../utils/get-element-class';
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
   *
   * Note that the hostContext functions get called from the root to the leaves
   * of the tree. This is important, because not every lifecycle step behaves
   * that way.
   *
   * Furthermore, I'm unsure whether these functions can get called more than
   * once in the lifecycle, so we should probably err on the safe side and keep
   * them pure.
   */
  getRootHostContext(rootContainerInstance) {
    return {};
  },

  /**
   * This function will get called for every node in the tree that is not the
   * root. We can expand on a parent's hostContext here, and pass an extended
   * object further down.
   *
   * We let the element classes decide for themselves what to return here. Note
   * that at this point we don't have an instance of the element yet, so all we
   * can do is call a static function on the class.
   *
   * Window implements getHostContext for example so child windows know they're
   * being rendered in a window.
   */
  getChildHostContext(parentHostContext, type, rootContainerInstance) {
    return {
      hostContext: parentHostContext,
      ...getElementClass(type).getHostContext()
    };
  },

  /**
   * When `ref` is used on one of our components, this is what will be returned.
   * We let the instance decide what should be returned.
   *
   * Note that this may get called on every update of the tree, if the user
   * passes an anonymous function on the `ref` prop. Again, keeping this pure
   * would probably be wise.
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
   *
   * Doesn't have to be pure, prepare and reset will always be called before and
   * after each commit.
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
   *
   * Note that this gets called from the leaves to the root of the tree, which
   * means lower lying elements are instantiated first. Creating an element and
   * appending it's children seems to happen in one sync step, though there are
   * some comments in the react-reconciler code that suggest this might change
   * in the future.
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
   *
   * As stated above at `createInstance`, creating an instance and appending
   * it's children seems to happen in one sync step. I'm unsure if that means
   * we're safe to manipulate the child here (set it's parent for example), or
   * whether we should do stuff like that through hostContext.
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
