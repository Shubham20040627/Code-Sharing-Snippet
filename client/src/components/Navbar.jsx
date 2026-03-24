import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Extract ID if it's a URL
    let snippetId = searchQuery.trim();
    try {
      if (snippetId.includes('http')) {
        const url = new URL(snippetId);
        const pathParts = url.pathname.split('/');
        // URL format is likely /snippet/ID
        const snippetIdx = pathParts.indexOf('snippet');
        if (snippetIdx !== -1 && pathParts[snippetIdx + 1]) {
          snippetId = pathParts[snippetIdx + 1];
        }
      }
    } catch (e) {
      // Not a valid URL, treat as direct ID
    }
    
    if (snippetId) {
      navigate(`/snippet/${snippetId}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <Code2 size={28} />
          <span>SnippetShare</span>
        </Link>

        {user && (
          <form onSubmit={handleSearch} className="nav-search" id="navbar-search-form">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Find a snippet (ID or link)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}

        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-text">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-text text-danger">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-text">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
