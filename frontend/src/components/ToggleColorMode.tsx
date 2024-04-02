import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import createMuiTheme from "../theme/theme";
import { ColorModeContext } from "../context/DarkModeContext";
import Cookies from "js-cookie";

interface ToggleColorModeProps {
  children: React.ReactNode;
}
// Interface is used to define the data coming into a component.

const ToggleColorMode: React.FC<ToggleColorModeProps> = ({ children }) => {
  const storedMode = Cookies.get("colorMode") as "light" | "dark";
  const preferedMode = useMediaQuery("([prefers-color-scheme: dark])");
  const defaultMode = storedMode || (preferedMode ? "dark" : "light");

  const [mode, setMode] = useState<"light" | "dark">(defaultMode);
  // "light" | "dark" : Specifies the type of data that can be accepted to this state object
  //   const [mode, setMode] = useState<"light" | "dark">(
  //     () =>
  //       (Cookies.get("colorMode") as "light" | "dark") ||
  //       (useMediaQuery("([prefers-color-scheme: dark])") ? "dark" : "light")
  //   );

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    Cookies.set("colorMode", mode);
  }, [mode]);

  //   Ensures that the toggle color mode object changes when there is an update
  const colorMode = useMemo(() => ({ toggleColorMode }), [toggleColorMode]);

  const theme = React.useMemo(() => createMuiTheme(mode || "light"), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ToggleColorMode;
