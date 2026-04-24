import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import SnippetEditor from './components/SnippetEditor';
import SnippetViewer from './components/SnippetViewer';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProjectViewer from './components/ProjectViewer';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Signup />} />
              <Route path="/create" element={<SnippetEditor />} />
              <Route path="/snippet/:id" element={<SnippetViewer />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/project/shared/:shortId" element={<ProjectViewer />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container">
              <p>&copy; {new Date().getFullYear()} SnippetShare. Premium Code Sharing.</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
