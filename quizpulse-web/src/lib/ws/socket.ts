import { getApiBaseUrl } from "../config/env";

const WS_PROTOCOL = "ws";

export function createWsUrl(path: string) {
  const apiUrl = new URL(getApiBaseUrl());
  const wsUrl = new URL(path, apiUrl);

  wsUrl.protocol = apiUrl.protocol.startsWith("https") ? "wss" : WS_PROTOCOL;
  return wsUrl.toString();
}
