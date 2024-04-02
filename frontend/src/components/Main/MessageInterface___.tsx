import { useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import useCrud from "../../hooks/useCrud";
import { Server } from "../../@types/server";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import MessageInterfaceChannels from "./MessageInterfaceChannels";
import Scroll from "./Scroll";
import React from "react";
import { useAuthService } from "../../services/AuthServices";

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

const MessageInterface = (props: ServerChannelProps) => {
  const { data } = props;
  const theme = useTheme();
  const [newMessage, setNewMessage] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const { serverId, channelId } = useParams();
  const server_name = data?.[0]?.name ?? "Server";
  const access = localStorage.getItem("access_token");
  const { logout, refreshAccessToken } = useAuthService();
  const [reconnectionAttempt, setReconnectionAttempt] = useState(0);
  const maxConnetionAttempts = 4;

  const socketUrl = channelId
    ? `ws://127.0.0.1:8000/${serverId}/${channelId}/?token=${access}`
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

  //   const sendHello = () => {
  //     const message = { text: "hello" };
  //     sendJsonMessage(message);
  //   };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendJsonMessage({ type: "message", message } as SendMessageData);
      setMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendJsonMessage({ type: "message", message } as SendMessageData);
    setMessage("");
  };

  // The format is a string, and it will return string
  function formatTimeStamp(timestamp: string): string {
    const date = new Date(Date.parse(timestamp));
    const formattedDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate} at ${formattedTime}`;
  }

  return (
    <>
      <MessageInterfaceChannels data={data} />
      {channelId === undefined ? (
        <Box
          sx={{
            overflow: "hidden",
            p: { xs: 0 },
            height: `calc(80vh)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              letterSpacing={"-0.5px"}
              sx={{ px: 5, maxWidth: "600px" }}
            >
              Welcome to {server_name}
            </Typography>
            <Typography>
              {data?.[0]?.description ?? "This is our Home"}
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ overflow: "hidden", p: 0, height: `calc(100vh-100px)` }}>
            <Scroll>
              <List sx={{ width: "100%", bgcolor: "Background.paper" }}>
                {newMessage.map((msg: Message, index: number) => {
                  return (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar alt="user image" />
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{
                          fontSize: "12px",
                          variant: "body2",
                        }}
                        primary={
                          <>
                            <Typography
                              component="span"
                              variant="body1"
                              color="text.primary"
                              sx={{ display: "inline", fontWeight: 600 }}
                            >
                              {msg.sender}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="textSecondary"
                            >
                              {" at "}
                              {formatTimeStamp(msg.timestamp)}
                            </Typography>
                          </>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body1"
                              style={{
                                overflow: "visible",
                                whiteSpace: "normal",
                                textOverflow: "clip",
                              }}
                              sx={{
                                display: "inline",
                                lineHeight: 1.2,
                                fontWeight: 400,
                                letterSpacing: "-0.2px",
                              }}
                              component="span"
                              color="text.primary"
                            >
                              {msg.content}
                            </Typography>
                          </React.Fragment>
                        }
                      ></ListItemText>
                    </ListItem>
                    // <div key={index}>
                    //   <p>{msg.sender}</p>
                    //   <p>{msg.content}</p>
                    // </div>
                  );
                })}
              </List>
            </Scroll>
          </Box>
          <Box sx={{ position: "sticky", bottom: 0, width: "100" }}>
            <form
              onSubmit={handleSubmit}
              style={{
                bottom: 0,
                right: 0,
                padding: "1rem",
                backgroundColor: theme.palette.background.default,
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex" }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </form>
          </Box>
          {/* {newMessage.map((msg: Message, index: number) => {
            return (
              <div key={index}>
                <p>{msg.sender}</p>
                <p>{msg.content}</p>
              </div>
            );
          })}
          <form>
            <label htmlFor="">
              Enter Message{" "}
              <input
                type="text"
                name=""
                id=""
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          </form>
          <button
            onClick={() => {
              sendJsonMessage({ type: "message", message });
              setMessage("");
            }}
          >
            Send Message
          </button> */}
        </>
      )}
    </>
  );
};

export default MessageInterface;
