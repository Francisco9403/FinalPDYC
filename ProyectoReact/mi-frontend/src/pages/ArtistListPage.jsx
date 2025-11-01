// Ruta: src/pages/ArtistListPage.jsx
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
              if(isMounted) {
                  // Verificamos que sea un array antes de guardar
                  const data = Array.isArray(response.data) ? response.data : [];
                  console.log("Artistas recibidos:", data); // Log para ver los datos
                  setArtistas(data);
              }
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

  /*const handleFollowClick = (artistId) => {
    if (!token) {
      onRequireLogin();
    } else {
      alert(`Funcionalidad 'Seguir' artista ${artistId} pendiente.`);
      // TODO: Implementar POST /api/user/me/seguidos/{artistId}
      //const response = await api.post('/api/user/me/seguidos/{artistId}');
    }
  };*/

  const handleFollowClick = async (artistId) => { 
    if (!token) {
      onRequireLogin();
      return; // Se detiene la ejecución si no hay token
    }
    try {
      const url = `/api/user/me/seguidos/${artistId}`; 
      await api.post(url); 

      // si necesitamos la respuesta
      // const response = await api.post(url);      
      alert(`¡Ahora sigues al artista ${artistId}!`); // Ver logica de exito (tal vez sacar el boton de seguir a ese artista)
    
    } catch (err) {
      console.error(`Error al seguir al artista ${artistId}:`, err);
      if (err.response && err.response.status === 401) {
          alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          logout();
      } else {
          setError("No se pudo seguir al artista. Inténtalo de nuevo.");
      }
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
        {/* --- MODIFICACIÓN: Mostrar más datos en la lista --- */}
        <ul className="artist-list"> {/* Añadimos una clase para estilos opcionales */}
          {artistas.map((artista) => (
            <li key={artista.id} className={`artist-item ${!artista.active ? 'inactive' : ''}`}> {/* Clase condicional si está inactivo */}
              <div className="artist-info">
                  {/* Nombre (podría ser clicable para ir a detalles) */}
                  <span style={{ fontWeight: 'bold' }}>{artista.nombre || 'Nombre no disponible'}</span>
                  {/* Género */}
                  {artista.genero && <span style={{ marginLeft: '10px', color: '#555' }}>({artista.genero})</span>}
                  {/* Email (mostrar si existe) */}
                  {artista.email && <span style={{ marginLeft: '10px', color: '#777', fontSize: '0.9em' }}> - {artista.email}</span>}
                  {/* Estado Activo/Inactivo */}
                  <span style={{ marginLeft: '10px', color: artista.active ? 'green' : 'red', fontSize: '0.9em' }}>
                     {artista.active ? 'Activo' : 'Inactivo'}
                  </span>
              </div>
              {/* Botón Seguir (lógica igual que antes) */}
              <button onClick={() => handleFollowClick(artista.id)}>Seguir</button>
            </li>
          ))}
        </ul>
        {/* --- FIN DE LA MODIFICACIÓN --- */}
      </div>
    </div>
  );
}
export default ArtistListPage;