import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Stack, Fade, Container } from '@mui/material';
import axios from 'axios';
import PostCard from '../components/PostCard';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';

const SearchResults = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/search?q=${query}`);
                setPosts(res.data);
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleUpdatePost = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TravelExploreRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Results for <span style={{ color: '#6366f1' }}>"{query}"</span>
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Scouring the universe...
                    </Typography>
                </Box>
            ) : posts.length === 0 ? (
                <Fade in={true}>
                    <Box sx={{ textAlign: 'center', mt: 8, p: 4, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>No coordinates match</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            We couldn't find anything matching your search. Try different keywords!
                        </Typography>
                    </Box>
                </Fade>
            ) : (
                <Stack spacing={0}>
                    {posts.map((post, index) => (
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
            )}
        </Container>
    );
};

export default SearchResults;
