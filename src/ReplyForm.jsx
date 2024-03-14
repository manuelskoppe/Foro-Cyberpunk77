import React, { useState, useContext } from 'react';
import { addReplyToComment } from './firestoreService';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from './AuthContext';
import './Reply.css';


const ReplyForm = ({ songId, commentId, onReplyAdded }) => {
  const [replyText, setReplyText] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para manejar el estado de envío
  const [previewImage, setPreviewImage] = useState(''); // Para previsualizar la imagen cargada
  const { currentUser } = useContext(AuthContext);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!replyText.trim() && !image) return;
    setIsSubmitting(true); // Inicia el estado de envío

    let imageUrl = '';
    if (image) {
      const imageRef = ref(storage, `replies/${image.name}-${Date.now()}`);
      try {
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (uploadError) {
        console.error("Error al subir la imagen: ", uploadError);
        setIsSubmitting(false); // Restablece el estado de envío en caso de error
        return;
      }
    }

    try {
      await addReplyToComment(songId, commentId, { text: replyText, imageUrl }, currentUser);
      setReplyText('');
      setImage(null);
      setPreviewImage(''); // Limpia la previsualización de la imagen
      if (onReplyAdded) onReplyAdded(); // Llamada al callback para actualizar la lista, coger las respuestas y pushearlo 
    } catch (error) {
      console.error("Error al añadir respuesta: ", error);
    }
    setIsSubmitting(false); // Restablece el estado de envío tras completar el proceso
  };

  return (
    <form onSubmit={handleReplySubmit} className="reply-form">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Escribe una respuesta..."
        className="reply-input"
        disabled={isSubmitting}
      ></textarea>
      {previewImage && (
        <img src={previewImage} alt="Preview" className="reply-image-preview" />
      )}
      <label className="reply-file-label">
        <input
          type="file"
          onChange={handleImageChange}
          className="reply-file-input"
          disabled={isSubmitting}
        />
        Seleccionar archivo
      </label>
      <button
        type="submit"
        className="cyberpunk-btn reply-submit-btn" // Cambié aquí para agregar el estilo cyberpunk
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Responder'}
      </button>
    </form>
  );
      }  

export default ReplyForm;

