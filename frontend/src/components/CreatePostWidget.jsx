import React, { useState, useContext } from 'react';
import {
    Box, Paper, Typography, InputBase, Button,
    Stack, IconButton, Avatar, Divider, useTheme
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreatePostWidget = ({ onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

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
        if (!text && !image) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('text', text);
            if (image) {
                formData.append('image', image);
            }

            const res = await axios.post('https://socialsplanet.onrender.com/api/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onPostCreated(res.data);
            setText('');
            handleRemoveImage();
            toast.success('Posted!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="700">Create Post</Typography>
                {/* Promotions toggle removed as requested */}
            </Box>

            <Box sx={{ mb: 2 }}>
                <InputBase
                    fullWidth
                    multiline
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    sx={{
                        fontSize: '1rem',
                        minHeight: '60px',
                        color: 'text.primary'
                    }}
                />
            </Box>

            {imagePreview && (
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <IconButton
                        size="small"
                        onClick={handleRemoveImage}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton color="primary" component="label" size="small">
                        <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                        <ImageIcon />
                    </IconButton>
                </Stack>

                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSubmit}
                    disabled={(!text && !image) || loading}
                    startIcon={!loading && <SendIcon />}
                    sx={{
                        borderRadius: 20,
                        textTransform: 'none',
                        px: 3,
                        bgcolor: '#C4C4C4', // Default grey like visual
                        '&:hover': { bgcolor: '#A0A0A0' },
                        ...(text || image ? { bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } } : {})
                    }}
                >
                    {loading ? 'Posting...' : 'Post'}
                </Button>
            </Box>
        </Paper>
    );
};

export default CreatePostWidget;
