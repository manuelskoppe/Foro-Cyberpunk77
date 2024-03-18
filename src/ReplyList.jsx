import React, { useState, useEffect, useContext } from 'react';
import { getRepliesOfComment, deleteReplyFromComment, addLikeToReply } from './firestoreService';
import './ReplyList.css'; 
import { AuthContext } from './AuthContext'; // Asegúrate de que la ruta sea correcta

const ReplyList = ({ songId, commentId, onReplyAdded }) => {
  const [replies, setReplies] = useState([]);
  const { currentUser } = useContext(AuthContext); // Usando AuthContext para obtener el usuario actual

  useEffect(() => {
    fetchReplies();
  }, [songId, commentId, onReplyAdded]);

  const fetchReplies = async () => {
    const fetchedReplies = await getRepliesOfComment(songId, commentId);
    setReplies(fetchedReplies);
  };

  const handleDeleteReply = async (replyId) => {
    await deleteReplyFromComment(songId, commentId, replyId);
    fetchReplies();
  };

 const checkmylike= async (userId,reply) => { 

    const mylike= reply.likes.filter(like => like===userId  )

      return mylike.length>0 

 };

  const handleLikeReply = async (replyId, userId) => {
    try {
      await addLikeToReply(songId, commentId, replyId, userId);
      const reply= replies.find(reply => reply.id === replyId)
     const check= await checkmylike(userId,reply)
      if (!check) {

        setReplies(replies.map(reply => {
          if (reply.id === replyId) {
            const updatedLikes = reply.likes ? [...reply.likes, userId] : [userId];
            return { ...reply, likes: updatedLikes, likeCount: (reply.likeCount || 0) + 1 };
          }
          return reply;
        }));

      }

    
    } catch (error) {
      console.error("Error al añadir me gusta a la respuesta: ", error);
    }
  };

  return (
    <div className="ml-8 pl-4 cyberpunk-container">
      <ul className="comments-list">
        {replies.map((reply, index) => (
          <li key={reply.id} className={`mt-2 flex items-start ${index > 0 ? 'reply' : ''}`}>
            {index > 0 && <div className="line-connector"></div>}
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-start space-x-2 w-full">
                <p className="flex-1 text-sm cyberpunk-text">{reply.text} - <span className="text-gray-500">{reply.author}</span></p>
                {reply.imageUrl && (
                  <img src={reply.imageUrl} alt="Reply image" className="max-w-xs max-h-24 cyberpunk-image" />
                )}
                <div className="flex items-center">
                  <button
                    onClick={() => handleLikeReply(reply.id, "userIdPlaceholder")} // Asegúrate de reemplazar "userIdPlaceholder" con el ID real del usuario
                    className="like-button cyberpunk-button"
                  >
                    Me gusta
                  </button>
                  <span className="likes-count cyberpunk-likes">{reply.likeCount || 0}</span>
                </div>
                {currentUser && currentUser.uid === reply.uid && ( // Solo muestra el botón de borrar si el usuario actual es el autor
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="delete-button cyberpunk-button"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};  

export default ReplyList;
