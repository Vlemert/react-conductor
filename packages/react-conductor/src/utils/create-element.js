import { Root, App, Window, Menu } from '../components/';

// Creates an element with an element type, props and a root instance
function createElement(type, props, root) {
  const COMPONENTS = {
    ROOT: () => new Root(root, props),
    APP: () => new App(root, props),
    WINDOW: () => new Window(root, props),
    MENU: () => new Menu(root, props),
    default: () => {
      throw new Error(`type '${type}' is not implemented (yet?)!`);
    }
  };

  const getInstance = COMPONENTS[type];
  return (getInstance && getInstance()) || COMPONENTS.default();
}

export default createElement;
