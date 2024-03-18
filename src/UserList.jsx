import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="loading-users">Cargando usuarios...</div>;
  }

  return (
    <div className="user-list-container">
      <h1 className="user-list-title">Lista de Usuarios Registrados</h1>
      <div className="user-list-header">
        <span>Nombre</span> <span>Nickname</span> {/* Encabezados actualizados */}
      </div>
      <ul className="user-list-ul">
        {users.map(user => (
          <li key={user.id} className="user-list-item">
            {/* Campos actualizados para coincidir con los de la base de datos */}
            <span>{user.displayName}</span> <span>{user.nationality}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;

