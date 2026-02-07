import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Avatar, Button, Stack, CircularProgress, Divider, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { toast } from 'react-toastify';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import EditProfileModal from '../components/EditProfileModal';
import Cropper from 'react-easy-crop';
import CropIcon from '@mui/icons-material/Crop';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Slider from '@mui/material/Slider';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser, setUser } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openShareModal, setOpenShareModal] = useState(false);
    const navigate = useNavigate();

    // Cropping state
    const [cropMode, setCropMode] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [uploading, setUploading] = useState(false);

    const isOwnProfile = currentUser?.id === id || currentUser?._id === id;
    const isFollowing = currentUser?.following?.some(followId => followId.toString() === id);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${id}`);
                setUserData(res.data.user);
                setPosts(res.data.posts);
            } catch (err) {
                console.error('Error fetching user data', err);
                toast.error('User not found');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [id, currentUser]);

    // Cropping helpers
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setCropMode(true);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                // Clear the input value so the same file can be selected again if needed
                e.target.value = null;
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async () => {
        setUploading(true);
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('profilePicture', croppedFile);

            const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(res.data);
            setUserData(prev => ({ ...prev, avatar: res.data.avatar }));
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Profile picture updated');

            // Close cropper
            setCropMode(false);
            setImageToCrop(null);
        } catch (err) {
            console.error('Error updating avatar', err);
            toast.error('Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleCropCancel = () => {
        setCropMode(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleFollow = async () => {
        try {
            const res = await axios.post(`http://localhost:5000/api/users/follow/${id}`);
            const updatedUser = { ...currentUser, following: res.data.following };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setUserData(prev => ({
                ...prev,
                followers: res.data.followers
            }));

            toast.success(res.data.isFollowing ? `Following ${userData.username}` : `Unfollowed ${userData.username}`);
        } catch (err) {
            console.error('Error following user', err);
            toast.error(err.response?.data?.msg || 'Failed to follow user');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!userData) return <Box sx={{ textAlign: 'center', mt: 10 }}><Typography>User not found</Typography></Box>;

    const getAvatarUrl = () => {
        if (!userData.avatar) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`;
        if (userData.avatar.startsWith('http')) return userData.avatar;
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.avatar}`;
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                <ArrowBackRoundedIcon />
            </IconButton>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, px: 2 }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                        src={getAvatarUrl()}
                        sx={{
                            width: 120,
                            height: 120,
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    />
                    {isOwnProfile && (
                        <IconButton
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                width: 36,
                                height: 36,
                                border: '2px solid white'
                            }}
                            component="label"
                        >
                            <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                            <CameraAltIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                <Typography variant="h5" fontWeight="800" sx={{ mb: 0.5 }}>
                    {userData.username}
                </Typography>

                {userData.bio && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{
                            maxWidth: 400,
                            mb: 2,
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6
                        }}
                    >
                        {userData.bio}
                    </Typography>
                )}

                <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
                    <Box sx={{ cursor: 'pointer', textAlign: 'center' }}>
                        <Typography fontWeight="bold" variant="h6">{posts.length}</Typography>
                        <Typography variant="caption" color="text.secondary">Posts</Typography>
                    </Box>
                    <Box sx={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate(`/user/${id}/followers`)}>
                        <Typography fontWeight="bold" variant="h6">{userData.followers?.length || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Followers</Typography>
                    </Box>
                    <Box sx={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate(`/user/${id}/following`)}>
                        <Typography fontWeight="bold" variant="h6">{userData.following?.length || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Following</Typography>
                    </Box>
                </Stack>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {!isOwnProfile && (
                        <Button
                            variant={isFollowing ? "outlined" : "contained"}
                            onClick={handleFollow}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 4, fontWeight: 600 }}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    )}

                    {isOwnProfile && (
                        <Button
                            variant="outlined"
                            onClick={() => setOpenEditModal(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 4, fontWeight: 600, color: 'text.primary', borderColor: 'divider' }}
                        >
                            Edit Profile
                        </Button>
                    )}

                    <IconButton onClick={() => setOpenShareModal(true)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <ShareIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Divider />



            <EditProfileModal open={openEditModal} onClose={() => setOpenEditModal(false)} />

            <Dialog open={openShareModal} onClose={() => setOpenShareModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Share Profile</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4, gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/user/${id}`}
                            alt="Profile QR Code"
                            style={{ display: 'block', width: '200px', height: '200px' }}
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary">Scan to visit profile</Typography>

                    <Box sx={{ display: 'flex', width: '100%', gap: 1, mt: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            value={`${window.location.origin}/user/${id}`}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/user/${id}`);
                                toast.success('Link copied!');
                                setOpenShareModal(false);
                            }}
                            startIcon={<ContentCopyIcon />}
                        >
                            Copy
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={cropMode} onClose={handleCropCancel} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CropIcon />
                        <Typography variant="h6" fontWeight="bold">Adjust Your Photo</Typography>
                    </Box>
                    <IconButton onClick={handleCropCancel} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0, position: 'relative', height: 400, bgcolor: 'black' }}>
                    {imageToCrop && (
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    )}
                </DialogContent>
                <DialogContent sx={{ py: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 1 }}>
                        Zoom
                    </Typography>
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e, zoom) => setZoom(zoom)}
                        sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                        Drag to reposition • Pinch or use slider to zoom
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCropCancel} color="inherit" disabled={uploading}>Cancel</Button>
                    <Button
                        onClick={handleCropConfirm}
                        variant="contained"
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                        sx={{ px: 3, borderRadius: 2 }}
                    >
                        {uploading ? 'Updating...' : 'Apply'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            pb: 1,
                            display: 'inline-block',
                            borderBottom: '3px solid',
                            borderColor: 'primary.main',
                            px: 1,
                            mb: -0.2
                        }}
                    >
                        POSTS
                    </Typography>
                </Box>

                <Stack spacing={3} maxWidth="sm" sx={{ mx: 'auto' }}>
                    {posts.map(post => (
                        <PostCard
                            key={post._id}
                            post={{ ...post, user: userData }} // Ensure user details are passed if missing
                            onUpdate={(updated) => setPosts(posts.map(p => p._id === updated._id ? updated : p))}
                            onDelete={(deletedId) => setPosts(posts.filter(p => p._id !== deletedId))}
                        />
                    ))}
                </Stack>
            </Box>

            {posts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">No posts yet</Typography>
                </Box>
            )}
        </Container>
    );
};

export default UserProfile;
