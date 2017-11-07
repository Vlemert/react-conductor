/**
 * This creates an event manager around a given `emitter`.
 *
 * The event manager can be called with an `eventKey` and a `newHandler`, and
 * will make sure that event handler is registered on the emitter.
 *
 * If an event with that `eventKey` is already registered, it will:
 * - do nothing if the handler didn't change
 * - otherwise, remove the current handler, and register the new handler
 */
function createEventManager(emitter) {
  const attachedHandlers = {};

  return (eventKey, newHandler) => {
    const existingHandler = attachedHandlers[eventKey];

    if (newHandler === existingHandler) {
      return;
    }

    if (existingHandler) {
      emitter.removeListener(eventKey, existingHandler);
      delete attachedHandlers[eventKey];
    }

    if (newHandler) {
      emitter.on(eventKey, newHandler);
      attachedHandlers[eventKey] = newHandler;
    }
  };
}

export default createEventManager;
