import { app } from 'electron';

import createElement from '../utils/create-element';
import ElectronRenderer from '../reconciler/';

/**
 * Renders the element that is passed in.
 *
 * (equivalent of react-dom's render method)
 */
function render(element) {
  // Create root container instance
  const container = createElement('ROOT');

  // Returns the current fiber (flushed fiber)
  const root = ElectronRenderer.createContainer(container);

  // We wait for app to be ready before doing anything. This works for now, but
  // there might be a better way to do this, as render now has to return a
  // promise.
  return new Promise(resolve => {
    app.once('ready', launchInfo => {
      // This is the only way to get `launchInfo` into the tree for now (we need
      // it for the `App.onReady` prop). Again, there might be a better way.
      container.launchInfo = launchInfo;

      // Schedules a top level update with current fiber and a priority level
      // (depending upon the context)
      const parentComponent = null;
      const callback = undefined;
      ElectronRenderer.updateContainer(
        element,
        root,
        parentComponent,
        callback
      );

      // `getPublicRootInstance` will return the instance of the component that
      // created `element`. Note that this will be `null` if that component is
      // a stateless functional component.
      resolve(ElectronRenderer.getPublicRootInstance(root));
    });
  });
}

export default render;
