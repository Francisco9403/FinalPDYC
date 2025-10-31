import React, { useState, useEffect, useCallback } from 'react'; // Importa useCallback
import api from '../api';
import { useAuth } from '../AuthContext'; // Importa useAuth si necesitas logout

function HomePage({ onNavigate, onRequireLogin }) {
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true); // Renombrado
  const [errorEventos, setErrorEventos] = useState(null); // Renombrado

  // --- NUEVO: Estados para la lista de artistas ---
  const [allArtists, setAllArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  // ----------------------------------------------

  const { token, logout } = useAuth(); // Usamos token y logout

  // --- Cargar Eventos (Función separada) ---
  const fetchPublicEvents = useCallback(async () => {
    let isMounted = true;
    setLoadingEventos(true); setErrorEventos(null);
    try {
      const response = await api.get('/api/public/eventos');
      if (isMounted) {
        setEventos(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Error fetching public eventos:", err);
      if (isMounted) setErrorEventos("Error al cargar eventos públicos.");
    } finally {
      if (isMounted) setLoadingEventos(false);
    }
    return () => { isMounted = false; };
  }, []); // Vacío, se crea una vez

  // --- NUEVO: Cargar Artistas (Función separada) ---
  const fetchAllArtists = useCallback(async () => {
      let isMounted = true;
      setLoadingArtists(true);
      try {
          const response = await api.get('/api/artist/all'); // O /api/artist/public/all
          if (isMounted) setAllArtists(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
          console.error("Error fetching all artists:", err);
          // No es un error fatal, la app puede seguir, solo mostrará IDs
      } finally {
          if (isMounted) setLoadingArtists(false);
      }
      return () => { isMounted = false; };
  }, []); // Vacío, se crea una vez

  // --- useEffect para llamar a ambas funciones al montar ---
  useEffect(() => {
    fetchPublicEvents();
    fetchAllArtists();
  }, [fetchPublicEvents, fetchAllArtists]); // Llama a ambas

  // --- NUEVO: Función para traducir IDs a Nombres ---
  const getArtistNamesByIds = (artistIds) => {
    if (loadingArtists) return "Cargando artistas...";
    if (!artistIds || artistIds.length === 0) return "N/A";

    return artistIds.map(id => {
      const artist = allArtists.find(a => a.id === id);
      return artist ? artist.nombre : `ID ${id}`; // Muestra nombre o ID si no lo encuentra
    }).join(', ');
  };
  // -------------------------------------------------

  // Renombrada: handleFollowClick -> handleFavoriteClick
  const handleFavoriteClick = async (eventId, eventName) => {
    if (!token) {
      onRequireLogin();
      return;
    }
    try {
      const url = `/api/user/me/favoritos/${eventId}`;
      await api.post(url); // Interceptor añade token
      alert(`¡El evento "${eventName}" fue agregado a tus favoritos!`);
    } catch (err) {
      console.error(`Error al agregar a evento favorito a ${eventId}:`, err);
      if (err.response && err.response.status === 409) {
        alert(`El evento "${eventName}" ya se encuentra en tus favoritos.`);
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        logout();
      } else {
        // Usamos setErrorEventos para mostrar el error en la UI
        setErrorEventos("No se pudo agregar a evento favorito. Inténtalo de nuevo.");
      }
    }
  };

  const isLoading = loadingEventos || loadingArtists; // Carga general

  return (
    <div className="page-container">
      <h1>Próximos Eventos Públicos</h1>
      <nav>
        <button onClick={() => onNavigate('artists')}>Ver Artistas</button>
        {/* Mostramos Login o Dashboard según el token */}
        {!token ? (
            <button onClick={() => onNavigate('login')}>Iniciar Sesión</button>
        ) : (
            <button onClick={() => onNavigate('dashboard')}>Mi Panel</button>
        )}
      </nav>
      {isLoading && <p>Cargando...</p>}
      {errorEventos && <p className="error">{errorEventos}</p>}
      <div className="section">
        {!isLoading && eventos.length === 0 && <p>No hay eventos próximos.</p>}
        <ul>
          {eventos.map((evento) => (
            <li
              key={evento.id}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', padding: '15px 10px',
                borderBottom: '1px solid #eee'
              }}
            >
              {/* Div de Información */}
              <div>
                {/* --- Click en el nombre te lleva a detalles --- */}
                <span 
                    onClick={() => onNavigate('eventDetails', evento.id)} 
                    style={{fontWeight: 'bold', fontSize: '1.2em', cursor: 'pointer', color: '#007bff'}}
                >
                   {evento.nombre} 
                </span>
                <span style={{marginLeft: '8px', color: '#555'}}>
                  ({evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'N/A'})
                </span>

                {/* Detalles (incluyendo nombres de artistas) */}
                <div style={{marginTop: '8px', fontSize: '0.9em', color: '#333'}}>
                  <p style={{margin: '4px 0'}}>
                    <strong>Estado:</strong> {evento.state || 'N/A'}
                  </p>
                  <p style={{margin: '4px 0'}}>
                    <strong>Descripción:</strong> {(evento.descripcion && evento.descripcion.length > 100) ? 
                      `${evento.descripcion.substring(0, 100)}...` : 
                      (evento.descripcion || 'N/A')
                    }
                  </p>
                  {/* --- MODIFICACIÓN: Mostrar Nombres de Artistas --- */}
                  {evento.artistIds?.length > 0 && (
                    <p style={{margin: '4px 0'}}>
                      <strong>Artistas:</strong> {getArtistNamesByIds(evento.artistIds)}
                    </p>
                  )}
                  {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>
              </div>

              {/* Botón Favorito */}
              <button
                onClick={() => handleFavoriteClick(evento.id, evento.nombre)}
                style={{marginLeft: '15px', padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0}}
                title={token ? "Añadir a mis favoritos" : "Debes iniciar sesión para añadir favoritos"}>
                Añadir a Favorito
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default HomePage;

