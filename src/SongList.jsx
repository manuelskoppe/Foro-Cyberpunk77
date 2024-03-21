import React, { useState, useEffect } from 'react';
import { getSongs, deleteSong, addLikeToPost } from './firestoreService';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './SongList.css'; // Asegúrate de que la ruta es correcta




const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastVisible, setLastVisible] = useState(null); // For pagination
  const [isLoading, setIsLoading] = useState(true); // To show loading status
  const { currentUser } = useAuth();
  const pageSize = songs.length || 20 ; // Set the number of posts per page
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async (newPage = false) => {
    setIsLoading(!isLoading);
    try {
      const { songs: newSongs, lastVisible: newLastVisible } = await getSongs(lastVisible, pageSize, newPage);
      console.log(newSongs); // Check if the songs are fetched correctly
      setSongs(newPage ? [...songs, ...newSongs] : newSongs);
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error("Error fetching songs: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (songId) => {
    await deleteSong(songId);
    fetchSongs(); // Reload the songs after deleting
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleNext = () => {
    if (!isLoading) {
      fetchSongs(true);
    }
  };

  const hasUserLikedPost = (userId, post) => {
    return post.likes && post.likes.includes(userId);
  };
  

  const handleLike = async (postId) => {
    if (!currentUser) {
      console.error("Debe estar autenticado para dar 'me gusta'");
      return;
    }
    try {
      const post = songs.find(song => song.id === postId); // Encuentra el post por ID
      if (!post) {
        console.error("Post no encontrado");
        return;
      }
      const hasLiked = hasUserLikedPost(currentUser.uid, post);
      if (hasLiked) {
        console.log("Usuario ya ha dado 'me gusta' a este post.");
        return; // El usuario ya ha dado "me gusta", así que no hacemos nada más
      }
  
      // Si el usuario no ha dado "me gusta", procedemos
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === postId ? { ...song, likeCount: (song.likeCount || 0) + 1, likes: [...(song.likes || []), currentUser.uid] } : song
        )
      );
      await addLikeToPost(postId, currentUser.uid);
      console.log(`Like added to post ${postId}`);
    } catch (error) {
      console.error("Error adding like to post: ", error);
    }
  };
  
  
  // Filter songs based on search term
  const filteredSongs = songs.filter(song =>
    song.genre.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="songlist-container">
      <h2 className="songlist-header">Lista de Post</h2>
      <div className="actions-container">
        <Link to="/nuevo-post" className="songlist-button action-button">Crear Nuevo Post</Link>
        <input type="text" placeholder="Buscar por género" className="search-input" onChange={handleSearchChange} />
        <Link to="/" className="songlist-button action-button">Ir a la Página Principal</Link>
      </div>
      {isLoading && <div className="text-center"><div className="spinner" /></div>}
      <div className="table-container">
        <table className="songlist-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Año</th>
              <th>Género</th>
              <th>Likes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSongs.map((song) => (
              <tr key={song.id}>
                <td><Link to={`/songs/${song.id}`} className="table-link">{song.title}</Link></td>
                <td>{song.artist}</td>
                <td>{song.year}</td>
                <td>{song.genre}</td>
                <td>{song.likeCount || 0}</td>
                <td className="actions-cell">
                  {currentUser && song.uid === currentUser.uid && <button onClick={() => handleDelete(song.id)} className="songlist-button delete-button">Borrar</button>}
                  <button onClick={() => handleLike(song.id)} className="songlist-button like-button">Me gusta</button>
                </td>
              </tr>
            ))}
            </tbody>
        </table>
        {/* Sentinel element for infinite scrolling
        <div ref={sentinelRef} style={{ height: "20px" }}></div>
      </div>
      {/* Loading spinner for when new songs are being fetched */}
      {isLoading && <div className="loading-more-songs">Cargando más canciones...</div>}
    </div> */</div>
  );
};



export default SongList;

