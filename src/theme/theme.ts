import { createTheme } from "@mui/material/styles";

export const quantoraTheme = createTheme({
  palette: {
    mode: "dark",

    background: {
      default: "#080B12",
      paper: "#11151F",
    },

    primary: {
      main: "#00D4FF",
    },

    secondary: {
      main: "#7C5CFC",
    },

    success: {
      main: "#22C55E",
    },

    error: {
      main: "#EF4444",
    },

    text: {
      primary: "#F8FAFC",
      secondary: "#94A3B8",
    },

    divider: "#242B3A",
  },

  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },

      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#0D111A",

            "& fieldset": {
              borderColor: "#242B3A",
            },

            "&:hover fieldset": {
              borderColor: "#3A465A",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#00D4FF",
            },
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 48,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});