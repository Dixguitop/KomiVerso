import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { error: null, info: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("Crash:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
          <h2>Algo se rompió 😬</h2>
          <p>{String(this.state.error?.message || this.state.error)}</p>
          <p style={{ color: "orange" }}>--- Component stack ---</p>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
