import React from "react";
import Typed from "react-typed";

import "./Body.css";

export default class Body extends React.Component {
  render() {
    return (
      <div className="component-body">
        <div className="App-body">
          <code>HI!</code>
          <br />
          <code>MY NAME IS JOSEPH COWIN</code>
          <br />
          <code>I❤️</code>
          <Typed
            strings={[
              "DevOps",
              "CI/CD",
              "Cloud",
              "IaC",
              "Docker",
              "Kubernetes",
              "Automation"
            ]}
            typeSpeed={100}
            backSpeed={50}
            loop
            shuffle={true}
            showCursor={false}
          >
          </Typed>
          <code className="App-cursor"> _</code>
          <br />
        </div>
      </div>
    );
  }
}
