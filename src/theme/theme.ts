import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d4af37', // ゴールド
      light: '#f4e4c1',
      dark: '#b8941f',
      contrastText: '#1a1410',
    },
    secondary: {
      main: '#4a7c2c', // 深緑
      light: '#6b9d4a',
      dark: '#2d5016',
      contrastText: '#f5e6d3',
    },
    error: {
      main: '#c62828',
      light: '#ef5350',
      dark: '#8e0000',
    },
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#5c6bc0',
      light: '#7986cb',
      dark: '#3f51b5',
    },
    success: {
      main: '#4a7c2c',
      light: '#6b9d4a',
      dark: '#2d5016',
    },
    background: {
      default: '#1a1410',
      paper: '#2d2419',
    },
    text: {
      primary: '#f5e6d3',
      secondary: '#d4c5b0',
    },
  },
  typography: {
    fontFamily: [
      'Cinzel',
      'serif',
      '-apple-system',
      'BlinkMacSystemFont',
    ].join(','),
    h1: {
      fontFamily: 'MedievalSharp, Cinzel, serif',
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#d4af37',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    },
    h2: {
      fontFamily: 'MedievalSharp, Cinzel, serif',
      fontSize: '2rem',
      fontWeight: 600,
      color: '#d4af37',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    },
    h3: {
      fontFamily: 'Cinzel, serif',
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#f4e4c1',
    },
    h4: {
      fontFamily: 'Cinzel, serif',
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#f4e4c1',
    },
    h5: {
      fontFamily: 'Cinzel, serif',
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Cinzel, serif',
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: 'Cinzel, serif',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#d4af37 #1a1410',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 12,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: '#1a1410',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #d4af37 0%, #b8941f 100%)',
            borderRadius: 6,
            border: '2px solid #1a1410',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          padding: '8px 20px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #3e2723 0%, #5d4037 50%, #3e2723 100%)',
          border: '2px solid #d4af37',
          color: '#f4e4c1',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5d4037 0%, #6d4c41 50%, #5d4037 100%)',
            borderColor: '#f4e4c1',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 50%, #d4af37 100%)',
          border: '2px solid #f4e4c1',
          color: '#1a1410',
          '&:hover': {
            background: 'linear-gradient(135deg, #f4e4c1 0%, #d4af37 50%, #f4e4c1 100%)',
          },
        },
        outlined: {
          border: '2px solid #d4af37',
          color: '#d4af37',
          '&:hover': {
            border: '2px solid #f4e4c1',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
          border: '2px solid #8b7355',
          boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 4px 8px rgba(0, 0, 0, 0.3)',
          color: '#1a1410',
          '& .MuiTypography-root': {
            color: '#1a1410',
          },
          '& .MuiChip-root': {
            borderColor: '#8b7355',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2d2419 0%, #3e2f23 100%)',
          border: '2px solid #d4af37',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #3e2723 0%, #5d4037 50%, #3e2723 100%)',
          borderBottom: '3px solid #d4af37',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6), inset 0 -2px 8px rgba(212, 175, 55, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(245, 230, 211, 0.3)',
            '& fieldset': {
              borderColor: '#5d4037',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#8b7355',
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d4af37',
              borderWidth: 3,
              boxShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
            },
            '& input': {
              color: '#1a1410',
            },
            '& textarea': {
              color: '#1a1410',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#5d4037',
            fontFamily: 'Cinzel, serif',
            fontWeight: 600,
            '&.Mui-focused': {
              color: '#8b7355',
              fontWeight: 700,
            },
          },
          '& .MuiFormHelperText-root': {
            color: '#5d4037',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#5d4037',
          fontFamily: 'Cinzel, serif',
          fontWeight: 600,
          '&.Mui-focused': {
            color: '#8b7355',
            fontWeight: 700,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'rgba(245, 230, 211, 0.3)',
          '& fieldset': {
            borderColor: '#5d4037',
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: '#8b7355',
            borderWidth: 2,
          },
          '&.Mui-focused fieldset': {
            borderColor: '#d4af37',
            borderWidth: 3,
            boxShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
          },
          '& input': {
            color: '#1a1410',
          },
          '& textarea': {
            color: '#1a1410',
          },
        },
        notchedOutline: {
          borderColor: '#5d4037',
          borderWidth: 2,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: '#1a1410',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'Cinzel, serif',
          fontWeight: 600,
          borderWidth: 2,
        },
        filled: {
          background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
          color: '#1a1410',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '3px solid #d4af37',
          boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: 'Cinzel, serif',
          fontWeight: 600,
          color: '#d4c5b0',
          '&.Mui-selected': {
            color: '#d4af37',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: '2px solid',
          fontFamily: 'Cinzel, serif',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
          border: '3px solid #8b7355',
          boxShadow: 'inset 0 0 30px rgba(139, 115, 85, 0.15), 0 8px 24px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          borderBottom: '2px solid #8b7355',
          paddingBottom: 16,
          fontFamily: 'Cinzel, serif',
          color: '#8b7355',
          fontWeight: 700,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#1a1410',
          fontFamily: 'Cinzel, serif',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: '2px solid #8b7355',
          paddingTop: 16,
        },
      },
    },
  },
});

