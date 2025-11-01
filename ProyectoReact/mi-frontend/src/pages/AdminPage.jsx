import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

// Hook simple para obtener datos (mantenido aquí por simplicidad)
function useAdminData(endpoint) {
    const { token, logout } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useCallback para la función de fetch
    const fetchData = useCallback(async () => {
        if (!token) { setLoading(false); setData([]); return; }

        setLoading(true); setError(null);
        let isMounted = true;
        try {
            const response = await api.get(endpoint); // Interceptor añade token
            if (isMounted) setData(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(`Error fetch admin ${endpoint}:`, err);
            if (isMounted) setError(`Error cargando datos (${endpoint}).`);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
               console.warn(`Error 401/403 en ${endpoint}, deslogueando.`);
               logout();
            }
        } finally {
            if (isMounted) setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, logout, endpoint]); // Dependencias correctas

    // useEffect que llama a la función de fetch
    useEffect(() => {
        fetchData(); // Llama a la función memoizada
    }, [fetchData]); // Depende de la función memoizada

    // Devolvemos fetchData para recargar manually
    return { data, setData, loading, error, refreshData: fetchData };
}


function AdminPage({ onNavigate }) {
  const { logout } = useAuth();

  // --- Fetch de Listas Completas ---
  const { data: artistas, setData: setArtistas, loading: loadingArtistas, error: errorArtistas, refreshData: refreshArtistas } = useAdminData('/api/artist/all');
  const { data: eventos, setData: setEventos, loading: loadingEventos, error: errorEventos, refreshData: refreshEventos } = useAdminData('/api/event/all');
  // ---------------------------------

  // --- Estados formularios creación (ACTUALIZADO para Artista) ---
  const [nuevoNombreArtista, setNuevoNombreArtista] = useState('');
  const [nuevoGeneroArtista, setNuevoGeneroArtista] = useState('');
  const [nuevoEmailArtista, setNuevoEmailArtista] = useState('');
  const [nuevoActiveArtista, setNuevoActiveArtista] = useState(true);

  const [nuevoNombreEvento, setNuevoNombreEvento] = useState('');
  const [nuevaDescripcionEvento, setNuevaDescripcionEvento] = useState('');
  const [nuevaFechaEvento, setNuevaFechaEvento] = useState('');
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  // -----------------------------------------------------------

  // --- Función Crear Artista (ACTUALIZADA) ---
  const handleCrearArtista = async (event) => {
    event.preventDefault();
    if (nuevoNombreArtista.trim() === '' || nuevoGeneroArtista.trim() === '' || nuevoEmailArtista.trim() === '') {
        alert("Nombre, Género y Email son requeridos."); return;
    }
    if (!/\S+@\S+\.\S+/.test(nuevoEmailArtista)) {
        alert("Email inválido."); return;
    }
    setIsCreatingArtist(true);
    try {
      const nuevoArtistaPayload = { nombre: nuevoNombreArtista, genero: nuevoGeneroArtista, email: nuevoEmailArtista, active: nuevoActiveArtista };
      const response = await api.post('/api/artist/create', nuevoArtistaPayload);
      if (response.data?.id) {
        setArtistas(prev => [...prev, response.data]);
        setNuevoNombreArtista(''); setNuevoGeneroArtista(''); setNuevoEmailArtista(''); setNuevoActiveArtista(true);
        alert("Artista creado.");
      } else {
        console.warn("Respuesta inesperada al crear artista");
        setNuevoNombreArtista(''); setNuevoGeneroArtista(''); setNuevoEmailArtista(''); setNuevoActiveArtista(true);
        alert("Artista creado, respuesta inesperada.");
      }
    } catch (err) { /* ... (manejo de error igual) ... */ }
    finally { setIsCreatingArtist(false); }
  };
  // --- FIN FUNCIÓN ACTUALIZADA ---

  // Función Crear Evento (sin cambios)
  const handleCrearEvento = async (event) => {
    event.preventDefault(); if (nuevoNombreEvento.trim() === '' || nuevaDescripcionEvento.trim() === '' || nuevaFechaEvento.trim() === '') { alert('Campos requeridos.'); return; } setIsCreatingEvent(true);
    try {
      const nuevoEventoPayload = { nombre: nuevoNombreEvento, descripcion: nuevaDescripcionEvento, startDate: nuevaFechaEvento };
      const response = await api.post('/api/event/create', nuevoEventoPayload);
      if (response.data?.id) {
        setEventos(prev => [...prev, response.data]);
        setNuevoNombreEvento(''); setNuevaDescripcionEvento(''); setNuevaFechaEvento(''); alert("Evento creado (TENTATIVE).");
      } else { console.warn("Respuesta inesperada"); setNuevoNombreEvento(''); setNuevaDescripcionEvento(''); setNuevaFechaEvento(''); alert("Evento creado, respuesta inesperada."); }
    } catch (err) { /* ... (manejo de error igual) ... */ }
     finally { setIsCreatingEvent(false); }
  };

  // --- Funciones Eliminar/Cancelar/Navegar Edición (sin cambios) ---
  const handleDeleteArtist = async (artistId, artistName) => {
      if (!window.confirm(`¿Seguro de eliminar "${artistName}"?`)) return;
      try {
          await api.delete(`/api/artist/${artistId}`);
          setArtistas(prev => prev.filter(a => a.id !== artistId));
          alert(`Artista "${artistName}" eliminado.`);
      } catch (err) {
           console.error(`Error al eliminar artista ${artistId}:`, err);
           if (err.response && (err.response.status === 401 || err.response.status === 403)) { alert('Error autenticación/permisos.'); logout(); }
           else { alert(`Error al eliminar: ${err.response?.data?.message || err.message}`); }
       }
  };

  const handleCancelEvent = async (eventId, eventName) => {
      if (!window.confirm(`¿Seguro de cancelar "${eventName}"?`)) return;
      try {
          await api.put(`/api/event/${eventId}/canceled`);
          setEventos(prev => prev.map(e => e.id === eventId ? { ...e, state: 'CANCELLED' } : e ));
          alert(`Evento "${eventName}" cancelado.`);
      } catch (err) {
           console.error(`Error al cancelar evento ${eventId}:`, err);
           if (err.response && (err.response.status === 401 || err.response.status === 403)) { alert('Error autenticación/permisos.'); logout(); }
           else { alert(`Error al cancelar: ${err.response?.data?.message || err.message}`); }
       }
  };

  const handleEditArtist = (artistId) => { onNavigate('editArtist', artistId); };
  const handleEditEvent = (eventId) => { onNavigate('editEvent', eventId); };

  return (
    <div className="page-container">
      <nav>
        <button onClick={() => onNavigate('dashboard')}>Volver al Panel Principal</button>
      </nav>
      <h1>Panel de Administración</h1>

      {/* Formularios de Creación */}
       <div className="main-content">
          <div className="section">
            <h2>Crear Artista</h2>
            {/* --- FORMULARIO ARTISTA ACTUALIZADO --- */}
            <form onSubmit={handleCrearArtista}>
              <div className="form-group">
                  <label htmlFor="nuevoNombreArtista">Nombre:</label>
                  <input id="nuevoNombreArtista" type="text" placeholder="Nombre del artista" value={nuevoNombreArtista} onChange={(e) => setNuevoNombreArtista(e.target.value)} required className="input-field"/>
              </div>
              <div className="form-group">
                  <label htmlFor="nuevoGeneroArtista">Género:</label>
                  <input id="nuevoGeneroArtista" type="text" placeholder="Ej: Rock, Pop..." value={nuevoGeneroArtista} onChange={(e) => setNuevoGeneroArtista(e.target.value)} required className="input-field"/>
              </div>
              <div className="form-group">
                  <label htmlFor="nuevoEmailArtista">Email:</label>
                  <input id="nuevoEmailArtista" type="email" placeholder="contacto@artista.com" value={nuevoEmailArtista} onChange={(e) => setNuevoEmailArtista(e.target.value)} required className="input-field"/>
              </div>
              
              <button type="submit" disabled={isCreatingArtist}>{isCreatingArtist ? 'Creando...' : 'Agregar Artista'}</button>
            </form>
             {/* --- FIN FORMULARIO ARTISTA --- */}
          </div>
          <div className="section">
            <h2>Crear Evento</h2>
             {/* Formulario Evento (sin cambios) */}
             <form onSubmit={handleCrearEvento} className="event-form">
               <input type="text" placeholder="Nombre" value={nuevoNombreEvento} onChange={(e) => setNuevoNombreEvento(e.target.value)} required className="input-field" />
               <input type="text" placeholder="Descripción" value={nuevaDescripcionEvento} onChange={(e) => setNuevaDescripcionEvento(e.target.value)} required className="input-field"/>
               <input type="date" value={nuevaFechaEvento} onChange={(e) => setNuevaFechaEvento(e.target.value)} required className="input-field date-input" />
               <button type="submit" disabled={isCreatingEvent}>{isCreatingEvent ? 'Creando...' : 'Agregar Evento'}</button>
             </form>
          </div>
       </div>

       <hr style={{margin: '30px 0'}}/>

       {/* Listas de Gestión */}
       <div className="main-content">
           <div className="section">
               <h2>Gestionar Artistas</h2>
               {loadingArtistas && <p>Cargando artistas...</p>}
               {errorArtistas && <p className="error">{errorArtistas}</p>}
               {!loadingArtistas && artistas.length === 0 && <p>No hay artistas.</p>}
               {/* --- CORRECCIÓN JSX AQUÍ --- */}
               <ul>
                   {artistas.map(artista => (
                       <li key={artista.id}>
                           <span>{artista.nombre} {artista.active === false ? '(Inactivo)' : ''}</span>
                           <div>
                               <button onClick={() => handleEditArtist(artista.id)} style={{marginRight: '5px', backgroundColor: '#0004ff'}}>Editar</button>
                               <button onClick={() => handleDeleteArtist(artista.id, artista.nombre)} style={{backgroundColor: '#dc3545'}}>Eliminar</button>
                           </div>
                       </li>
                   ))}
               </ul>
               {/* --- FIN CORRECCIÓN --- */}
               <button onClick={refreshArtistas} disabled={loadingArtistas}>Recargar Artistas</button>
           </div>
           <div className="section">
               <h2>Gestionar Eventos</h2>
               {loadingEventos && <p>Cargando eventos...</p>}
               {errorEventos && <p className="error">{errorEventos}</p>}
               {!loadingEventos && eventos.length === 0 && <p>No hay eventos.</p>}
               {/* --- CORRECCIÓN JSX AQUÍ --- */}
               <ul>
                   {eventos.map(evento => {
                       const isCancelDisabled = evento.state === 'CANCELLED' || evento.state === 'TENTATIVE';
                       return (
                           <li key={evento.id}>
                               <span>
                                   {evento.nombre}
                                <span style={{
                                    color: evento.state === 'CONFIRMED' ? 'green' : 
                                        (evento.state === 'TENTATIVE' ? 'orange' : 
                                        (evento.state === 'CANCELLED' ? 'red' : 
                                        (evento.state === 'RESCHEDULED' ? 'dodgerblue' : 'inherit'))), 
                                    marginLeft:'5px'
                                }}>
                                    ({evento.state})
                                </span>
                                    - {new Date(evento.startDate).toLocaleDateString()}
                               </span>
                               <div>
                                   <button onClick={() => handleEditEvent(evento.id)} style={{marginRight: '5px', backgroundColor: '#0004ff'}}>Editar</button>
                                   <button
                                       onClick={() => handleCancelEvent(evento.id, evento.nombre)}
                                       disabled={isCancelDisabled}
                                       style={{backgroundColor: isCancelDisabled ? '#a39696ff' : '#dc3545'}}
                                    >
                                       {evento.state === 'CANCELLED' ? 'Cancelado' : 'Cancelar'}
                                   </button>
                               </div>
                           </li>
                       );
                   })}
               </ul>
               {/* --- FIN CORRECCIÓN --- */}
                <button onClick={refreshEventos} disabled={loadingEventos}>Recargar Eventos</button>
           </div>
       </div>

    </div>
  );
}
export default AdminPage;

