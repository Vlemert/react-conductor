import App from './app';

class Root {
  appendChild(child) {
    // Do we need this? It's only used in tests, which probably means the tests
    // aren't doing what they're supposed to do.
    if (child instanceof App) {
      this.appElement = child;
    }
  }

  removeChild(child) {
    this.appElement = null;
  }
}

export default Root;
