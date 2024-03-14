import React, { useState, useEffect } from 'react';
import { getSongs, deleteSong, addLikeToPost } from './firestoreService';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './SongList.css'; // Asegúrate de que la ruta es correcta


const pageSize = 10; // Set the number of posts per page

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastVisible, setLastVisible] = useState(null); // For pagination
  const [isLoading, setIsLoading] = useState(false); // To show loading status
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async (newPage = false) => {
    setIsLoading(true);
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


// Estilo para el contenedor principal con la imagen de fondo
/*const containerStyle = {
  backgroundImage: `url('https://wallpapercave.com/wp/wp4923981.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed', // Asegurarse de que la imagen de fondo sea fija
  width: '100vw',
  minHeight: '100vh',
  paddingTop: '4rem', // Añadido para evitar que el contenido se solape con el navbar
};;*/






return (
  <div className="songlist-container">
  <h2 className="songlist-header">Lista de Post</h2>

  <div className="actions-container">
    <Link to="/nuevo-post" className="songlist-button action-button">
      Crear Nuevo Post
    </Link>
    <input
      type="text"
      placeholder="Buscar por género"
      className="search-input"
      onChange={handleSearchChange}
    />
    <Link to="/" className="songlist-button action-button">
      Ir a la Página Principal
    </Link>
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
            <td>
              <Link to={`/songs/${song.id}`} className="table-link">{song.title}</Link>
            </td>
            <td>{song.artist}</td>
            <td>{song.year}</td>
            <td>{song.genre}</td>
            <td>{song.likeCount || 0}</td>
            <td className="actions-cell">
              <button onClick={() => handleDelete(song.id)} className="songlist-button delete-button">
                Borrar
              </button>
              <button onClick={() => handleLike(song.id)} className="songlist-button like-button">
                Me gusta
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="pagination-container">
    <button
      onClick={handleNext}
      disabled={isLoading || filteredSongs.length < pageSize}
      className="songlist-button"
    >
      Cargar más
    </button>
  </div>
</div>

);
};

export default SongList;