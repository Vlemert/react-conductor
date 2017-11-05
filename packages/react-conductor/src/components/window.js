import { BrowserWindow } from 'electron';

class Window {
  constructor(root, props) {
    this.root = root;
    this.props = props;

    this.childWindows = new Set();

    this.browserWindow = new BrowserWindow({
      show: !!props.show
    });
  }

  appendChild(child) {
    if (child instanceof Window) {
      this.childWindows.add(child);
    }
  }

  removeChild(child) {
    if (child instanceof Window) {
      this.childWindows.delete(child);
    }
  }

  renderChildNode() {
    for (let i = 0; i < this.children.length; i += 1) {
      console.log('render child!');
      if (typeof this.children[i] === 'object') {
        this.children[i].render();
      }
    }
  }

  render() {
    this.renderChildNode();
  }

  finalizeInitialChildren(props) {
    return false;
  }

  commitMount(props) {
    // noop
  }

  commitUpdate(oldProps, newProps) {
    // noop
  }
}

export default Window;
