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
    <div className="cyberpunk-container">
      <h3 className="comment-list-title">Comentarios</h3>
      <ul className="comments-list">
        {comments.map((comment, index) => (
          <li key={comment.id} className={`mt-2 flex items-start ${index > 0 ? 'comment' : ''}`}>
            {/* Optionally add line-connector if you want to visually connect comments */}
            {index > 0 && <div className="line-connector"></div>}
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-center space-x-2 w-full">
                <p className="flex-1 text-sm cyberpunk-text">
                  {comment.author}: {comment.text}
                  {comment.imageUrl && (
                    <img src={comment.imageUrl} alt="Comment image" className="comment-image" />
                  )}
                </p>
                <div className="flex items-center">
                  <button onClick={() => handleLike(comment.id)} className="like-button">
                    Me gusta
                  </button>
                  <span className="likes-count">{comment.likeCount || 0}</span>
                </div>
                {currentUser && currentUser.uid === comment.uid && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="delete-button">
                    Borrar
                  </button>
                )}
              </div>
              {/* Replies go here */}
              <div className="replies-container">
                <ReplyList commentId={comment.id} songId={songId} onReplyAdded={fetchComments} />
                <ReplyForm commentId={comment.id} songId={songId} onReplyAdded={fetchComments} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 
export default CommentList;
