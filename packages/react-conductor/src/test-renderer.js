import createElement from './utils/create-element';
import ElectronRenderer from './reconciler';

/**
 * TODO: the test renderer shouldn't actually render to Electron elements. It's
 * supposed to help future users test their applications, not help testing this
 * library.
 *
 * We'll need to switch all our tests to using the actual renderer, and change
 * this one to the way it's done in React (and move it to a separate package
 * probably)
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
