import { useContext } from 'react';
import { createTheme } from '@mui/material/styles';
import { ThemeContext } from '../context/ThemeContext';

const useTheme = () => {
  const { mode } = useContext(ThemeContext);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'dark' 
              ? '0 4px 6px rgba(0, 0, 0, 0.2)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  return { theme };
};

export default useTheme;
