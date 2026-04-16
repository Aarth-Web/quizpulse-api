import type { ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled UI error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="empty-state" role="alert">
            <h2>Something went wrong</h2>
            <p>
              Refresh the page. If the issue persists, report it to the team.
            </p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
