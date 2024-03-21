import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import AddCommentForm from './AddCommentForm';
import CommentList from './CommentList';
import './SongDetail.css';

const SongDetail = () => {
  let { songId } = useParams();
  const { currentUser } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
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
  }, [songId, commentsUpdateCounter]);

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
          content={<img src={song.imageUrl} alt="Post" className="song-detail-image" style={{maxWidth: '500px'}} />}
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
            <div className="youtube-wrapper">
              <iframe
                src={embedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video"
              ></iframe>
            </div>
          }
          isContent={true}
        />
      );
    }
    return null;
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
        <div className="song-detail-comments-section">
          <AddCommentForm songId={songId} onCommentAdded={handleCommentAdded} />
          <h3 className="song-detail-comments-title">Comentarios</h3>
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

export default SongDetail
