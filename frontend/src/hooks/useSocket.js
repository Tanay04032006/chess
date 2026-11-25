import { useEffect, useState } from "react";

const defaultUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8080`;

export default function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connection, setConnection] = useState("connecting");

  useEffect(() => {
    let active = true;
    let ws;
    let retry;
    function connect() {
      setConnection("connecting");
      try {
        ws = new WebSocket(import.meta.env.VITE_WS_URL || defaultUrl);
      } catch {
        setConnection("error");
        retry = setTimeout(connect, 3000);
        return;
      }
      ws.onopen = () => {
        if (active) {
          setSocket(ws);
          setConnection("connected");
        }
      };
      ws.onerror = () => {
        if (active) setConnection("error");
      };
      ws.onclose = () => {
        if (!active) return;
        setSocket(null);
        setConnection("disconnected");
        retry = setTimeout(connect, 3000);
      };
    }
    connect();
    return () => {
      active = false;
      clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return { socket, connection };
}
