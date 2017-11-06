import React from 'react';
import { render, App, Window } from '../../react-conductor/src/index';

class Application extends React.Component {
  state = {
    bounce: false
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
      >
        <Window show>
          <Window show />
          <Window show />
        </Window>
      </App>
    );
  }
}

render(<Application />);
