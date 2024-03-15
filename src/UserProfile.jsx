import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import './UserProfile.css';

function UserProfile() {
  const { currentUser, updateUserProfile, logout } = useContext(AuthContext);
  const [name, setName] = useState(currentUser?.displayName || '');
  const [nationality, setNationality] = useState(currentUser?.nationality || '');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      console.log('Usuario actual cargado:', currentUser);
      setName(currentUser.displayName);
      setNationality(currentUser.nationality);
    }
  }, [currentUser]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleNationalityChange = (e) => setNationality(e.target.value);
  const handleImageChange = (e) => e.target.files[0] && setImage(e.target.files[0]);

  const uploadImage = async () => {
    if (!image) return null;
    const storage = getStorage();
    const imageRef = storageRef(storage, `profileImages/${currentUser?.uid}`);
    try {
      const snapshot = await uploadBytes(imageRef, image);
      const photoURL = await getDownloadURL(snapshot.ref);
      console.log('Imagen subida y URL obtenida:', photoURL);
      return photoURL;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      return null;
    }
  };

  const saveProfile = async () => {
    try {
      let photoURL = currentUser?.photoURL;
      if (image) {
        photoURL = await uploadImage();
      }
      const newUserProfile = { displayName: name, nationality: nationality, ...(photoURL && { photoURL }) };

      console.log('Actualizando perfil en Firestore con:', newUserProfile);
      await setDoc(doc(getFirestore(), 'users', currentUser?.uid), newUserProfile, { merge: true });
      console.log('Perfil actualizado con éxito');
      updateUserProfile({ ...currentUser, ...newUserProfile });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    }
  };

  if (!currentUser) {
    return <div>Cargando...</div>;
  }
  return (
    <div className="userProfile-background">
      <div className="userProfile-container">
        <h1 className="userProfile-title">Perfil de Usuario</h1>
        <div className="userProfile-info">
          <p className="userProfile-detail">Nombre: {currentUser.displayName}</p>
          <p className="userProfile-detail">Nickname: {currentUser.nationality}</p>
          <img src={currentUser.photoURL || 'default_profile_image_url'} alt="Foto de perfil" className="userProfile-image" />
        </div>
        <div className="userProfile-fields">
          <label className="userProfile-label">Nombre:</label>
          <input type="text" value={name} onChange={handleNameChange} className="userProfile-input" />
          <label className="userProfile-label">Nickname:</label>
          <input type="text" value={nationality} onChange={handleNationalityChange} className="userProfile-input" />
          <label className="userProfile-label">Foto de perfil:</label>
          <input type="file" onChange={handleImageChange} className="userProfile-input-file" />
        </div>
        <div className="userProfile-actions">
          <button onClick={saveProfile} className="userProfile-button userProfile-save">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

