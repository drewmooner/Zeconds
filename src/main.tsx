import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { App } from "./App";
import { wagmiConfig } from "./lib/wagmi";
import "./index.css";

const queryClient = new QueryClient();

class DeskBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state: { err: Error | null } = { err: null };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error(err, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div
          style={{
            height: "100%",
            background: "#000",
            color: "#eef1f4",
            fontFamily: "IBM Plex Sans, sans-serif",
            padding: 32,
          }}
        >
          <p style={{ fontSize: 14, opacity: 0.5, letterSpacing: "0.2em" }}>ZECONDS</p>
          <p style={{ marginTop: 12, fontSize: 18, fontWeight: 600 }}>Desk hit an error.</p>
          <pre style={{ marginTop: 16, fontSize: 12, color: "#f07178", whiteSpace: "pre-wrap" }}>
            {this.state.err.message}
          </pre>
          <button
            type="button"
            style={{
              marginTop: 20,
              height: 40,
              padding: "0 18px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DeskBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </DeskBoundary>
  </StrictMode>,
);
