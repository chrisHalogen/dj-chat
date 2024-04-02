import useWebSocket from "react-use-websocket";
import { useState } from "react";
import { useAuthService } from "./AuthServices";
import useCrud from "../hooks/useCrud";

import { Server } from "../@types/server";
import { WS_ROOT } from "../config";

interface ServerChannelProps {
  data: Server[];
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

interface SendMessageData {
  type: string;
  message: string;
  [key: string]: any;
}

const useChatWebSocket = (channelId: string, serverId: string) => {
  const maxConnetionAttempts = 4;
  const [newMessage, setNewMessage] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const access = localStorage.getItem("access_token");
  const { logout, refreshAccessToken } = useAuthService();
  const [reconnectionAttempt, setReconnectionAttempt] = useState(0);

  const socketUrl = channelId
    ? `${WS_ROOT}/${serverId}/${channelId}/?token=${access}`
    : null;

  const { fetchData } = useCrud<Server>(
    [],
    `/messages/?channel_id=${channelId}`
  );

  const { sendJsonMessage } = useWebSocket(socketUrl, {
    onOpen: async () => {
      try {
        const data = await fetchData();
        setNewMessage([]);
        setNewMessage(Array.isArray(data) ? data : []);
        console.log("Connected!!!");
      } catch (error) {
        console.log(error);
      }
    },
    onClose: (event: CloseEvent) => {
      console.log("Event Code = ", event.code);
      if (event.code == 1006) {
        console.log("Authentication Error");
        refreshAccessToken().catch((error) => {
          if (error.response && error.response.status === 401) {
            logout();
          }
        });
      }
      console.log("Closed!!!");
      setReconnectionAttempt((prevAttempt) => prevAttempt + 1);
    },
    onError: () => {
      console.log("Error!!!");
    },
    onMessage: (msg) => {
      const data = JSON.parse(msg.data);
      setNewMessage((prev_msg) => [...prev_msg, data.new_message]);
    },
    shouldReconnect: (closeEvent) => {
      if (
        closeEvent.code === 4001 &&
        reconnectionAttempt >= maxConnetionAttempts
      ) {
        setReconnectionAttempt(0);
        return false;
      } else {
        return true;
      }
    },
  });

  return { newMessage, message, setMessage, sendJsonMessage };
};

export default useChatWebSocket;
