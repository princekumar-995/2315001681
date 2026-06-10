import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Customized Premium Dark Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff', // Vibrant Indigo
      light: '#b47cff',
      dark: '#3f1dcb'
    },
    secondary: {
      main: '#00e5ff', // Neon Cyan
    },
    background: {
      default: '#0a0b0d', // Ultra deep grey
      paper: '#12141c', // Sleek dashboard card grey
    },
    text: {
      primary: '#f5f6fa',
      secondary: '#a0a5b5'
    },
    divider: 'rgba(255, 255, 255, 0.08)'
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "sans-serif"',
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0))',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.3)'
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
