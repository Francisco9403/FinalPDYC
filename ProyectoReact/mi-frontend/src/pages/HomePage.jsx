import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Importa useMemo
import api from '../api';
import { useAuth } from '../AuthContext'; // Importa useAuth si necesitas logout

function HomePage({ onNavigate, onRequireLogin }) {
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true); // Renombrado
  const [errorEventos, setErrorEventos] = useState(null); // Renombrado

  // --- Estados para la lista de artistas ---
  const [allArtists, setAllArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  // ---  ESTADOS PARA EL FILTRO ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { token, logout } = useAuth(); // Usamos token y logout

  // --- Cargar Eventos ---
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

  // --- Cargar Artistas ---
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


  // --- LÓGICA DE FILTRO CON useMemo ---
  const filteredEvents = useMemo(() => {
    // Asegura que las fechas se interpreten en la zona horaria local
    const startFilterDate = startDate ? new Date(startDate + 'T00:00:00') : null;
    const endFilterDate = endDate ? new Date(endDate + 'T00:00:00') : null;
    
    // Ajusta la fecha final para incluir todo el día
    if (endFilterDate) {
      endFilterDate.setHours(23, 59, 59, 999);
    }

    // Si no hay filtros, devuelve todos los eventos
    if (!startFilterDate && !endFilterDate) {
      return eventos;
    }

    return eventos.filter(evento => {
      if (!evento.startDate) return false; // Ignora eventos sin fecha
      
      const eventDate = new Date(evento.startDate);

      // Comprueba si la fecha del evento está fuera del rango
      if (startFilterDate && eventDate < startFilterDate) {
        return false;
      }
      if (endFilterDate && eventDate > endFilterDate) {
        return false;
      }
      
      // Si pasa ambas comprobaciones, se incluye
      return true;
    });
  }, [eventos, startDate, endDate]); // Recalcula solo si cambian los eventos o las fechas
  // --- FIN: LÓGICA DE FILTRO ---


  // --- Función para traducir IDs a Nombres ---
  const getArtistNamesByIds = (artistIds) => {
    if (loadingArtists) return "Cargando artistas...";
    if (!artistIds || artistIds.length === 0) return "N/A";

    return artistIds.map(id => {
      const artist = allArtists.find(a => a.id === id);
      return artist ? artist.nombre : `ID ${id}`; // Muestra nombre o ID si no lo encuentra
    }).join(', ');
  };

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

      {/* --- CONTENEDOR DE CONTROLES --- */}
      <div className="header-controls">
        <nav>
          <button onClick={() => onNavigate('artists')}>Ver Artistas</button>
          {/* Mostramos Login o Dashboard según el token */}
          {!token ? (
              <button onClick={() => onNavigate('login')}>Iniciar Sesión</button>
          ) : (
              <button onClick={() => onNavigate('dashboard')}>Mi Panel</button>
          )}
        </nav>
        
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="start-date" className="filter-label">Desde:</label>
            <input 
              type="date" 
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="end-date" className="filter-label">Hasta:</label>
            <input 
              type="date" 
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate} // Evita que la fecha final sea anterior a la inicial
              className="filter-input"
            />
          </div>
          <button 
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="filter-button"
          >
            Limpiar
          </button>
        </div>
      </div>
      {/* --- FIN: CONTENEDOR DE CONTROLES --- */}

      {isLoading && <p>Cargando...</p>}
      {errorEventos && <p className="error">{errorEventos}</p>}
      <div className="event-list"> 

        {/* --- Mensaje dinámico --- */}
        {!isLoading && filteredEvents.length === 0 && (
          <p>
            {eventos.length === 0 
                ? "No hay eventos próximos." 
                : "No hay eventos que coincidan con tu búsqueda."
            }
          </p>
        )}        
        {filteredEvents.map((evento) => (
          <div key={evento.id} className="event-card">
            <div className="event-card-body">
              <h3 
                className="event-title"
                onClick={() => onNavigate('eventDetails', evento.id)}
              >
                {evento.nombre}
              </h3>
              <span className="event-date">
                {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'N/A'}
              </span>
              <p className="event-description">
                {(evento.descripcion && evento.descripcion.length > 100) ? 
                  `${evento.descripcion.substring(0, 100)}...` : 
                  (evento.descripcion || 'N/A')
                }
              </p>
              {evento.artistIds?.length > 0 && (
                <p className="event-artists">
                  <strong>Artistas:</strong> {getArtistNamesByIds(evento.artistIds)}
                </p>
              )}
              <p className="event-state">
                <strong>Estado:</strong> {evento.state || 'N/A'}
              </p>
            </div>
            <div className="event-card-footer">
              <button
                onClick={() => handleFavoriteClick(evento.id, evento.nombre)}
                title={token ? "Añadir a mis favoritos" : "Debes iniciar sesión para añadir favoritos"}>
                Añadir a Favorito
              </button>
            </div>
          </div>          
        ))}
      </div>
    </div>
  );
}
export default HomePage;

