// Ruta: src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

// Hook simple para datos del dashboard (pueden moverse a un archivo hooks.js)
function useDashboardData(endpoint) {
    const { token, logout } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);//esta "variable" solo sirve para que podamos
                                                            //controlar cuando queremos actualizar/refrescar la pagina
    const refetch = () => setRefetchTrigger(prev => prev + 1);//con este metodo modificamos refetchTri...

    useEffect(() => {
        let isMounted = true;
        if (!token) { setLoading(false); setData([]); return; }
        setLoading(true); setError(null);
        const fetchData = async () => {
            try {
                const response = await api.get(endpoint); // Interceptor añade token
                if (isMounted) setData(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error(`Error fetch ${endpoint}:`, err);
                if (isMounted) setError(`Error cargando datos (${endpoint}).`);
                if (err.response && (err.response.status === 401 || err.response.status === 403)){
                     console.warn(`Error 401/403 en ${endpoint}, deslogueando.`);
                     logout();
                 }
            } finally { if (isMounted) setLoading(false); }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [token, logout, endpoint, refetchTrigger]);

    return { data, loading, error, refetch };
}


function DashboardPage({ onNavigate }) {
  // Obtenemos user y logout del contexto
  const { user, logout } = useAuth();

  // Fetch de datos del dashboard
  const { data: artistasSeguidos, loading: loadingSeguidos, error: errorSeguidos, refetch: refetchArtistas } = useDashboardData('/api/user/me/seguidos-artistas');
  const { data: eventosFavoritos, loading: loadingFavoritos, error: errorFavoritos, refetch: refetchFavoritos } = useDashboardData('/api/user/me/favoritos');

  // Determinamos si es Admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  const handleUnfollowArtist = async (artistId, artistName) => {//Para dejar de seguir a un artista
      if (!window.confirm(`¿Estás seguro de que quieres dejar de seguir a ${artistName}?`)) {
          return;
      }try {
          const url = `/api/user/me/seguidos/${artistId}`;
          await api.delete(url);        // Llamamos al back con el método DELETE
          alert(`Has dejado de seguir a ${artistName}.`);

          refetchArtistas();            // Forzamos la recarga de la lista de artistas seguidos

      } catch (err) {
          console.error("Error al dejar de seguir artista:", err);
          // Manejo de errores 401/403 (Sesión inválida)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              alert("Tu sesión ha expirado o no tienes permisos.");
              logout();
          } else {
              alert("Ocurrió un error al intentar dejar de seguir al artista.");
          }
      }
  };

  const handleRemoveFavorite = async (eventId, eventName) => {
      if (!window.confirm(`¿Estás seguro de que quieres quitar "${eventName}" de tus favoritos?`)) {
          return;
      }try {
          const url = `/api/user/me/favoritos/${eventId}`;
          await api.delete(url);            // Llama al backend usando el método DELETE 

          alert(`El evento "${eventName}" ha sido quitado de tus favoritos.`);
          refetchFavoritos();               // Forzamos la recarga de la lista de eventos favoritos

      } catch (err) {
          console.error("Error al quitar favorito:", err);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              alert("Tu sesión ha expirado o no tienes permisos.");
              logout();
          } else {
              alert("Ocurrió un error al intentar quitar el evento de favoritos.");
          }
      }
    };

  return (
    <div className="page-container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
              <button onClick={() => onNavigate('home')}>Inicio Público</button>
              <button onClick={() => onNavigate('artists')}>Ver Artistas</button>
              {/* --- Botón Condicional --- */}
              {isAdmin && (
                <button onClick={() => onNavigate('admin')}>Panel Admin</button>
              )}
              {/* ------------------------ */}
          </div>
          {user?.username && <span style={{margin: '0 10px'}}>Hola, {user.username} {isAdmin ? '(Admin)' : ''}</span>}
          <button onClick={logout} className="logout-button">Cerrar Sesión</button>
      </nav>
      <h1>Mi Panel</h1>

      {/* Listas del Dashboard */}
      <div className="main-content">
          <div className="section">
             <h2>Artistas que Sigo</h2>
             {loadingSeguidos && <p>Cargando...</p>}
             {errorSeguidos && <p className="error">{errorSeguidos}</p>}
             {!loadingSeguidos && artistasSeguidos.length === 0 && <p>No sigues artistas.</p>}
             <ul>
                {artistasSeguidos.map(a => 
                  <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {a.nombre} 
                    <button 
                    onClick={() => handleUnfollowArtist(a.id, a.nombre)} 
                    className="btn-danger">
                    Dejar de Seguir
                    </button>
                  </li>
                )}
              </ul>
          </div>
          <div className="section">
             <h2>Mis Eventos Favoritos</h2>
             {loadingFavoritos && <p>Cargando...</p>}
             {errorFavoritos && <p className="error">{errorFavoritos}</p>}
             {!loadingFavoritos && eventosFavoritos.length === 0 && <p>No tienes favoritos.</p>}
             <ul>
                {eventosFavoritos.map(e => 
                    <li 
                        key={e.id} 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{e.nombre} - {new Date(e.startDate).toLocaleDateString()}</span>
                        <button 
                        onClick={() => handleUnfollowArtist(a.id, a.nombre)} 
                        className="btn-danger">                            Quitar Favorito
                        </button>
                    </li>
                )}
              </ul>
          </div>
      </div>

       {/* --- Formularios eliminados de aquí --- */}

    </div>
  );
}
export default DashboardPage;