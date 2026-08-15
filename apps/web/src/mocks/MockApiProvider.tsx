"use client";

import { useEffect, useState } from "react";

type MockApiProviderProps = Readonly<{ children: React.ReactNode }>;

const isMockEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_MOCK_API === "true";

const MockApiProvider = ({ children }: MockApiProviderProps) => {
  const [ready, setReady] = useState(!isMockEnabled);

  useEffect(() => {
    if (!isMockEnabled) return;
    let active = true;
    let stopWorker: (() => void) | undefined;
    const fallbackTimeout = window.setTimeout(() => {
      if (active) {
        setReady(true);
      }
    }, 2_000);

    void import("./browser")
      .then(({ worker }) => {
        stopWorker = () => worker.stop();
        return worker.start({ onUnhandledRequest: "bypass" });
      })
      .then(() => {
        if (active) setReady(true);
      })
      .catch((error: unknown) => {
        console.error("Unable to start the mock API worker.", error);
        if (active) setReady(true);
      });

    return () => {
      active = false;
      window.clearTimeout(fallbackTimeout);
      stopWorker?.();
    };
  }, []);

  if (!isMockEnabled) return <>{children}</>;
  if (!ready) return <div aria-live="polite">Starting the demo workspace…</div>;
  return <>{children}</>;
};

export default MockApiProvider;
