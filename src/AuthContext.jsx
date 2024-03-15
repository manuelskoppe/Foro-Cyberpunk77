import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(getFirestore(), 'users', user.uid);
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
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log('Sesión cerrada exitosamente');
      setCurrentUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser || !currentUser.uid) return;
  
    // Filtrado de propiedades no serializables
    const serializableUpdates = Object.keys(updates).reduce((acc, key) => {
      const value = updates[key];
      // Se incluyen solo valores serializables
      if (["string", "number", "boolean"].includes(typeof value) || value === null || Array.isArray(value)) {
        acc[key] = value;
      } else if (typeof value === "object" && value !== null && value.constructor === Object) {
        // Para objetos literales, se realiza un chequeo más profundo (opcional)
        acc[key] = JSON.parse(JSON.stringify(value));
      }
      // Excluir específicamente objetos no serializables por nombre de clase
      if (key === "auth" || key === "proactiveRefresh" || key === "stsTokenManager") {
        delete acc[key];
      }
      return acc;
    }, {});
  
    console.log("Actualizando perfil en Firestore con (filtrado):", serializableUpdates);
  
    const userRef = doc(getFirestore(), 'users', currentUser.uid);
    try {
      await setDoc(userRef, serializableUpdates, { merge: true });
      console.log("Perfil actualizado en Firestore.");
      setCurrentUser(current => ({ ...current, ...serializableUpdates }));
    } catch (error) {
      console.error("Error al actualizar el perfil del usuario en Firestore:", error);
    }
  };
  

  const value = {
    currentUser,
    updateUserProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

