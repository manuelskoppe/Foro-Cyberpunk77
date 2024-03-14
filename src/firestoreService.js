
// Importaciones necesarias de Firebase
import { db } from './firebase'; // Asegura la correcta exportación desde tu archivo de configuración de Firebase
import {
  collection,
  query,
  getDocs,
  getDoc, // Importa getDoc para obtener documentos individuales
  orderBy,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment, // Asegúrate de que increment está importado desde el lugar correcto
  arrayUnion, // Importa arrayUnion para manejar arrays en Firestore
  startAfter,
  limit,
} from 'firebase/firestore';

// Para el manejo de archivos, estas importaciones están correctas
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { runTransaction } from "firebase/firestore";


const storage = getStorage();

// Funciones existentes (ejemplos previos)...

// Nueva función para subir imágenes a Firebase Storage
export const uploadImage = async (file) => {
  const storageRef = ref(storage, 'images/' + file.name);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir la imagen: ", error);
    return null;
  }
};

// Función para añadir un nuevo post con imagen y contenido
export const addPostWithImageAndContent = async (postData, imageUrl, content, youtubeUrl) => {
  const postsRef = collection(db, 'posts');
  try {
    const docData = {
      ...postData,
      imageUrl,
      content,
      createdAt: serverTimestamp(),
      likeCount: 0,
      likes: [],
      ...(youtubeUrl && { youtubeUrl })
    };

    const docRef = await addDoc(postsRef, docData);
    console.log("Post creado con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear el post:", error);
    return null;
  }
};




// Función para actualizar un post existente con una nueva imagen y contenido
export const updatePostWithImageAndContent = async (postId, postData, imageUrl, content) => {
  const postRef = doc(db, 'posts', postId);
  try {
    await updateDoc(postRef, {
      ...postData,
      imageUrl,
      content,
    });
    console.log("Post actualizado con éxito");
  } catch (error) {
    console.error("Error al actualizar el post:", error);
  }
};


export const getSongs = async (lastVisible, pageSize, sortByLikes = false) => {
  const songsRef = collection(db, 'songs');
  let q;

  if (sortByLikes) {
    // Ordena por 'likeCount' si se pide un ordenamiento por likes
    q = query(songsRef, orderBy('likeCount', 'desc'), limit(pageSize));
  } else if (lastVisible) {
    // Paginación basada en el año si se provee un 'lastVisible'
    q = query(songsRef, orderBy('year'), startAfter(lastVisible), limit(pageSize));
  } else {
    // Orden por defecto por año si no se está paginando ni ordenando por likes
    q = query(songsRef, orderBy('year'), limit(pageSize));
  }

  try {
    const querySnapshot = await getDocs(q);
    const lastVisibleDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
    const songs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { songs, lastVisible: lastVisibleDocument };
  } catch (error) {
    console.error("Error al obtener documentos: ", error);
    return { songs: [], lastVisible: null };
  }
};



// Función para borrar una canción por id
export const deleteSong = async (songId) => {
  try {
    await deleteDoc(doc(db, 'songs', songId));
    console.log("Canción borrada con éxito");
  } catch (error) {
    console.error("Error al borrar la canción: ", error);
  }
};

// Añadir un comentario a un post específico
export const addCommentToSong = async (songId, commentData, user) => {
  if (!user) {
    console.error("No hay usuario autenticado.");
    return;
  }

  console.log(`Añadiendo comentario al songId: ${songId} por el usuario: ${user.uid}`);
  const commentsRef = collection(db, 'songs', songId, 'comments');

  try {
    await addDoc(commentsRef, {
      ...commentData,
      uid: user.uid, // Asegúrate de que este campo se incluye correctamente
      createdAt: serverTimestamp()
    });
    console.log("Comentario añadido exitosamente");
  } catch (error) {
    console.error("Error al añadir comentario:", error);
  }
};


// Obtener comentarios de un post específico
export const getCommentsOfSong = async (songId) => {
  const commentsRef = collection(db, 'songs', songId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener comentarios: ", error);
    return [];
  }
};


// Añadir una respuesta a un comentario específico
export const addReplyToComment = async (songId, commentId, replyData, user) => {
  if (!user) {
    console.error("No hay usuario autenticado.");
    return;
  }

  console.log(`Añadiendo respuesta para el comentarioId: ${commentId} en el songId: ${songId} por el usuario: ${user.uid}`);
  const repliesRef = collection(db, 'songs', songId, 'comments', commentId, 'replies');

  try {
    const newReply = {
      ...replyData,
      uid: user.uid, // Asegúrate de que user es un objeto y que user.uid existe
      createdAt: serverTimestamp(),
      likeCount: 0, // Inicializa el contador de 'me gusta' en 0
      likes: [] // Inicializa el arreglo de 'me gusta' vacío
    };

    await addDoc(repliesRef, newReply);
    console.log("Respuesta añadida exitosamente");
  } catch (error) {
    console.error("Error al añadir respuesta: ", error);
  }
};




