import React from "react";
import { useHistory } from "react-router";
import { withRouter, RouteComponentProps } from "react-router-dom";

interface errorBoundaryState {
  hasError: boolean;
}

export interface iProp {
  mainScreen: boolean;
  appScreen: boolean;
}

class ErrorBoundaryMain extends React.Component<
  iProp & RouteComponentProps,
  errorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.props.history.push({
      pathname: "/error",
      state: {
        mainScreen: this.props.mainScreen,
        appScreen: this.props.appScreen,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return null;
    }

    return this.props.children;
  }
}

export default withRouter(ErrorBoundaryMain);
