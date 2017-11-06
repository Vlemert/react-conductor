import { app } from 'electron';

import createElement from '../utils/create-element';
import ElectronRenderer from '../reconciler/';

// Renders the input component
async function render(element) {
  // Create root container instance
  const container = createElement('ROOT');

  // Returns the current fiber (flushed fiber)
  const node = ElectronRenderer.createContainer(container);

  // We wait for app to be ready before doing anything. This works for now, but
  // there might be a better way to do this
  app.once('ready', launchInfo => {
    // This is the only way to get `launchInfo` into the tree for now (we need
    // it for the `App.onReady` prop)
    container.launchInfo = launchInfo;

    // Schedules a top level update with current fiber and a priority level (depending upon the context)
    ElectronRenderer.updateContainer(element, node, null);
  });

  // TODO: figure out what to return here, ReactDOM does this:
  // return DOMRenderer.getPublicRootInstance(root);
}

export default render;
