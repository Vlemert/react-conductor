import getElementClass from './get-element-class';

/**
 * Creates and returns an instance of an element based on a given type.
 */
// Creates an element with an element type, props and a root instance
function createElement(type, props, rootContainerInstance, hostContext) {
  const ElementClass = getElementClass(type);

  return new ElementClass(type, props, rootContainerInstance, hostContext);
}

export default createElement;
