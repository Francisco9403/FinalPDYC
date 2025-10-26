// Ruta: src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

// Hook simple para datos del dashboard (puedes moverlo a un archivo hooks.js si prefieres)
function useDashboardData(endpoint) {
    const { token, logout } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, [token, logout, endpoint]);

    return { data, loading, error };
}


function DashboardPage({ onNavigate }) {
  // Obtenemos user y logout del contexto
  const { user, logout } = useAuth();

  // Fetch de datos del dashboard
  const { data: artistasSeguidos, loading: loadingSeguidos, error: errorSeguidos } = useDashboardData('/api/user/me/seguidos-artistas');
  const { data: eventosFavoritos, loading: loadingFavoritos, error: errorFavoritos } = useDashboardData('/api/user/me/favoritos');

  // Determinamos si es Admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

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
             <ul>{artistasSeguidos.map(a => <li key={a.id}>{a.nombre} {/* TODO: Botón Dejar de Seguir */}</li>)}</ul>
          </div>
          <div className="section">
             <h2>Mis Eventos Favoritos</h2>
             {loadingFavoritos && <p>Cargando...</p>}
             {errorFavoritos && <p className="error">{errorFavoritos}</p>}
             {!loadingFavoritos && eventosFavoritos.length === 0 && <p>No tienes favoritos.</p>}
             <ul>{eventosFavoritos.map(e => <li key={e.id}>{e.nombre} - {new Date(e.startDate).toLocaleDateString()} {/* TODO: Botón Quitar Favorito */}</li>)}</ul>
          </div>
      </div>

       {/* --- Formularios eliminados de aquí --- */}

    </div>
  );
}
export default DashboardPage;