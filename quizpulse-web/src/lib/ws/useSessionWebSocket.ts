import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../features/auth/store";
import { connectSessionSocket, type SessionSocketEvent } from "./sessionSocket";

export type SessionWebSocketHandlers = {
  onEvent?: (event: SessionSocketEvent) => void;
};

/**
 * Stable WebSocket lifecycle: reconnect uses refs + internal backoff only.
 * Effect deps are only sessionId + enabled — avoids disconnect/reconnect loops.
 */
export function useSessionWebSocket(
  sessionId: string | undefined,
  enabled: boolean,
  handlers?: SessionWebSocketHandlers,
) {
  const [socketStatus, setSocketStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");

  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  /* eslint-disable react-hooks/set-state-in-effect -- WS lifecycle: status mirrors socket callbacks opened from this effect */
  useEffect(() => {
    if (!sessionId || !enabled) {
      setSocketStatus("disconnected");
      return;
    }

    let stopped = false;
    let disconnectSocket: (() => void) | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const connect = () => {
      if (stopped) {
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (!token) {
        setSocketStatus("disconnected");
        return;
      }

      disconnectSocket?.();
      setSocketStatus("connecting");

      disconnectSocket = connectSessionSocket(sessionId, token, {
        onOpen: () => {
          if (!stopped) {
            setSocketStatus("connected");
            attempt = 0;
          }
        },
        onClose: async (event) => {
          if (stopped) {
            return;
          }
          setSocketStatus("disconnected");

          if (event.code === 4003) {
            const refreshed = await useAuthStore
              .getState()
              .refreshUserSession();
            if (!refreshed) {
              useAuthStore.getState().logout();
              return;
            }
          }

          const delayMs = Math.min(1000 * 2 ** attempt, 15000);
          attempt += 1;
          reconnectTimer = window.setTimeout(() => {
            if (!stopped) {
              connect();
            }
          }, delayMs);
        },
        onError: () => {
          if (!stopped) {
            setSocketStatus("disconnected");
          }
        },
        onEvent: (event) => {
          handlersRef.current?.onEvent?.(event);
        },
      });
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      disconnectSocket?.();
      setSocketStatus("disconnected");
    };
  }, [sessionId, enabled]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return socketStatus;
}
