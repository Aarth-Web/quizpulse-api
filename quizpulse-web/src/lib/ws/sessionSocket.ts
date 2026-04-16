import { getApiBaseUrl } from "../config/env";

export type SessionSocketEvent = {
  event: string;
  payload?: unknown;
};

type SessionSocketHandlers = {
  onEvent: (event: SessionSocketEvent) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: () => void;
};

export function connectSessionSocket(
  sessionId: string,
  accessToken: string,
  handlers: SessionSocketHandlers,
) {
  const apiUrl = new URL(getApiBaseUrl());
  const wsUrl = new URL(apiUrl.origin);
  wsUrl.protocol = apiUrl.protocol.startsWith("https") ? "wss:" : "ws:";
  wsUrl.searchParams.set("token", accessToken);
  wsUrl.searchParams.set("sessionId", sessionId);

  const socket = new WebSocket(wsUrl.toString());

  socket.addEventListener("open", () => {
    handlers.onOpen?.();
  });

  socket.addEventListener("message", (event) => {
    try {
      const parsed = JSON.parse(String(event.data)) as SessionSocketEvent;
      handlers.onEvent(parsed);
    } catch {
      handlers.onEvent({ event: "unknown.message", payload: event.data });
    }
  });

  socket.addEventListener("close", (event) => {
    handlers.onClose?.(event);
  });

  socket.addEventListener("error", () => {
    handlers.onError?.();
  });

  return () => {
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  };
}
