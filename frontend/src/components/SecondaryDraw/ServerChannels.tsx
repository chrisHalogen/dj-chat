import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import useCrud from "../../hooks/useCrud";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { MEDIA_URL } from "../../config";
import { Link, useParams } from "react-router-dom";
import CategoryIcon from "../../assets/home-category.png";

interface Server {
  id: number;
  name: string;
  category: string;
  icon: string;
}

interface ServerChannelsProps {
  data: Server[];
}

// const ServerChannels: React.FC<ServerChannelsProps> = ({data}) => {
const ServerChannels = (props: ServerChannelsProps) => {
  const { data } = props;
  const { serverId } = useParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const server_name = data?.[0]?.name ?? "Server";

  return (
    <>
      <Box
        sx={{
          height: "50px",
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="body1"
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {server_name}
        </Typography>
      </Box>
      <List sx={{ py: 0 }}>
        {data.flatMap((obj) =>
          obj.channel_server.map((item) => (
            <ListItem
              disablePadding
              key={item.id}
              sx={{ display: "block", maxHeight: "40px" }}
              dense={true}
            >
              <Link
                to={`/server/${serverId}/${item.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItemButton sx={{ minHeight: 48 }}>
                  {/* <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                    <ListItemAvatar sx={{ minWidth: "0px" }}>
                      <img
                        src={
                          item.icon ? `${MEDIA_URL}${item.icon}` : CategoryIcon
                        }
                        alt={item.name}
                        style={{
                          width: "25px",
                          height: "25px",
                          display: "block",
                          margin: "auto",
                          filter: isDarkMode ? "invert(100%)" : "none",
                        }}
                      />
                    </ListItemAvatar>
                  </ListItemIcon> */}
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        textAlign="start"
                        paddingLeft={1}
                      >
                        {item.name}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          ))
        )}
      </List>
    </>
  );
};

export default ServerChannels;
