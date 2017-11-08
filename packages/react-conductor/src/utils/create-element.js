import { Root, App, Window, Menu } from '../components/';

// Creates an element with an element type, props and a root instance
function createElement(type, props, rootContainerInstance, hostContext) {
  const COMPONENTS = {
    ROOT: () => new Root(props),
    APP: () => new App(props, rootContainerInstance),
    WINDOW: () => new Window(props),
    MENU: () => new Menu(props),
    default: () => {
      throw new Error(`type '${type}' is not implemented (yet?)!`);
    }
  };

  const getInstance = COMPONENTS[type];
  return (getInstance && getInstance()) || COMPONENTS.default();
}

export default createElement;
