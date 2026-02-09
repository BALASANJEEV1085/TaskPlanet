import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Typography, CircularProgress, Stack, Fade, Container,
    Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Paper
} from '@mui/material';
import axios from 'axios';
import PostCard from '../components/PostCard';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';

const SearchResults = () => {
    const [results, setResults] = useState({ users: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/search?q=${query}`);
                setResults(res.data);
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleUpdatePost = (updatedPost) => {
        setResults(prev => ({
            ...prev,
            posts: prev.posts.map(p => p._id === updatedPost._id ? updatedPost : p)
        }));
    };

    const hasResults = results.users.length > 0 || results.posts.length > 0;

    const getAvatarUrl = (user) => {
        if (!user) return '';
        if (user.avatar) {
            if (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) return user.avatar;
            return `http://localhost:5000/${user.avatar.replace(/\\/g, '/')}`;
        }
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    };

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TravelExploreRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    <span style={{ color: '#6366f1' }}>"{query}"</span>
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Scouring the universe...
                    </Typography>
                </Box>
            ) : !hasResults ? (
                <Fade in={true}>
                    <Box sx={{ textAlign: 'center', mt: 8, p: 4, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>No coordinates match</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            We couldn't find anything matching your search. Try different keywords!
                        </Typography>
                    </Box>
                </Fade>
            ) : (
                <Stack spacing={4}>
                    {/* Users Section */}
                    {results.users.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, px: 1 }}>Users</Typography>
                            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <List disablePadding>
                                    {results.users.map((user, index) => (
                                        <React.Fragment key={user._id}>
                                            <ListItem
                                                button
                                                onClick={() => navigate(`/user/${user._id}`)}
                                                sx={{
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={getAvatarUrl(user)} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={user.username}
                                                    secondary={user.bio || 'SocialPlanet Explorer'}
                                                    primaryTypographyProps={{ fontWeight: 600 }}
                                                />
                                            </ListItem>
                                            {index < results.users.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}

                    {/* Posts Section */}
                    {results.posts.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, px: 1 }}>Posts</Typography>
                            <Stack spacing={0}>
                                {results.posts.map((post, index) => (
                                    <Fade in={true} timeout={400 + index * 100} key={post._id}>
                                        <Box>
                                            <PostCard
                                                post={post}
                                                onUpdate={handleUpdatePost}
                                            />
                                        </Box>
                                    </Fade>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            )}
        </Container>
    );
};

export default SearchResults;
