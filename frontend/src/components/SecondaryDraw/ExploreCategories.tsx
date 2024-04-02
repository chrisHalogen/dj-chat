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
import { Link } from "react-router-dom";
import CategoryIcon from "../../assets/home-category.png";

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

const ExploreCategories = () => {
  const { fetchData, dataCRUD, isLoading, error } = useCrud<Category>(
    [],
    "/server/category/"
  );
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  useEffect(() => {
    fetchData();
  }, []);
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
        Explore
      </Box>
      <List sx={{ py: 0 }}>
        {dataCRUD.map((item) => (
          <ListItem
            disablePadding
            key={item.id}
            sx={{ display: "block" }}
            dense={true}
          >
            <Link
              to={`/explore/${item.name}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItemButton sx={{ minHeight: 48 }}>
                <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
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
                </ListItemIcon>
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
        ))}
      </List>
    </>
  );
};

export default ExploreCategories;
