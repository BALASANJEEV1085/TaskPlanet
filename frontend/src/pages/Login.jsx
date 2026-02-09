import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, Card, CardContent, Container, Link, IconButton, InputAdornment, Fade, Stack, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';


const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
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
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            login(res.data.user, res.data.token);
            toast.success('Welcome back to SocialPlanet!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login failed');
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
            background: (theme) => theme.palette.background.default
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
                            <Box sx={{ mb: 5, textAlign: 'center' }}>

                                <Typography variant="h4" fontWeight="800" sx={{
                                    color: (theme) => theme.palette.text.primary,
                                    letterSpacing: '-0.02em',
                                    mb: 1
                                }}>
                                    SocialPlanet
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    The ultimate space for your thoughts
                                </Typography>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        placeholder="you@example.com"
                                        variant="outlined"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
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
                                            fontSize: '1rem',
                                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                                            '&:hover': { boxShadow: '0 12px 20px rgba(99, 102, 241, 0.4)' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                    </Button>

                                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            New to SocialPlanet?{' '}
                                            <Link component={RouterLink} to="/signup" sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}>
                                                Create Account
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

export default Login;
