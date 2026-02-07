import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Container, Typography, Avatar, List, ListItem,
    ListItemAvatar, ListItemText, Divider, IconButton, CircularProgress
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import axios from 'axios';

const FollowList = () => {
    const { id } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const type = pathname.includes('followers') ? 'followers' : 'following';

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${id}/${type}`);
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [id, type]);

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Typography variant="h5" fontWeight="800" sx={{ textTransform: 'capitalize' }}>
                    {type}
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                    {users.map((user, index) => (
                        <React.Fragment key={user._id}>
                            <ListItem
                                button
                                onClick={() => navigate(`/user/${user._id}`)}
                                sx={{ py: 1.5 }}
                            >
                                <ListItemAvatar>
                                    <Avatar src={user.avatar?.startsWith('http') ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar || user.username}`} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography fontWeight="700">{user.username}</Typography>}
                                    secondary={user.bio}
                                    secondaryTypographyProps={{ noWrap: true }}
                                />
                            </ListItem>
                            {index < users.length - 1 && <Divider component="li" sx={{ opacity: 0.1 }} />}
                        </React.Fragment>
                    ))}
                    {users.length === 0 && (
                        <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            No users found
                        </Typography>
                    )}
                </List>
            )}
        </Container>
    );
};

export default FollowList;
