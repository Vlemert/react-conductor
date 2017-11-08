const Reconciler = require('react-reconciler');

import createElement from '../utils/create-element';

const ElectronRenderer = Reconciler({
  // Add children
  appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },

  // Here we are passing the internal instance (root instance i.e App)
  createInstance(type, props, rootContainerInstance, hostContext) {
    return createElement(type, props, rootContainerInstance, hostContext);
  },

  createTextInstance(text, rootContainerInstance) {
    throw new Error(
      'TextElements are not supported! (do you have some text in your JSX?)'
    );
  },

  finalizeInitialChildren(instance, type, props) {
    return instance.finalizeInitialChildren(props);
  },

  getPublicInstance(instance) {
    return instance.getPublicInstance();
  },

  prepareForCommit() {
    // noop
  },

  prepareUpdate(instance, type, oldProps, newProps) {
    return instance.prepareUpdate(oldProps, newProps);
  },

  resetAfterCommit() {
    // noop
  },

  resetTextContent(wordElement) {
    // noop
  },

  getRootHostContext(rootContainerInstance) {
    return null;
  },

  getChildHostContext(parentHostContext, type, rootContainerInstance) {
    return null;
  },

  shouldSetTextContent(type, props) {
    return false;
  },

  now: () => {},

  useSyncScheduling: true,

  mutation: {
    appendChild(parentInstance, child) {
      parentInstance.appendChild(child);
    },

    appendChildToContainer(parentInstance, child) {
      parentInstance.appendChild(child);
    },

    removeChild(parentInstance, child) {
      parentInstance.removeChild(child);
    },

    removeChildFromContainer(parentInstance, child) {
      parentInstance.removeChild(child);
    },

    insertBefore(parentInstance, child, beforeChild) {
      // noob
    },

    commitUpdate(instance, updatePayload, type, oldProps, newProps) {
      instance.commitUpdate(updatePayload, oldProps, newProps);
    },

    commitMount(instance, type, props) {
      instance.commitMount(props);
    },

    commitTextUpdate(textInstance, oldText, newText) {
      throw new Error(
        'TextElements are not supported! (do you have some text in your JSX?)'
      );
    }
  }
});

export default ElectronRenderer;
