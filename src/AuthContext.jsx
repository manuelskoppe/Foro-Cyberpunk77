import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Importa signOut
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore(); // Inicializa Firestore

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si hay un usuario, intenta obtener su perfil de Firestore
        const userRef = doc(db, 'users', user.uid);
        try {
          const userProfileSnapshot = await getDoc(userRef);
          if (userProfileSnapshot.exists()) {
            console.log("Datos del perfil recuperados de Firestore:", userProfileSnapshot.data());
            setCurrentUser({ ...user, ...userProfileSnapshot.data() });
          } else {
            console.log("No se encontró perfil en Firestore para el usuario:", user.uid);
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error al obtener el documento del usuario:", error);
        }
      } else {
        // No hay usuario logueado
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Utiliza signOut para cerrar sesión
      console.log('Sesión cerrada exitosamente');
      setCurrentUser(null); // Opcionalmente, actualiza el estado del usuario actual a null
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser || !currentUser.uid) return;
  
    const db = getFirestore();
    const userRef = doc(db, 'users', currentUser.uid);
    console.log("Actualizando perfil en Firestore con:", updates);
    try {
      await setDoc(userRef, updates, { merge: true });
      console.log("Perfil actualizado en Firestore.");
      setCurrentUser(current => ({ ...current, ...updates }));
    } catch (error) {
      console.error("Error al actualizar el perfil del usuario en Firestore:", error);
    }
  };

  const value = {
    currentUser,
    updateUserProfile,
    logout, // Incluye logout aquí para hacerlo accesible en el contexto
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
