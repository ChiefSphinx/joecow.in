import React from "react";

import "./Header.css";

export default class Header extends React.Component {
  render() {
    return (
      <div className="component-display">
        <div className="App-header">
          <code>JOECOW.IN@LOCALHOST:~$</code>
          <code className="App-cursor"> _</code>
        </div>
      </div>
    );
  }
}
