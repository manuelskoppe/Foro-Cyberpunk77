import React, { useState, useEffect, useContext } from 'react';
import { getCommentsOfSong, deleteCommentFromSong, addLikeToComment } from './firestoreService';
import ReplyForm from './ReplyForm';
import ReplyList from './ReplyList';
import { AuthContext } from './AuthContext';

const CommentList = ({ songId }) => {
  const [comments, setComments] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const fetchComments = async () => {
    const fetchedComments = await getCommentsOfSong(songId);
    setComments(fetchedComments);
  };

  useEffect(() => {
    fetchComments();
  }, [songId]);

  const handleDeleteComment = async (commentId) => {
    await deleteCommentFromSong(songId, commentId);
    fetchComments();
  };

  const handleLike = async (commentId) => {
    if (currentUser && currentUser.uid) {
      try {
        await addLikeToComment(songId, commentId, currentUser.uid);
        fetchComments();
      } catch (error) {
        console.error("Error al añadir me gusta: ", error);
      }
    } else {
      console.log("Usuario no identificado o no autenticado.");
    }
  };

  const handleReplyAdded = () => {
    fetchComments();
  };
  return (
    <div className="cyberpunk-container cyberpunk-theme">
      {comments.map((comment, index) => (
        <div key={comment.id} className={`comment-block ${index > 0 ? 'mt-2' : ''}`}>
          <div className="comment-title-wrapper">
            <h3 className="comment-title">Comentario:</h3>
            {/* Unicode character for the down arrow */}
            <div className="comment-arrow-down">▼</div>
          </div>
          <div className="comment-content-wrapper">
            <div className="comment-content">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-text">{comment.text}</span>
              {comment.imageUrl && (
                <img src={comment.imageUrl} alt="Comment" className="comment-image" />
              )}
            </div>
            <div className="comment-actions">
              <button onClick={() => handleLike(comment.id)} className="like-button">
                Me gusta
              </button>
              <span className="likes-count">{comment.likeCount || 0}</span>
              {currentUser && currentUser.uid === comment.uid && (
                <button onClick={() => handleDeleteComment(comment.id)} className="delete-button">
                  Borrar
                </button>
              )}
            </div>
          </div>
          <div className="replies-container">
            <ReplyList commentId={comment.id} songId={songId} onReplyAdded={fetchComments} />
            <ReplyForm commentId={comment.id} songId={songId} onReplyAdded={fetchComments} />
          </div>
        </div>
      ))}
    </div>
  );
              }  
export default CommentList;
