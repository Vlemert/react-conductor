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
    size: [100, 300]
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
        ref={ref => {
          console.log('got ref', ref);
        }}
      >
        <Window show defaultSize={[100, 200]}>
          <Window show size={this.state.size} onResize={this.onResize} />
          <Window show />
        </Window>
      </App>
    );
  }
}

render(<Application />);
