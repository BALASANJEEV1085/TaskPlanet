import React, { useState, useContext } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton,
    Avatar, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreatePostModal = ({ open, onClose, onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async () => {
        if (!text && !image) {
            toast.error('Please add some text or an image');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('text', text);
            if (image) {
                formData.append('image', image);
            }

            const res = await axios.post('http://localhost:5000/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onPostCreated(res.data);
            toast.success('Post created successfully!');
            handleClose();
        } catch (err) {
            toast.error('Failed to create post');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setText('');
        setImage(null);
        setImagePreview(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Create Post</Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {user?.username?.[0].toUpperCase()}
                    </Avatar>
                    <Typography fontWeight="bold" sx={{ alignSelf: 'center' }}>
                        {user?.username}
                    </Typography>
                </Box>
                <TextField
                    fullWidth
                    placeholder="What's on your mind?"
                    multiline
                    rows={4}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {imagePreview && (
                    <Box sx={{ position: 'relative', mt: 2 }}>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <IconButton
                            onClick={handleRemoveImage}
                            sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{ textTransform: 'none' }}
                >
                    Add Photos
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || (!text && !image)}
                    sx={{ px: 4, borderRadius: 20 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Post'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreatePostModal;
