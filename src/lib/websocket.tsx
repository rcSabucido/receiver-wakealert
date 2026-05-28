import { useEffect } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import * as ws from "react-use-websocket";
  
interface WebSocketClientProps {
  url: string;
  onMessage: (message: MessageEvent) => void;
}

const PING_INTERVAL_MS = 10_000;

export default function WebSocketClient({ url, onMessage }: WebSocketClientProps) {

  const { sendMessage, /*lastMessage,*/ readyState } = useWebSocket(url, {
    shouldReconnect: () => true,
    onMessage,
  });

  useEffect(() => {
    if (readyState !== ws.ReadyState.OPEN) return;

    const interval = setInterval(() => {
      sendMessage("ping");
    }, PING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [readyState, sendMessage]);

  /*
  const connectionStatus = {
    [ws.ReadyState.CONNECTING]: "Connecting",
    [ws.ReadyState.OPEN]: "Open",
    [ws.ReadyState.CLOSING]: "Closing",
    [ws.ReadyState.CLOSED]: "Closed",
    [ws.ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  */

  return (
    <div>
    {/*
    <div>
      <p>WebSocket status: {connectionStatus}</p>
      <p>Last message: {lastMessage?.data ?? "None"}</p>
    </div>
    */}
    </div>
  );
}