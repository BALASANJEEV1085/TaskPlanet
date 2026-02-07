import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

const getThemeConfig = (mode) => ({
    palette: {
        mode,
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
            default: mode === 'light' ? '#FFFFFF' : '#000000',
            paper: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(10, 10, 10, 0.95)',
        },
        text: {
            primary: mode === 'light' ? '#101828' : '#FFFFFF',
            secondary: mode === 'light' ? '#667085' : '#A0A0A0',
        },
        action: {
            active: mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
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
                    background-color: ${mode === 'light' ? '#FFFFFF' : '#000000'} !important;
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
                    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.15)',
                },
                elevation1: {
                    boxShadow: mode === 'light'
                        ? '0px 2px 4px rgba(16, 24, 40, 0.05)'
                        : '0px 2px 4px rgba(0, 0, 0, 0.5)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: mode === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(18, 18, 18, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: mode === 'light'
                        ? '0px 2px 8px rgba(0, 0, 0, 0.04)'
                        : '0px 2px 8px rgba(0, 0, 0, 0.5)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: mode === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.15)',
                    boxShadow: 'none',
                    color: mode === 'light' ? '#101828' : '#FFFFFF',
                },
            },
        },
    },
});

export const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => createTheme(getThemeConfig(mode)), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
