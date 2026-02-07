import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, IconButton, Avatar, CircularProgress,
    Typography, Slider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CropIcon from '@mui/icons-material/Crop';
import CheckIcon from '@mui/icons-material/Check';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cropper from 'react-easy-crop';

const EditProfileModal = ({ open, onClose }) => {
    const { user, setUser } = useContext(AuthContext);
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);

    // Cropping states
    const [cropMode, setCropMode] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    useEffect(() => {
        if (open && user) {
            setUsername(user.username || '');
            setBio(user.bio || '');
            setImagePreview(user.avatar || '');
            setImage(null);
            setCropMode(false);
            setImageToCrop(null);
        }
    }, [open, user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setCropMode(true);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

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

    const handleCropConfirm = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });

            setImage(croppedFile);
            setImagePreview(URL.createObjectURL(croppedBlob));
            setCropMode(false);
            setImageToCrop(null);
        } catch (error) {
            console.error('Error cropping image:', error);
            toast.error('Failed to crop image');
        }
    };

    const handleCropCancel = () => {
        setCropMode(false);
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('bio', bio);
            if (image) {
                formData.append('profilePicture', image);
            } else if (imagePreview && !imagePreview.startsWith('blob:') && !imagePreview.startsWith('http')) {
                formData.append('avatar', imagePreview);
            }

            const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = { ...user, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success('Profile updated successfully');
            onClose();
        } catch (err) {
            console.error('Update profile error', err);
            toast.error(err.response?.data?.msg || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Main Edit Profile Dialog */}
            <Dialog open={open && !cropMode} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Edit Profile</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={
                                    imagePreview
                                        ? (imagePreview.startsWith('http') || imagePreview.startsWith('blob:') || imagePreview.startsWith('data:')
                                            ? imagePreview
                                            : `http://localhost:5000/${imagePreview.replace(/\\/g, '/')}`)
                                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                                }
                                sx={{
                                    width: 100,
                                    height: 100,
                                    border: '4px solid white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    opacity: loading ? 0.5 : 1,
                                    transition: 'opacity 0.3s'
                                }}
                            />
                            {loading && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <CircularProgress size={40} thickness={4} />
                                </Box>
                            )}
                            <IconButton
                                component="label"
                                disabled={loading}
                                sx={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    bgcolor: 'primary.main', color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    '&:disabled': { bgcolor: 'grey.400' },
                                    width: 32, height: 32
                                }}
                            >
                                <PhotoCamera fontSize="small" />
                                <input hidden accept="image/*" type="file" onChange={handleImageChange} disabled={loading} />
                            </IconButton>
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        margin="normal"
                        multiline
                        rows={3}
                        size="small"
                        placeholder="Tell us about yourself..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{ px: 3, borderRadius: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Cropping Dialog */}
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
                    <Button onClick={handleCropCancel} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleCropConfirm}
                        variant="contained"
                        startIcon={<CheckIcon />}
                        sx={{ px: 3, borderRadius: 2 }}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditProfileModal;
