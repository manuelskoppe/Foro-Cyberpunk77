import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Verifica la ruta de importación
import { addCommentToSong, uploadImage } from './firestoreService';
import './AddCommentForm.css';


const AddCommentForm = ({ songId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [file, setFile] = useState(null);
  const { currentUser } = useAuth(); // Obtiene el usuario actual desde el contexto de autenticación

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return; // Evita enviar comentarios vacíos o solo con espacios

    if (!currentUser) {
      console.error("No hay usuario autenticado.");
      return;
    }

    let imageUrl = null;
    if (file) {
      imageUrl = await uploadImage(file);
    }

    try {
      await addCommentToSong(songId, { text: commentText, imageUrl: imageUrl }, currentUser); // Asegúrate de pasar la URL de la imagen si está presente
      setCommentText(''); // Limpia el campo de texto después de enviar
      setFile(null); // Limpia el archivo seleccionado
      onCommentAdded && onCommentAdded(); // Si se proporciona la función onCommentAdded, la llama
    } catch (error) {
      console.error("Error al añadir comentario:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-comment-form">
      <input
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Escribe un comentario..."
        className="comment-input"
        aria-label="Escribe un comentario"
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="file-input"
      />
      <button
        type="submit"
        disabled={!currentUser || !commentText.trim()}
        className="submit-button"
      >
        Comentar
      </button>
    </form>
  );
};

export default AddCommentForm;
