import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import SearchResults from './pages/SearchResults';
import PostDetail from './pages/PostDetail';
import UserProfile from './pages/UserProfile';
import FollowList from './pages/FollowList';
import SharedContent from './pages/SharedContent';
import SecureSharedContent from './pages/SecureSharedContent';
import AppLayout from './components/AppLayout';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

        {/* Public share route - no auth required */}
        <Route path="/share/:token" element={<SharedContent />} />

        {/* Encrypted secure share route - no auth required */}
        <Route path="/s/:hash" element={<SecureSharedContent />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={user ? <Feed /> : <Navigate to="/login" />} />
          <Route path="/search" element={user ? <SearchResults /> : <Navigate to="/login" />} />
          <Route path="/post/:id" element={user ? <PostDetail /> : <Navigate to="/login" />} />
          <Route path="/user/:id" element={user ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="/user/:id/followers" element={user ? <FollowList /> : <Navigate to="/login" />} />
          <Route path="/user/:id/following" element={user ? <FollowList /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <Box sx={{ p: 3 }}>Notifications Page (Coming Soon)</Box> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Navigate to={`/user/${user.id}`} /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
