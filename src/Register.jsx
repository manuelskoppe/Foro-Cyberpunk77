import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from "./firebase";
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth(app);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      // Aquí puedes redirigir al usuario
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Este correo electrónico ya está en uso. Por favor, intenta con otro.');
          break;
        case 'auth/weak-password':
          setError('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
          break;
        default:
          setError('Ocurrió un error al registrar la cuenta. Por favor, intenta de nuevo.');
          break;
      }
      console.error(error);
    }
  };
 // Estilos en línea para el contenedor del formulario
 const containerStyle = {
  background: 'rgba(255, 255, 255, 0.85)', // Fondo ligeramente transparente
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)', // Sombra más destacada
  borderRadius: '12px', // Bordes más redondeados
  padding: '2.5rem', // Más espacio interno
  maxWidth: '450px', // Contenedor un poco más grande
  margin: '4rem auto', // Aumenta el margen superior para centrar en la vista
  backdropFilter: 'blur(10px)', // Aumenta el efecto de desenfoque del fondo
};

return (
  <div className="register-background">
    <div className="register-form-container">
      <h1 className="register-title">Registro</h1>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleRegister} className="form-space-y-6">
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
          Registrar
        </button>
      </form>
    </div>
  </div>
);
};

export default Register;
