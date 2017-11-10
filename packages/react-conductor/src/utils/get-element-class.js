import { Root, App, Window, Menu } from '../components/';

/**
 * Returns the element class that represents a given type. Throws if no class
 * can be found.
 */
function getElementClass(type) {
  const COMPONENTS = {
    ROOT: Root,
    APP: App,
    WINDOW: Window,
    MENU: Menu
  };

  const elementClass = COMPONENTS[type];

  if (!elementClass) {
    throw new Error(`type '${type}' is not implemented (yet?)!`);
  }

  return elementClass;
}

export default getElementClass;
