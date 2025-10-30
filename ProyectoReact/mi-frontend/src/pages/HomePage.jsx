import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext'; // Importa useAuth si necesitas logout

function HomePage({ onNavigate, onRequireLogin }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth(); // Usamos token y logout

  useEffect(() => {
    let isMounted = true;
    setLoading(true); setError(null);
    const fetchPublicEvents = async () => {
      try {
        const response = await api.get('/api/public/eventos');
        if (isMounted) {
          setEventos(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Error fetching public eventos:", err);
        if (isMounted) setError("Error al cargar eventos públicos.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPublicEvents();
    return () => { isMounted = false; };
  }, []);

  // --- MODIFICACIÓN 1: 'e' (evento del click) ya no es necesario ---
  const handleFollowClick = async (eventId, eventName) => {
    // e.stopPropagation(); // <-- Ya no es necesario con la nueva estructura
    if (!token) {
      onRequireLogin();
      return; 
    }
    try {
      const url = `/api/user/me/favoritos/${eventId}`;
      await api.post(url);
      alert(`¡El evento "${eventName}" fue agregado a tus favoritos!`);
    
    } catch (err) {
      console.error(`Error al agregar a evento favorito a ${eventId}:`, err);
      if (err.response && err.response.status === 409) {
        alert(`El evento "${eventName}" ya se encuentra en tus favoritos.`);
      } else if (err.response && err.response.status === 401) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        logout();
      } else {
        setError("No se pudo agregar a evento favorito. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="page-container">
      <h1>Próximos Eventos Públicos</h1>
      <nav>
        <button onClick={() => onNavigate('artists')}>Ver Artistas</button>
        <button onClick={() => onNavigate('login')}>Iniciar Sesión</button>
      </nav>
      {loading && <p>Cargando eventos...</p>}
      {error && <p className="error">{error}</p>}
      <div className="section">
        {!loading && eventos.length === 0 && <p>No hay eventos próximos.</p>}
        <ul>
          
          {/* --- MODIFICACIÓN 2: Reestructuración del <li> --- */}
          {eventos.map((evento) => (
            <li 
              key={evento.id} 
              // Estilos para el contenedor <li> (separador y layout flex)
              style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', // Alinea botón e info arriba
                padding: '15px 10px', 
                borderBottom: '1px solid #eee' // Separador entre eventos
              }}
            >
              
              {/* 1. Div de Información (Clickable) */}
              <div>
                {/* Info Principal */}
                <span style={{fontWeight: 'bold', fontSize: '1.2em'}}> {evento.nombre} </span>
                <span style={{marginLeft: '8px', color: '#555'}}>
                  ({evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'Fecha no disponible'})
                </span>

                {/* --- ATRIBUTOS AÑADIDOS --- */}
                <div style={{marginTop: '8px', fontSize: '0.9em', color: '#333'}}>
                  <p style={{margin: '4px 0'}}>
                    <strong>Estado:</strong> {evento.state || 'N/A'}
                  </p>
                  <p style={{margin: '4px 0'}}>
                    {/* Limitar la descripción para que no sea muy larga */}
                    <strong>Descripción:</strong> {(evento.descripcion && evento.descripcion.length > 100) ? 
                      `${evento.descripcion.substring(0, 100)}...` : 
                      (evento.descripcion || 'N/A')
                    }
                  </p>
                  {evento.artistIds?.length > 0 && (
                    <p style={{margin: '4px 0'}}>
                      <strong>Artistas (IDs):</strong> {evento.artistIds.join(', ')}
                    </p>
                  )}
                </div>
                {/* --- FIN DE ATRIBUTOS AÑADIDOS --- */}

              </div>

              {/* 2. Botón (sin cambios, solo se alinea por el flex) */}
              <button 
                // --- MODIFICACIÓN 3: Ya no pasamos 'e' ---
                onClick={() => handleFollowClick(evento.id, evento.nombre)} 
                style={{marginLeft: '15px', padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0}} // flexShrink: 0 evita que el botón se encoja
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