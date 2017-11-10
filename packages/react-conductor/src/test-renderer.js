import createElement from './utils/create-element';
import ElectronRenderer from './reconciler';

/**
 * Not sure if we need this any longer. It might be a nice starting point for
 * an actual test renderer in the future.
 *
 * Never use this in a test within react-conductor!
 */
function render(element, launchInfo) {
  const container = createElement('ROOT');
  const node = ElectronRenderer.createContainer(container);

  // This is a hack to be able to test whether App passes this to `onReady`
  container.launchInfo = launchInfo;

  ElectronRenderer.updateContainer(element, node, null);

  return container;
}

export default render;
