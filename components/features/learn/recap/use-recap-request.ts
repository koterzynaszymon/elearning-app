"use client";

import { useCallback, useRef, useState } from "react";
import type { RecapRequestState, RecapResult } from "./types";

const FALLBACK_ERROR = "The assistant did not respond. Try again in a moment.";

export interface RecapRequestHandle<T> {
  readonly state: RecapRequestState<T>;
  readonly run: () => void;
}


export function useRecapRequest<T>(
  fetcher: () => Promise<RecapResult<T>>,
): RecapRequestHandle<T> {
  const [state, setState] = useState<RecapRequestState<T>>({ status: "idle" });
  const inFlight = useRef(false);

  const run = useCallback((): void => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState({ status: "loading" });

    fetcher()
      .then((result) => {
        setState(
          result.success
            ? { status: "done", data: result.data }
            : { status: "error", error: result.error },
        );
      })
      .catch((cause: unknown) => {
        setState({
          status: "error",
          error: cause instanceof Error ? cause.message : FALLBACK_ERROR,
        });
      })
      .finally(() => {
        inFlight.current = false;
      });
  }, [fetcher]);

  return { state, run };
}
