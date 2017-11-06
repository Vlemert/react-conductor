import emptyObject from 'fbjs/lib/emptyObject';
import createElement from '../utils/create-element';

const Reconciler = require('react-reconciler');

const ElectronRenderer = Reconciler({
  // Add children
  appendInitialChild(parentInstance, child) {
    parentInstance.appendChild(child);
  },

  // Here we are passing the internal instance (root instance i.e App)
  createInstance(type, props, internalInstanceHandle) {
    return createElement(type, props, internalInstanceHandle);
  },

  createTextInstance(text, rootContainerInstance, internalInstanceHandle) {
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

  getRootHostContext() {
    return emptyObject;
  },

  getChildHostContext() {
    return emptyObject;
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
