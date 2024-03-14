import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import AddCommentForm from './AddCommentForm';
import CommentList from './CommentList';
import './SongDetail.css';
// Firestore function to add a new post
export const addPostWithImageAndContent = async (postData, imageUrl, content, youtubeUrl) => {
  const postsRef = collection(db, 'posts');
  try {
    const docData = {
      ...postData,
      imageUrl: imageUrl,
      content: content,
      youtubeUrl: youtubeUrl, // Add 'youtubeUrl' to the document
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(postsRef, docData);
    console.log("Post created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
};

const SongDetail = () => {
  let { songId } = useParams();
  const { currentUser } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  // Actualizado para utilizar un contador para la actualización de comentarios
  const [commentsUpdateCounter, setCommentsUpdateCounter] = useState(0);

  useEffect(() => {
    const fetchSong = async () => {
      setLoading(true);
      try {
        const songRef = doc(db, 'songs', songId);
        const songSnap = await getDoc(songRef);

        if (songSnap.exists()) {
          setSong({ id: songSnap.id, ...songSnap.data() });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
      setLoading(false);
    };

    fetchSong();
  // Aquí se cambia a commentsUpdateCounter para que cada vez que cambie, se vuelva a ejecutar este efecto
  }, [songId, commentsUpdateCounter]);

  // Actualizado para cambiar el contador en lugar de un booleano
  const handleCommentAdded = () => {
    setCommentsUpdateCounter(curr => curr + 1);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!song) {
    return <div className="flex justify-center items-center h-screen">Post not found.</div>;
  }

  const authorName = currentUser?.displayName || currentUser?.email || 'Author not available';

  const renderMedia = () => {
    if (song.imageUrl) {
      return (
        <DetailBox
          label="Imagen del Post"
          content={<img src={song.imageUrl} alt="Post" className="song-detail-image" />}
          isContent={true}
        />
      );
    }
    return null;
  };
  const renderYoutubeEmbed = () => {
    if (song.youtubeUrl) {
      const videoId = new URL(song.youtubeUrl).searchParams.get('v');
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return (
        <DetailBox
          label="Video de YouTube"
          content={
            <iframe
              width="560"
              height="315"
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Video"
              className="my-4"
            ></iframe>
          }
          isContent={true}
          blueBackground={false}
        />
      );
    }
    return null; // No YouTube video to show
  };

  return (
    <div className="song-detail-container">
      <Link to="/" className="song-detail-back-link">Volver a la página principal</Link>
      <div className="song-detail-header">
        
        <h2 className="song-detail-title">Detalles del Post</h2>
      </div>
      <div className="song-detail-content">
        <DetailBox label="Título" content={song?.title} />
        <DetailBox label="Autor" content={authorName} />
        <DetailBox label="Año" content={song?.year} />
        <DetailBox label="Género" content={song?.genre} />
        <DetailBox label="Contenido del Post" content={song?.content} isContent={true} />
        {renderMedia()}
        {renderYoutubeEmbed()}
        <div className="song-detail-comments">
          <AddCommentForm songId={songId} onCommentAdded={handleCommentAdded} />
          <CommentList songId={songId} commentUpdateTrigger={commentsUpdateCounter} />
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ label, content, isContent }) => {
  const contentClass = isContent ? "detail-box-content" : "detail-box-content";
  return (
    <div className="detail-box">
      <p className="detail-box-label">{label}:</p>
      <div className={contentClass}>{content}</div>
    </div>
  );
};

export default SongDetail;
