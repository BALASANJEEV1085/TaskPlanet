import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Container, CircularProgress, Typography, Paper,
    Alert, AlertTitle, Chip, Stack, Divider
} from '@mui/material';
import PostCard from '../components/PostCard';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const SecureSharedContent = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [content, setContent] = useState(null);
    const [contentType, setContentType] = useState(null);

    useEffect(() => {
        const fetchSharedContent = async () => {
            try {
                const res = await axios.get(`https://socialsplanet.onrender.com/api/secure-share/${hash}`);
                setContent(res.data.data);
                setContentType(res.data.type);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching shared content:', err);
                setError(err.response?.data?.msg || 'Failed to load shared content');
                setLoading(false);
            }
        };

        fetchSharedContent();
    }, [hash]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                    🔐 Decrypting secure content...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Alert severity="error" icon={<LockIcon />}>
                    <AlertTitle>Access Denied</AlertTitle>
                    {error}
                </Alert>
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        This encrypted link may be invalid, corrupted, or the content has been deleted.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* Security Banner */}
            <Paper sx={{
                p: 2,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2
            }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <VerifiedUserIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Secure Encrypted Link
                        </Typography>
                        <Typography variant="caption">
                            This content is protected with AES-256 encryption
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Divider sx={{ mb: 3 }} />

            {/* Content Display */}
            {contentType === 'post' && content && (
                <PostCard
                    post={content}
                    onUpdate={() => { }}
                    onDelete={() => { }}
                />
            )}

            {contentType === 'user' && content && (
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
                        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 2 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {content.user.followers?.length || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Followers
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {content.user.following?.length || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Following
                                </Typography>
                            </Box>
                        </Stack>
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

            {/* Security Footer */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    🔒 This link uses military-grade encryption to protect content privacy
                </Typography>
            </Paper>
        </Container>
    );
};

export default SecureSharedContent;
