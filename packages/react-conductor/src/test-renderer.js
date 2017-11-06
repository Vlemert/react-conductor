import createElement from './utils/create-element';
import ElectronRenderer from './reconciler';

function render(element, launchInfo) {
  const container = createElement('ROOT');
  const node = ElectronRenderer.createContainer(container);

  // This is a hack to be able to test whether App passes this to `onReady`
  container.launchInfo = launchInfo;

  ElectronRenderer.updateContainer(element, node, null);

  return container;
}

export default render;
