import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, CircularProgress, Typography, IconButton, Container,
    TextField, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider,
    Collapse
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendIcon from '@mui/icons-material/Send';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostCard from '../components/PostCard';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const CommentItem = ({ comment, postId, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [replyText, setReplyText] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isLiked = comment.likes && comment.likes.some(id => (id._id || id).toString() === (user?.id || user?._id));

    const handleLike = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/posts/comment/${postId}/${comment._id}/like`);
            onUpdate(res.data);
        } catch (err) {
            console.error('Error liking comment', err);
            toast.error('Failed to like comment');
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/posts/comment/${postId}/${comment._id}/reply`, { text: replyText });
            onUpdate(res.data);
            setReplyText('');
            setShowReplyInput(false);
            toast.success('Reply added');
        } catch (err) {
            console.error('Error replying', err);
            toast.error('Failed to reply');
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = (u) => {
        if (!u) return '';
        if (typeof u === 'object' && u.avatar) {
            if (u.avatar.startsWith('http') || u.avatar.startsWith('data:')) return u.avatar;
            return `http://localhost:5000/${u.avatar}`;
        }
        const seed = u.username || 'user';
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    };

    return (
        <>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                    <Avatar
                        src={getAvatarUrl(comment.user)}
                        alt={comment.username}
                        sx={{ width: 32, height: 32, cursor: 'pointer' }}
                        onClick={() => comment.user && navigate(`/user/${comment.user._id || comment.user}`)}
                    />
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="subtitle2"
                                fontWeight="700"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => comment.user && navigate(`/user/${comment.user._id || comment.user}`)}
                            >
                                {comment.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </Typography>
                        </Box>
                    }
                    secondary={
                        <Box>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                {comment.text}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleLike}>
                                    {isLiked ? <FavoriteIcon fontSize="small" color="error" sx={{ fontSize: 16, mr: 0.5 }} /> : <FavoriteBorderIcon fontSize="small" sx={{ fontSize: 16, mr: 0.5 }} />}
                                    <Typography variant="caption" color="text.secondary">{comment.likes?.length || 0} Likes</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowReplyInput(!showReplyInput)}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">Reply</Typography>
                                </Box>
                            </Box>
                        </Box>
                    }
                />
            </ListItem>

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
                <List disablePadding sx={{ pl: 7 }}>
                    {comment.replies.map((reply, i) => (
                        <ListItem key={i} alignItems="flex-start" sx={{ py: 0.5 }}>
                            <ListItemAvatar sx={{ minWidth: 32 }}>
                                <Avatar
                                    src={getAvatarUrl(reply.user)}
                                    sx={{ width: 24, height: 24 }}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant="caption"
                                            fontWeight="700"
                                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                            onClick={() => {
                                                const userId = reply.user?._id || reply.user;
                                                if (userId) navigate(`/user/${userId}`);
                                            }}
                                        >
                                            {reply.username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(reply.createdAt))}
                                        </Typography>
                                    </Box>
                                }
                                secondary={<Typography variant="body2" fontSize="0.85rem">{reply.text}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            {/* Reply Input */}
            <Collapse in={showReplyInput}>
                <Box component="form" onSubmit={handleReply} sx={{ pl: 7, mt: 1, mb: 2, display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        placeholder={`Reply to @${comment.username}...`}
                        variant="standard"
                        size="small"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <IconButton size="small" type="submit" disabled={!replyText.trim() || loading} color="primary">
                        <SendIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Collapse>

            <Divider component="li" variant="inset" />
        </>
    );
};

const PostDetail = ({ postId }) => {
    const params = useParams();
    const id = postId || params.id;
    const { user } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                console.error('Error fetching post', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setCommentLoading(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/posts/comment/${id}`, { text: commentText });
            setPost(prev => ({ ...prev, comments: res.data }));
            setCommentText('');
            toast.success('Comment added');
        } catch (err) {
            console.error('Error adding comment', err);
            toast.error('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    };

    // Callback to update comments from child component (like/reply)
    const handleCommentsUpdate = (updatedComments) => {
        setPost(prev => ({ ...prev, comments: updatedComments }));
    };

    const getAvatarUrl = (u) => {
        if (!u) return '';
        if (typeof u === 'object' && u.avatar) {
            if (u.avatar.startsWith('http') || u.avatar.startsWith('data:')) return u.avatar;
            return `http://localhost:5000/${u.avatar}`;
        }
        const seed = u.username || 'user';
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!post) {
        return (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography variant="h6">Post not found</Typography>
                <IconButton onClick={() => navigate('/')} color="primary">
                    <ArrowBackRoundedIcon />
                </IconButton>
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="800">
                    Post
                </Typography>
            </Box>

            <PostCard post={post} onUpdate={(updated) => setPost(updated)} />

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    Comments
                </Typography>

                <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Avatar src={getAvatarUrl(user)} sx={{ width: 40, height: 40 }} />
                    <TextField
                        fullWidth
                        placeholder="Write a comment..."
                        variant="outlined"
                        size="small"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'background.paper' }
                        }}
                    />
                    <IconButton
                        type="submit"
                        color="primary"
                        disabled={!commentText.trim() || commentLoading}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            width: 40, height: 40,
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                        }}
                    >
                        {commentLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                    </IconButton>
                </Box>

                <List disablePadding>
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <CommentItem
                                key={comment._id}
                                comment={comment}
                                postId={post._id}
                                onUpdate={handleCommentsUpdate}
                            />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                            No comments yet. Be the first to share your thoughts!
                        </Typography>
                    )}
                </List>
            </Box>
        </Container>
    );
};

export default PostDetail;
