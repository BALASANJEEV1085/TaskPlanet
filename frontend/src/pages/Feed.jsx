import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Container, Typography, Stack, CircularProgress, Chip, useTheme } from '@mui/material';
import axios from 'axios';
import PostCard from '../components/PostCard';
import CreatePostWidget from '../components/CreatePostWidget';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All Post');
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const { refreshKey } = useOutletContext() || {};

    const fetchPosts = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:5000/api/posts';

            if (filter === 'Most Liked') {
                url += '?sort=liked';
            } else if (filter === 'Most Commented') {
                url += '?sort=commented';
            }

            const res = await axios.get(url);
            setPosts(res.data);
        } catch (err) {
            console.error('Error fetching posts', err);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshKey, filter]);

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    const handlePostDelete = (postId) => {
        setPosts(posts.filter(p => p._id !== postId));
    };

    return (
        <Container maxWidth="sm" sx={{ py: 3, minHeight: '100vh' }}>

            <CreatePostWidget onPostCreated={handlePostCreated} />

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    mb: 3,
                    overflowX: 'auto',
                    pb: 1,
                    px: { xs: 2, sm: 0 }, // Add padding on mobile so first/last chips aren't flush against edge
                    '::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar for Chrome/Safari/Opera
                    msOverflowStyle: 'none',  // IE and Edge
                    scrollbarWidth: 'none',  // Firefox
                }}
                justifyContent={{ xs: 'flex-start', sm: 'center' }}
            >
                {['All Post', 'For You', 'Most Liked', 'Most Commented'].map((label) => (
                    <Chip
                        key={label}
                        label={label}
                        clickable
                        onClick={() => setFilter(label)}
                        sx={{
                            fontWeight: 600,
                            flexShrink: 0, // Prevent chips from shrinking
                            bgcolor: filter === label ? 'primary.main' : 'transparent',
                            color: filter === label ? '#fff' : 'text.primary',
                            border: filter === label ? 'none' : '1px solid',
                            borderColor: filter === label ? 'transparent' : 'divider',
                            '&:hover': {
                                bgcolor: filter === label ? 'primary.dark' : 'action.hover',
                                borderColor: filter === label ? 'transparent' : 'text.primary'
                            }
                        }}
                    />
                ))}
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={2}>
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onUpdate={handlePostUpdate}
                            onDelete={handlePostDelete}
                        />
                    ))}
                    {posts.length === 0 && (
                        <Box sx={{ textAlign: 'center', mt: 10, opacity: 0.6 }}>
                            <Typography variant="h6">No posts yet</Typography>
                        </Box>
                    )}
                </Stack>
            )}
        </Container>
    );
};

export default Feed;
