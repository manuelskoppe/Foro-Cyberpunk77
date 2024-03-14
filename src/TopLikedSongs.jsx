import React, { useEffect, useState } from 'react';
import { getSongs } from './firestoreService';
import './TopLikedSongs.css';

const medals = ["🥇", "🥈", "🥉"];

const TopLikedSongs = () => {
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    fetchTopLikedSongs();
  }, []);
  const fetchTopLikedSongs = async () => {
    const { songs: fetchedSongs } = await getSongs(null, 3, true);
    setTopSongs(fetchedSongs);
  };
  

  // Estilos en línea para el contenedor principal
  const containerStyle = {
    backgroundImage: `url('https://wallpapercave.com/wp/wp4923981.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    width: '100vw',
    minHeight: '100vh',
    paddingTop: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className="top-songs-container">
      <h2 className="top-songs-title">Top Posts con Más Likes</h2>
      <div className="top-songs-list">
        {topSongs.map((song, index) => (
          <div key={song.id} className="top-song-card">
            <div className="medal">{index < 3 ? medals[index] : null}</div>
            <div className="song-details">
              <div className="song-title">{song.title}</div>
              <div className="song-info">Por {song.artist}, {song.year}</div>
              <div className="song-likes">Likes: {song.likeCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
        }  

export default TopLikedSongs;
