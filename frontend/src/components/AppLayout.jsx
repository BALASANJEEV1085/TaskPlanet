import React, { useContext, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, IconButton, Box, Avatar, InputBase,
    Container, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import EditProfileModal from './EditProfileModal';

const SearchContainer = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: 50,
    backgroundColor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1A1A1A',
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    flex: 1, // Allow to grow on mobile
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(2),
        width: 'auto',
        minWidth: '400px',
        flex: 'none', // Reset on desktop
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    flex: 1,
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 2),
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

const SearchButton = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    }
}));

const AppLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const { mode, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [editProfileOpen, setEditProfileOpen] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${e.target.value}`);
        }
    };

    // ... (rest of search/menu handlers) ...

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditProfile = () => {
        setEditProfileOpen(true);
        handleMenuClose();
    };

    const handleNavigate = (path) => {
        navigate(path);
        handleMenuClose();
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/login');
    };

    const getAvatarUrl = () => {
        if (!user) return '';
        if (user.avatar) {
            if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) return user.avatar;
            return `http://localhost:5000/${user.avatar.replace(/\\/g, '/')}`;
        }
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    };

    const handleHomeClick = () => {
        if (location.pathname === '/' || location.pathname === '') {
            setRefreshKey(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="sticky" color="inherit" sx={{ boxShadow: 'none' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGuttters sx={{ justifyContent: 'space-between' }}>

                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                onClick={handleHomeClick}
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: (theme) => theme.palette.mode === 'light' ? '1px solid #EAECF0' : '1px solid rgba(255, 255, 255, 0.15)',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <HomeRoundedIcon color="action" />
                            </IconButton>

                            <SearchContainer sx={{ mx: 0 }}>
                                <StyledInputBase
                                    placeholder="Search users, posts..."
                                    inputProps={{ 'aria-label': 'search' }}
                                    onKeyPress={handleSearch}
                                />
                                <SearchButton>
                                    <SearchIcon fontSize="small" />
                                </SearchButton>
                            </SearchContainer>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{ p: 0.5, border: '2px solid transparent', '&:hover': { borderColor: 'primary.main' } }}
                                >
                                    <Avatar
                                        src={getAvatarUrl()}
                                        sx={{ width: 40, height: 40 }}
                                    />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                            mt: 1.5,
                                            width: 200,
                                            borderRadius: 2
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem onClick={() => handleNavigate(`/user/${user?.id}`)}>
                                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>Profile</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleNavigate(`/user/${user?.id}/followers`)}>
                                        <ListItemIcon><GroupIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>Followers</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleNavigate(`/user/${user?.id}/following`)}>
                                        <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                                        <ListItemText>Following</ListItemText>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => { toggleTheme(); handleMenuClose(); }}>
                                        <ListItemIcon>
                                            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                                        </ListItemIcon>
                                        <ListItemText>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</ListItemText>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                                        <ListItemText>Sign Out</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet context={{ refreshKey }} />
            </Box>

            <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
        </Box>
    );
};

export default AppLayout;
