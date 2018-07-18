import React from 'react';
// ref - react docs - https://reactjs.org/docs/error-boundaries.html

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    console.log(error, 'error within ErrorBoundary', info,);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <p className="err-msg">Something went wrong! Please try refreshing page.</p>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;