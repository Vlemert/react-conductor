import createElement from './utils/create-element';
import ElectronRenderer from './reconciler';

function render(element) {
  const container = createElement('ROOT');
  const node = ElectronRenderer.createContainer(container);

  ElectronRenderer.updateContainer(element, node, null);

  return container;
}

export default render;
