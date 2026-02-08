import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Container, CircularProgress, Typography, Paper,
    Alert, AlertTitle, Chip, Stack, Divider
} from '@mui/material';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow } from 'date-fns';

const SharedContent = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [content, setContent] = useState(null);
    const [shareInfo, setShareInfo] = useState(null);

    useEffect(() => {
        const fetchSharedContent = async () => {
            try {
                const res = await axios.get(`https://socialsplanet.onrender.com/api/share/${token}`);
                setContent(res.data.data);
                setShareInfo({
                    accessCount: res.data.accessCount,
                    expiresAt: res.data.expiresAt,
                    type: res.data.type
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching shared content:', err);
                setError(err.response?.data?.msg || 'Failed to load shared content');
                setLoading(false);
            }
        };

        fetchSharedContent();
    }, [token]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                    Loading shared content...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Alert severity="error">
                    <AlertTitle>Access Denied</AlertTitle>
                    {error}
                </Alert>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        This link may have expired or been revoked.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* Share Info Banner */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Chip
                        icon={<VisibilityIcon />}
                        label={`${shareInfo.accessCount} views`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        icon={<AccessTimeIcon />}
                        label={`Expires ${formatDistanceToNow(new Date(shareInfo.expiresAt), { addSuffix: true })}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                    />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    🔒 This is a secure, time-limited share link
                </Typography>
            </Paper>

            <Divider sx={{ mb: 3 }} />

            {/* Content Display */}
            {shareInfo.type === 'post' && content && (
                <PostCard
                    post={content}
                    onUpdate={() => { }}
                    onDelete={() => { }}
                />
            )}

            {shareInfo.type === 'user' && content && (
                <Box>
                    <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {content.user.username}
                        </Typography>
                        {content.user.bio && (
                            <Typography variant="body2" color="text.secondary">
                                {content.user.bio}
                            </Typography>
                        )}
                    </Paper>

                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Recent Posts
                    </Typography>
                    <Stack spacing={2}>
                        {content.posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={{ ...post, user: content.user }}
                                onUpdate={() => { }}
                                onDelete={() => { }}
                            />
                        ))}
                    </Stack>

                    {content.posts.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No posts yet
                        </Typography>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default SharedContent;
