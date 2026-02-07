import React, { useContext, useState } from 'react';
import {
    Card, CardHeader, CardContent, CardActions,
    Avatar, IconButton, Typography, Box, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onUpdate, onDelete }) => {
    const { user, setUser } = useContext(AuthContext); // Access setUser to update local state on follow
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    // Safety checks
    // Safety checks
    const isOwner = user && post.user && (user.id === post.user._id || user._id === post.user._id);
    // Post likes are array of objects: [{ user: ObjectId, username: String }]
    const isLiked = post.likes && post.likes.some(like => {
        const likeUserId = like.user?._id || like.user || like; // Handle object or ID
        return likeUserId.toString() === (user?.id || user?._id);
    });
    const isFollowing = user?.following?.some(id => (id._id || id).toString() === (post.user?._id || post.user).toString());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleLike = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/posts/like/${post._id}`);
            const updatedLikes = res.data;
            const updatedPost = { ...post, likes: updatedLikes };
            onUpdate(updatedPost);
        } catch (err) {
            console.error('Error liking post', err);
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        setAnchorEl(null);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/posts/${post._id}`);
            if (onDelete) onDelete(post._id);
            toast.success('Post deleted');
        } catch (err) {
            toast.error('Failed to delete post');
        }
        setDeleteDialogOpen(false);
    };

    const handleFollow = async () => {
        try {
            const res = await axios.post(`http://localhost:5000/api/users/follow/${post.user._id}`);

            // Update local user context
            const updatedUser = { ...user, following: res.data.following };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist to local storage

            toast.success(res.data.isFollowing ? `Following ${post.user.username}` : `Unfollowed ${post.user.username}`);
            setAnchorEl(null);
        } catch (err) {
            console.error('Error follow/unfollow user', err);
            toast.error('Failed to update follow status');
        }
    };

    const getAvatarUrl = (u) => {
        if (!u) return '';
        // If u is populated object
        if (typeof u === 'object' && u.avatar) {
            if (u.avatar.startsWith('http') || u.avatar.startsWith('data:')) return u.avatar;
            return `http://localhost:5000/${u.avatar.replace(/\\/g, '/')}`;
        }
        // Fallback or string ID
        const seed = u.username || (typeof u === 'string' ? u : 'user');
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    };

    return (
        <Card sx={{ borderRadius: 4, mb: 2, boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', border: 'none' }}>
            <CardHeader
                avatar={
                    <Avatar
                        src={getAvatarUrl(post.user)}
                        sx={{ width: 44, height: 44, border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                }
                action={
                    <>
                        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                    mt: 1.5,
                                    borderRadius: 2,
                                    minWidth: 150
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {!isOwner && (
                                <MenuItem onClick={() => { navigate(`/user/${post.user._id}`); setAnchorEl(null); }}>
                                    View User
                                </MenuItem>
                            )}

                            {!isOwner && (
                                <MenuItem onClick={handleFollow}>
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </MenuItem>
                            )}

                            {isOwner && (
                                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Delete Post</MenuItem>
                            )}
                        </Menu>
                    </>
                }
                title={
                    <Typography
                        variant="subtitle1"
                        fontWeight="700"
                        sx={{ cursor: 'pointer', lineHeight: 1.2 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/user/${post.user?._id || post.user}`); }}
                    >
                        {post.user?.username || post.username || 'Unknown User'}
                    </Typography>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary">
                        @{post.user?.username?.toLowerCase().replace(/\s/g, '') || post.username?.toLowerCase().replace(/\s/g, '')} • {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
                    </Typography>
                }
                sx={{ pb: 1 }}
            />

            <CardContent sx={{ py: 0, px: 2 }}>
                {post.text && (
                    <Typography variant="body1" color="text.primary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {post.text}
                    </Typography>
                )}
            </CardContent>

            {post.image && (
                <Box sx={{ width: '100%', mt: 1, cursor: 'pointer', px: 2 }} onClick={() => navigate(`/post/${post._id}`)}>
                    <img
                        src={post.image.startsWith('http')
                            ? post.image
                            : `http://localhost:5000/${post.image.replace(/\\/g, '/')}`}
                        alt="Post content"
                        style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '12px' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500?text=Image+Not+Found'; }}
                    />
                </Box>
            )}

            <CardActions sx={{ px: 2, py: 1.5, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mr: 3 }}>
                    <IconButton size="small" onClick={handleLike} color={isLiked ? 'error' : 'default'} sx={{ mr: 0.5 }}>
                        {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                    </IconButton>
                    <Typography variant="body2">{post.likes?.length || 0}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mr: 3 }}>
                    <IconButton size="small" onClick={() => navigate(`/post/${post._id}`)} sx={{ mr: 0.5 }}>
                        <ChatBubbleOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2">{post.comments?.length || 0}</Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <IconButton size="small" onClick={() => {
                        window.history.pushState(null, null, `/post/${post._id}`);
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                    }}>
                        <ShareIcon fontSize="small" />
                    </IconButton>
                </Box>
            </CardActions>
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Delete Post?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this post? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card >
    );
};

export default PostCard;
