import { App, Window } from '../components/';

// Creates an element with an element type, props and a root instance
function createElement(type, props, root) {
  const COMPONENTS = {
    ROOT: () => new App(root, props),
    WINDOW: () => new Window(root, props),
    default: () => {
      throw new Error(`type '${type}' is not implemented (yet?)!`);
    }
  };

  return COMPONENTS[type]() || COMPONENTS.default();
}

export default createElement;
