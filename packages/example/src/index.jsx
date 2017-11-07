import React from 'react';
import { render, App, Window } from '@react-conductor/core';

/**
 * TODO: we really need a way to have multiple examples. Possibly by having
 * multiple entry points and allowing the user to configure which example to
 * run through a command line argument.
 */
class Application extends React.Component {
  state = {
    bounce: false,
    size: [100, 300],
    position: [100, 100]
  };

  componentDidMount() {
    setInterval(
      () =>
        this.setState(state => ({
          bounce: !state.bounce
        })),
      5000
    );
  }

  onResize = size => {
    console.log('resize!', size);
    this.setState({
      size
    });
  };

  onMove = position => {
    console.log('move!', position);
    this.setState({
      position
    });
  };

  getRef = ref => {
    console.log('got ref', ref);
  };

  render() {
    return (
      <App
        onBrowserWindowBlur={() => console.log('blurrrrr')}
        dockBounce={this.state.bounce && 'critical'}
        onInit={(argv, cwd) => {
          console.log('argv', argv);
          console.log('cwd', cwd);
        }}
        onReady={launchInfo => {
          console.log('ready', launchInfo);
        }}
        ref={this.getRef}
      >
        <Window show defaultSize={[100, 200]} defaultPosition={[50, 50]}>
          <Window show size={this.state.size} onResize={this.onResize} />
          <Window show position={this.state.position} onMove={this.onMove} />
        </Window>
      </App>
    );
  }
}

render(<Application />);
