import React from "react";
import "./App.css";
import Header from "./Header";
import Body from "./Body";

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Body />
      </div>
    );
  }
}
