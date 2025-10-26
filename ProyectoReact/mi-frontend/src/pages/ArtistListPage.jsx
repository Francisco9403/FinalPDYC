import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

function ArtistListPage({ onNavigate, onRequireLogin }) {
  const [artistas, setArtistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth(); // Usamos token y logout

  useEffect(() => {
      let isMounted = true;
      setLoading(true); setError(null);
      const fetchPublicArtists = async () => {
          try {
              const response = await api.get('/api/artist/all');
              if(isMounted) setArtistas(Array.isArray(response.data) ? response.data : []);
          } catch(err) {
              console.error("Error fetching public artistas:", err);
              if(isMounted) setError("Error al cargar artistas.");
          } finally {
              if(isMounted) setLoading(false);
          }
      };
      fetchPublicArtists();
      return () => { isMounted = false };
  }, []); // Se ejecuta solo al montar

  const handleFollowClick = (artistId) => {
    if (!token) {
      onRequireLogin();
    } else {
      alert(`Funcionalidad 'Seguir' artista ${artistId} pendiente.`);
      // TODO: Implementar POST /api/user/me/seguidos/{artistId}
    }
  };

  return (
    <div className="page-container">
       <nav>
           <button onClick={() => onNavigate(token ? 'dashboard' : 'home')}>Volver</button>
           {!token && <button onClick={() => onNavigate('login')}>Iniciar Sesión</button> }
       </nav>
      <h1>Artistas</h1>
      {loading && <p>Cargando artistas...</p>}
      {error && <p className="error">{error}</p>}
      <div className="section">
        {!loading && artistas.length === 0 && <p>No hay artistas.</p>}
        <ul>
          {artistas.map((artista) => (
            <li key={artista.id}>
              {/* TODO: Hacer clicable para ir a detalles */}
              <span>{artista.nombre}</span>
              <button onClick={() => handleFollowClick(artista.id)}>Seguir</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default ArtistListPage;