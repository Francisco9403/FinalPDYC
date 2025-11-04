// Ruta: src/pages/ArtistListPage.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Importé useMemo
import api from '../api';
import { useAuth } from '../AuthContext';

function ArtistListPage({ onNavigate, onRequireLogin }) {
  const [artistas, setArtistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth(); // Usamos token y logout

  // --- INICIO: ESTADOS DE FILTROS ---
  const [filterGenero, setFilterGenero] = useState('');
  const [filterActivo, setFilterActivo] = useState(''); // 'true', 'false', o '' (todos)
  // --- FIN: ESTADOS DE FILTROS ---

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

  // --- INICIO: LÓGICA DE FILTROS CON useMemo ---
  const filteredArtistas = useMemo(() => {
    return artistas.filter(artista => {
      
      // 1. Filtro por Género
      if (filterGenero) {
        // Comprueba si el género del artista existe y si incluye el texto del filtro (ignorando mayúsculas)
        if (!artista.genero || !artista.genero.toLowerCase().includes(filterGenero.toLowerCase())) {
          return false; // No coincide
        }
      }

      // 2. Filtro por Estado (Activo/Inactivo)
      if (filterActivo) { // 'true' o 'false'
        const artistaEstaActivo = artista.active === true;
        const filtroQuiereActivos = filterActivo === 'true';
        if (artistaEstaActivo !== filtroQuiereActivos) {
          return false; // No coincide
        }
      }

      // Si pasa todos los filtros, se incluye
      return true;
    });
  }, [artistas, filterGenero, filterActivo]); // Recalcula si cambia la lista o los filtros
  // --- FIN: LÓGICA DE FILTROS ---


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
      alert(`¡Ahora sigues al artista ${artistId}!`); // Restaurado el alert original
    
    } catch (err) {
      console.error(`Error al seguir al artista ${artistId}:`, err);
      if (err.response && err.response.status === 401) {
          alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo."); // Restaurado el alert original
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

      {/* --- INICIO: CONTROLES DE FILTRO --- */}
      <div className="filter-section" style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="filter-genero" style={{ display: 'block', marginBottom: '0.25rem' }}>Filtrar por género:</label>
          <input
            type="text"
            id="filter-genero"
            value={filterGenero}
            onChange={(e) => setFilterGenero(e.target.value)}
            placeholder="Escribe un género (ej. Rock)"
            className="input-field" // Asumo que tienes esta clase en tu CSS
            style={{ width: '100%' }}
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="filter-activo" style={{ display: 'block', marginBottom: '0.25rem' }}>Filtrar por estado:</label>
          <select
            id="filter-activo"
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value)}
            className="input-field" // Asumo que tienes esta clase en tu CSS
            style={{ width: '100%' }}
          >
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>
      {/* --- FIN: CONTROLES DE FILTRO --- */}


      {loading && <p>Cargando artistas...</p>}
      {error && <p className="error">{error}</p>}
      <div className="section">

        {/* --- Mensaje dinámico actualizado --- */}
        {!loading && filteredArtistas.length === 0 && (
          <p>
            {artistas.length === 0 
                ? "No hay artistas." 
                : "No hay artistas que coincidan con los filtros."
            }
          </p>
        )}
        
        {/* --- MODIFICACIÓN: Mapeo sobre filteredArtistas --- */}
        <ul className="artist-list">
          {filteredArtistas.map((artista) => (
            <li key={artista.id} className={`artist-item ${!artista.active ? 'inactive' : ''}`}>
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

