import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#7F56D9',
            light: '#9E77ED',
            dark: '#6941C6',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#F04438',
            light: '#F56D63',
            dark: '#D92D20',
            contrastText: '#ffffff',
        },
        background: {
            default: '#FFFFFF', // Pure white background
            paper: 'rgba(255, 255, 255, 0.8)', // White glass effect
        },
        text: {
            primary: '#101828',
            secondary: '#667085',
        },
    },
    typography: {
        fontFamily: '"Inter", "system-ui", "sans-serif"',
        h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' },
        h3: { fontSize: '1.75rem', fontWeight: 600 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 500 },
        h6: { fontSize: '1rem', fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 300 900;
          font-display: swap;
          src: url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        }
        body {
          background-color: #FFFFFF !important;
          background-image: none !important;
        }
      `,
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#6941C6',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)', // Glassmorphism
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
                elevation1: {
                    boxShadow: '0px 2px 4px rgba(16, 24, 40, 0.05)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid rgba(0, 0, 0, 0.05)', // Subtle border
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: 'none',
                    color: '#101828',
                },
            },
        },
    },
});

export default theme;
