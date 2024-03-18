import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx'; // Asegúrate de que la ruta sea correcta
import ProtectedRoute from './ProtectedRoute';
import SongForm from './SongForm';
import SongList from './SongList';
import SongDetail from './SongDetail';
import Register from './Register';
import Login from './Login';
import UserProfile from './UserProfile';
import TopLikedSongs from './TopLikedSongs';
import UserList from './UserList'; // Asegúrate de que el componente UserList esté correctamente importado
import './App.css';

function AuthLinks() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  if (currentUser) {
    return (
      <>
        <Link to="/perfil" className="navbar-link">Perfil</Link>
        {/* Agregamos el enlace a la lista de usuarios */}
        <Link to="/usuarios" className="navbar-link">Usuarios</Link>
        <button onClick={handleLogout} className="navbar-link">Cerrar Sesión</button>
      </>
    );
  } else {
    return (
      <>
        <Link to="/registro" className="navbar-link">Registrarse</Link>
        <Link to="/login" className="navbar-link">Iniciar Sesión</Link>
      </>
    );
  }
}

function HomePage() {
  const { currentUser } = useAuth();
  
  return (
    <div className="homepage-background">
      <h1 className="welcome-message neon-text">
        Bienvenido al Foro {currentUser ? `: ${currentUser.email}` : ''}
      </h1>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <nav className="app-navbar">
            <div className="navbar-links-container">
              <Link to="/" className="navbar-link">Inicio</Link>
              <Link to="/songs" className="navbar-link">Ver Posts</Link>
              {/* Otros enlaces no dependientes de la autenticación */}
              <Link to="/top-liked" className="navbar-link">Top Likes</Link>
            </div>
            <div className="auth-links-container">
              <AuthLinks />
            </div>
          </nav>
          <div className="content-container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/songs" element={<ProtectedRoute><SongList /></ProtectedRoute>} />
              <Route path="/songs/:songId" element={<ProtectedRoute><SongDetail /></ProtectedRoute>} />
              <Route path="/nuevo-post" element={<ProtectedRoute><SongForm /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/top-liked" element={<ProtectedRoute><TopLikedSongs /></ProtectedRoute>} />
              {/* Ruta protegida para el componente de la lista de usuarios */}
              <Route path="/usuarios" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
