import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/register" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
