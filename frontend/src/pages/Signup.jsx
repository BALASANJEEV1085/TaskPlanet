import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, Card, CardContent, Container, Link, IconButton, InputAdornment, Fade, Stack, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('https://socialsplanet.onrender.com/api/auth/signup', formData);
            login(res.data.user, res.data.token);
            toast.success('Welcome to the SocialPlanet universe!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (theme) => theme.palette.background.default,
            py: 4
        }}>
            <Fade in={true} timeout={1000}>
                <Container maxWidth="xs">
                    <Card sx={{
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        background: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(18, 18, 18, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 4
                    }}>
                        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>

                                <Typography variant="h4" fontWeight="800" sx={{
                                    color: (theme) => theme.palette.text.primary,
                                    letterSpacing: '-0.02em',
                                    mb: 1
                                }}>
                                    Join SocialPlanet
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Connect with thinkers across the cosmos
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        placeholder="stargazer_42"
                                        variant="outlined"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiInputLabel-root': { color: 'text.secondary' },
                                            '& input:-webkit-autofill': {
                                                transition: 'background-color 5000s ease-in-out 0s'
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        placeholder="explorer@socialplanet.com"
                                        variant="outlined"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiInputLabel-root': { color: 'text.secondary' },
                                            '& input:-webkit-autofill': {
                                                transition: 'background-color 5000s ease-in-out 0s'
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiInputLabel-root': { color: 'text.secondary' },
                                            '& input:-webkit-autofill': {
                                                transition: 'background-color 5000s ease-in-out 0s'
                                            }
                                        }}
                                    />

                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        sx={{
                                            py: 1.5,
                                            mt: 1,
                                            fontSize: '1rem',
                                            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                                            boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
                                            '&:hover': { boxShadow: '0 12px 20px rgba(168, 85, 247, 0.4)' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                                    </Button>

                                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Already a member?{' '}
                                            <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>
                                                Sign In
                                            </Link>
                                        </Typography>
                                    </Box>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Container>
            </Fade>
        </Box>
    );
};

export default Signup;
