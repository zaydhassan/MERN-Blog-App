import React from "react";

// Catches render errors from the child subtree and shows them on screen
// instead of a blank page. Without this, a throw in any lazy-loaded route
// (e.g. CreateBlog) blanks the whole app because there's no boundary to
// handle it. In dev it surfaces the full error + stack so the cause is
// visible; in prod it shows a friendly message.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const isDev = import.meta.env?.DEV;
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          fontFamily: "monospace",
        }}
      >
        <h2 style={{ color: "#c62828" }}>Something went wrong rendering this page.</h2>
        <p style={{ maxWidth: 720, color: "#555" }}>
          {isDev ? "Dev error surfaced by ErrorBoundary:" : "Please reload the app."}
        </p>
        {isDev && (
          <pre
            style={{
              maxWidth: 900,
              overflow: "auto",
              background: "#1e1e1e",
              color: "#f44336",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              textAlign: "left",
            }}
          >
            {this.state.error?.message || String(this.state.error)}
            {"\n\n"}
            {this.state.error?.stack}
            {this.state.info?.componentStack}
          </pre>
        )}
        <button
          onClick={this.handleReset}
          style={{
            marginTop: 16, padding: "8px 16px", cursor: "pointer",
            borderRadius: 6, border: "1px solid #ccc", background: "#fff",
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}