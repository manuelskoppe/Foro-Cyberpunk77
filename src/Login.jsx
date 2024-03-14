import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { app } from "./firebase";
import './Register.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false); // Estado para manejar el mensaje de éxito
  const auth = getAuth(app);
  const navigate = useNavigate(); // Hook para la redirección

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginSuccess(false); // Reinicia el estado de éxito en cada intento de login
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      setLoginSuccess(true); // Establece el éxito del login
      // Redirige al usuario después de un breve retraso para permitir que se muestre el mensaje de éxito
      setTimeout(() => navigate('/'), 2000); // Asume que la ruta de tu página principal es '/'
    } catch (error) {
      setLoginSuccess(false); // Asegura que el estado de éxito sea falso si el login falla
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No se encontró cuenta con ese email. Por favor, regístrate.');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta. Por favor, intenta de nuevo.');
          break;
        default:
          setError('Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.');
          break;
      }
      console.error(error);
    }
  };

  // Estilos en línea para el fondo y contenedor
  const backgroundStyle = {
    backgroundImage: `url('https://wallpapercave.com/wp/wp4923981.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px',
    padding: '2rem',
    maxWidth: '400px',
    margin: '2rem auto',
    backdropFilter: 'blur(5px)',
  };

  return (
    <div className="register-background">
      <div className="register-form-container">
        <h1 className="register-title">Iniciar Sesión</h1>
        {error && <p className="error-text">{error}</p>}
        {loginSuccess && <p className="success-text">Inicio de sesión exitoso. Redirigiendo...</p>}
        <form onSubmit={handleLogin} className="form-space-y-6">
          <div>
            <label className="label-text">Email:</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="register-input"
            />
          </div>
          <div>
            <label className="label-text">Contraseña:</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="register-input"
            />
          </div>
          <button 
            type="submit"
            className="register-button"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;