import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import PhotoUpload from './pages/PhotoUpload';
import Settings from './pages/Settings';
import './App.css';

function Homie() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to OniGata</h1>

      <div>
        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Homie />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/photo-upload" element={<PhotoUpload />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