// Borrar una respuesta específica de un comentario
export const deleteReplyFromComment = async (songId, commentId, replyId) => {
  console.log(`Intentando borrar la respuesta con ID: ${replyId} del comentario con ID: ${commentId} en la canción con ID: ${songId}`);
  try {
    const replyRef = doc(db, 'songs', songId, 'comments', commentId, 'replies', replyId);
    await deleteDoc(replyRef);
    console.log(`Respuesta con ID: ${replyId} borrada exitosamente.`);
  } catch (error) {
    console.error("Error al borrar respuesta: ", error);
    console.log(`Detalles del error - Código: ${error.code}, Mensaje: ${error.message}`);
  }
};


// Borrar un comentario específico de un post
export const deleteCommentFromSong = async (songId, commentId) => {
  console.log(`Intentando borrar el comentario con ID: ${commentId} de la canción con ID: ${songId}`);
  try {
    const commentRef = doc(db, 'songs', songId, 'comments', commentId);
    await deleteDoc(commentRef);
    console.log(`Comentario con ID: ${commentId} borrado exitosamente.`);
  } catch (error) {
    console.error("Error al borrar comentario: ", error);
    console.log(`Detalles del error - Código: ${error.code}, Mensaje: ${error.message}`);
  }
};





// Obtener las respuestas de un comentario específico de una canción
export const getRepliesOfComment = async (songId, commentId) => {
  const repliesRef = collection(db, 'songs', songId, 'comments', commentId, 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'asc')); // Cambio aquí para orden ascendente
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener respuestas: ", error);
    return []; // Return an empty array in case of error
  }
};


// Añadir un "me gusta" a un comentario específico de una canción
export const addLikeToComment = async (songId, commentId, userId) => {
  if (!userId) {
    console.error("No hay identificación de usuario proporcionada.");
    return;
  }
  
  const commentRef = doc(db, 'songs', songId, 'comments', commentId);

  try {
    await runTransaction(db, async (transaction) => {
      const commentDoc = await transaction.get(commentRef);

      if (!commentDoc.exists()) {
        throw new Error("El documento de comentario no existe.");
      }

      const commentData = commentDoc.data();
      const likesArray = commentData.likes || [];

      // Comprueba si el usuario ya ha dado "me gusta"
      if (likesArray.includes(userId)) {
        console.log("El usuario ya ha dado 'me gusta' a este comentario.");
        return;
      }

      // Si no, incrementa el contador de "me gusta" y añade el userID al array de "likes"
      transaction.update(commentRef, {
        likeCount: increment(1),
        likes: arrayUnion(userId)
      });
    });
    console.log("Me gusta añadido con éxito al comentario");
  } catch (error) {
    console.error("Error al añadir me gusta al comentario: ", error);
  }
};



// Función para añadir un "me gusta" a una respuesta específica
export const addLikeToReply = async (songId, commentId, replyId, userId) => {
  const replyRef = doc(db, 'songs', songId, 'comments', commentId, 'replies', replyId);

  try {
    // Comenzamos una transacción para asegurar la atomicidad de la operación
    await runTransaction(db, async (transaction) => {
      const replyDoc = await transaction.get(replyRef);

      if (!replyDoc.exists()) {
        throw "La respuesta no existe";
      }

      const replyData = replyDoc.data();
      const likesArray = replyData.likes || [];

      // Comprobamos si el usuario ya ha dado "me gusta" a la respuesta
      if (likesArray.includes(userId)) {
        console.log("El usuario ya ha dado 'me gusta' a esta respuesta.");
        return;
      }

      // Si el usuario no ha dado "me gusta", lo añadimos al array de "likes"
      transaction.update(replyRef, {
        likeCount: increment(1),
        likes: arrayUnion(userId)
      });
    });

    console.log("Me gusta añadido a la respuesta con éxito");
  } catch (error) {
    console.error("Error al añadir me gusta a la respuesta: ", error);
  }
};


// Función para añadir un "me gusta" a un post específico
export const addLikeToPost = async (postId, uid) => {
  const postRef = doc(db, 'songs', postId);
  try {
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      if (postData.likes && postData.likes.includes(uid)) {
        console.log("El usuario ya ha dado 'me gusta' a este post.");
      } else {
        await updateDoc(postRef, {
          likeCount: increment(1),
          likes: arrayUnion(uid)
        });
        console.log("Me gusta añadido al post con éxito");
      }
    } else {
      console.log("El post no existe");
    }
  } catch (error) {
    console.error("Error al añadir me gusta al post:", error);
  }
};