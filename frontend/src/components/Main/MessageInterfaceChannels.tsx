import {
  Box,
  IconButton,
  Typography,
  useTheme,
  AppBar,
  Toolbar,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MEDIA_URL } from "../../config";
import { useParams } from "react-router-dom";
import CategoryIcon from "../../assets/home-category.png";
import { Server } from "../../@types/server";
import ServerChannels from "../SecondaryDraw/ServerChannels";
import JoinServerButton from "../Membership/JoinServerButton";

interface ServerChannelProps {
  data: Server[];
}
const MessageInterfaceChannels = (props: ServerChannelProps) => {
  const { data } = props;
  const theme = useTheme();
  const { serverId, channelId } = useParams();
  const [sideMenu, setSideMenu] = useState(false);

  const channelName =
    data
      ?.find((server) => server.id == Number(serverId))
      ?.channel_server?.find((channel) => channel.id === Number(channelId))
      ?.name || "Home";

  const toggleDrawer =
    (open: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setSideMenu(open);
    };

  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    if (isSmallScreen && sideMenu) {
      setSideMenu(false);
    }
  }, [isSmallScreen]);

  const list = () => (
    <Box
      sx={{ paddingTop: `${theme.primaryAppBar.height}px`, minWidth: 200 }}
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <ServerChannels data={data} />
    </Box>
  );
  return (
    <>
      <AppBar
        sx={{
          backgroundColor: theme.palette.background.default,
          //   height: theme.primaryAppBar.height,
          //   display: "flex",
          //   alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
        color="default"
        position="sticky"
        elevation={0}
      >
        <Toolbar
          variant="dense"
          sx={{
            minHeight: theme.primaryAppBar.height,
            height: theme.primaryAppBar.height,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <ListItemAvatar sx={{ minWidth: "40px" }}>
              <Avatar
                alt="Server Icon"
                src={
                  data?.[0]?.icon
                    ? `${MEDIA_URL}${data?.[0]?.icon}`
                    : CategoryIcon
                }
                sx={{ width: 30, height: 30 }}
              />
            </ListItemAvatar>
          </Box>
          <Typography noWrap component="div">
            {channelName}
          </Typography>
          <Box sx={{ flexGrow: 1 }}></Box>
          <JoinServerButton />
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          <Drawer anchor="left" open={sideMenu} onClose={toggleDrawer(false)}>
            {list()}
          </Drawer>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default MessageInterfaceChannels;
