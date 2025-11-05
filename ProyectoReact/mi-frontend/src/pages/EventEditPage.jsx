import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Usa la instancia de Axios
import { useAuth } from '../AuthContext'; // Para logout en caso de error

function EventEditPage({ eventId, onNavigate }) {
  const { logout } = useAuth();
  const [evento, setEvento] = useState(null);// Estado para los datos del evento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error general de la página
  const [newDate, setNewDate] = useState('');// Estado para la nueva fecha (reprogramación)
  const [isUpdatingState, setIsUpdatingState] = useState(false); // Loading para cambios de estado
  const [availableArtists, setAvailableArtists] = useState([]); // Todos los artistas para el dropdown
  const [loadingAvailableArtists, setLoadingAvailableArtists] = useState(true);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [isUpdatingArtists, setIsUpdatingArtists] = useState(false); // Loading para agregar/quitar

  // --- Carga de Todos los Artistas Disponibles ---
  const fetchAvailableArtists = useCallback(async () => {
      setLoadingAvailableArtists(true);
      let isMounted = true;
      try {
          const response = await api.get('/api/artist/public/all'); // Asume endpoint público
          if (isMounted) {
            setAvailableArtists(Array.isArray(response.data) ? response.data : []);
          }
      } catch (err) {
          console.error("Error fetching available artists:", err);
          if (isMounted) setError("Error al cargar lista de artistas."); // Mostrar error
      } finally {
          if (isMounted) setLoadingAvailableArtists(false);
      }
      return () => { isMounted = false; };
  }, []);

  // --- Fetch de Datos del Evento ---
  const fetchEventData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEvento(null); // Limpia datos previos
    let isMounted = true;
    try {
      const response = await api.get(`/api/event/${eventId}`);
      const eventData = response.data;
      if (isMounted && eventData) {
        setEvento(eventData);
        if (eventData.startDate) {
          try {
             const formattedDate = new Date(eventData.startDate).toISOString().split('T')[0];
             setNewDate(formattedDate);
          } catch(e) { console.error("Error formateando fecha inicial:", e); setNewDate(''); }
        }
      } else if (isMounted) { setError("No se encontraron datos para este evento."); }
    } catch (err) {
      console.error(`Error fetching event ${eventId}:`, err);
      if (isMounted) setError("Error al cargar los datos del evento.");
      if (isMounted && err.response && (err.response.status === 401 || err.response.status === 403)) logout();
    } finally { if (isMounted) setLoading(false); }
  }, [eventId, logout]);

  useEffect(() => {
      fetchEventData(); // Llama al fetch del evento
      fetchAvailableArtists(); // Llama al fetch de artistas disponibles
  }, [fetchEventData, fetchAvailableArtists]); // Depende de las funciones memoizadas

  // --- Funciones para Cambiar Estado (Sin cambios) ---
  const handleConfirm = async () => {
    if (!evento || evento.state === 'CONFIRMED' || evento.state === 'CANCELLED') return;
    if (!window.confirm(`¿Seguro de confirmar el evento "${evento.nombre}"?`)) return;
    setIsUpdatingState(true); setError(null);
    try {
      const response = await api.put(`/api/event/${eventId}/confirmed`);
      setEvento(response.data); // Actualiza con respuesta
      alert("Evento confirmado.");
    } catch (err) {
      console.error(`Error al confirmar evento ${eventId}:`, err);
      setError(`Error al confirmar: ${err.response?.data?.message || err.message}`);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) logout();
    } finally { setIsUpdatingState(false); }
  };

  const handleReschedule = async () => {
      if (!evento || !newDate || evento.state === 'CANCELLED') return;
      if (isNaN(new Date(newDate).getTime())) { alert("Fecha inválida."); return; }
      if (!window.confirm(`¿Seguro de reprogramar "${evento.nombre}" para ${new Date(newDate).toLocaleDateString()}?`)) return;
      setIsUpdatingState(true); setError(null);
      try {
          const response = await api.put(`/api/event/${eventId}/rescheduled`, `"${newDate}"` , {
             headers: { 'Content-Type': 'application/json' }
          });
          setEvento(response.data); // Actualiza con respuesta
          alert("Evento reprogramado.");
      } catch (err) {
          console.error(`Error al reprogramar evento ${eventId}:`, err);
          setError(`Error al reprogramar: ${err.response?.data?.message || err.message}`);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) logout();
      } finally { setIsUpdatingState(false); }
  };

  // --- Función Helper para obtener nombre de artista ---
  const getArtistNameById = (id) => {
    // Busca en la lista 'availableArtists' que ya cargamos
    const artist = availableArtists.find(a => a.id === id);
    return artist ? artist.nombre : `ID ${id}`; // Devuelve el nombre o el ID como fallback
  };

  const handleAddArtistToEvent = async () => {
    if (!evento || !selectedArtistId || isUpdatingArtists) return;

    const artistId = parseInt(selectedArtistId);
    const artistName = availableArtists.find(a => a.id === artistId)?.nombre || `ID ${artistId}`;

    // Verifica si el ID ya está en la lista de IDs
    if (evento.artistIds?.includes(artistId)) {
        alert("Este artista ya está asignado.");
        return;
    }

    setIsUpdatingArtists(true);
    setError(null); // Limpia error previo
    try {
        // POST /api/event/{eventId}/artists con body: { "artistId": Long }
        const response = await api.post(`/api/event/${eventId}/artists`, { artistId });

        setEvento(response.data); // Usamos la respuesta del backend (evento actualizado) para actualizar nuestro estado local.
        
        setSelectedArtistId(''); // Limpiar la selección
        alert(`Artista ${artistName} agregado con éxito.`);
    } catch (err) {
        console.error("Error al agregar artista:", err);

        const errorMessage = err.response.data.message ;//|| err.message;  //Esta const se podria ahorrar. Contiene el error (code 400)
        setError(`Error al agregar ${artistName}:  ${errorMessage}`);
        console.log("Error al modificar Evento: "+errorMessage);
        //alert(`Error al agregar ${artistName}: El evento debe estar en estado TENTATIVE.\nTipo de error: ${errorMessage}`);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) logout(); //Por si hay un error de autenticacion
    } finally {
        setIsUpdatingArtists(false);
    }
  };

  // --- Función para Quitar Artista ---
  const handleRemoveArtistFromEvent = async (artistId, artistName) => {
    if (!evento || isUpdatingArtists) return;

    if (!window.confirm(`¿Seguro que quieres quitar a ${artistName} del evento "${evento.nombre}"?`)) return;

    setIsUpdatingArtists(true);
    setError(null); // Limpia error previo
    try {
        // DELETE /api/event/{eventId}/artists/{artistId}
        const response = await api.delete(`/api/event/${eventId}/artists/${artistId}`);

        // Usamos la respuesta del backend para actualizar el estado
        setEvento(response.data);
        
        alert(`${artistName} ha sido quitado del evento.`);
    } catch (err) {
        console.error("Error al quitar artista:", err);
        setError(`Error al quitar ${artistName}: ${err.response?.data?.message || err.message}`);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) logout();
    } finally {
        setIsUpdatingArtists(false);
    }
  };

  // --- Renderizado ---
  if (loading) return <div className="page-container"><p>Cargando datos del evento...</p></div>;

  return (
    <div className="page-container">
      <nav>
        <button onClick={() => onNavigate('admin')}>Volver al Panel Admin</button>
      </nav>
      <h1>Editar Evento (ID: {eventId})</h1>

      {/* Muestra error general */}
      {error && <p className="error" style={{textAlign: 'center'}}>{error}</p>}
      
      {evento ? (
        <> {/* Fragmento para agrupar */}
          {/* Detalles del Evento (Sección 1) */}
          <div className="section event-details">
            <h2>{evento.nombre}</h2>
            <p><strong>Estado Actual:</strong> <span style={{ fontWeight: 'bold', color: evento.state === 'TENTATIVE' ? 'orange' : (evento.state === 'CANCELLED' ? 'red' : 'green'), marginLeft:'5px'}}>{evento.state}</span></p>
            <p><strong>Fecha Actual:</strong> {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Descripción:</strong> {evento.descripcion || 'N/A'}</p>
            {/* Quitamos la lista de IDs simple, la de abajo es mejor */}
          </div>
          
          {/* Acciones de Cambio de Estado (Sección 2) */}
          <div className="section state-actions-section">
            <h3>Cambiar Estado:</h3>
            <div className="state-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
              {evento.state !== 'CONFIRMED' && evento.state !== 'CANCELLED' && ( <button onClick={handleConfirm} disabled={isUpdatingState || isUpdatingArtists} style={{backgroundColor: '#5cb85c'}}> {isUpdatingState ? '...' : 'Confirmar'} </button> )}
              {evento.state !== 'CANCELLED' && (
                  <div className="reschedule-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="newDate" style={{whiteSpace: 'nowrap'}}>Reprogramar:</label>
                    <input id="newDate" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required className="input-field date-input" style={{width: 'auto'}}/>
                    <button onClick={handleReschedule} disabled={isUpdatingState || isUpdatingArtists || !newDate} style={{backgroundColor: '#f0ad4e'}}> {isUpdatingState ? '...' : 'Reprogramar'} </button>
                  </div>
              )}
            </div>
          </div>
          
          {/* --- SECCIÓN GESTIÓN DE ARTISTAS --- */}
          <div className="section manage-artists-section">
              <h3>Gestionar Artistas Asignados</h3>
              {loadingAvailableArtists ? <p>Cargando lista de artistas...</p> : (
                <>
                  {/* Lista de artistas asignados (usando artistIds), Chequeamos evento.artistIds */}
                  {(!evento.artistIds || evento.artistIds.length === 0) && <p>No hay artistas asignados a este evento.</p>}
                  <ul style={{ listStyleType: 'none', padding: 0, marginBottom: '20px' }}>
                      {evento.artistIds?.map(artistId => { // Iteramos sobre la lista de IDs
                          const artistName = getArtistNameById(artistId); // Mapea ID a Nombre
                          return (
                              <li key={artistId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                                  <span>{artistName}</span>
                                  <button 
                                      onClick={() => handleRemoveArtistFromEvent(artistId, artistName)} 
                                      disabled={isUpdatingArtists || isUpdatingState} 
                                      style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                  >
                                      Quitar
                                  </button>
                              </li>
                          );
                      })}
                  </ul>

                  {/* Dropdown para Añadir Artista */}
                  <h4 style={{marginTop: '20px'}}>Añadir Artista al Evento:</h4>
                  <div className="manage-add" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <select 
                         id="selectArtist"
                         value={selectedArtistId} 
                         onChange={(e) => setSelectedArtistId(e.target.value)} 
                         disabled={isUpdatingArtists || isUpdatingState || loadingAvailableArtists}
                         className="input-field"
                         style={{ minWidth: '200px', flexGrow: 1 }}
                      >
                         <option value="">-- {loadingAvailableArtists ? "Cargando..." : "Selecciona un artista"} --</option>
                         {availableArtists
                             //Se filtra usando evento.artistIds
                             .filter(a => !evento.artistIds?.includes(a.id))
                             .map(artista => (
                                 <option key={artista.id} value={artista.id}>
                                     {artista.nombre} ({artista.genero})
                                 </option>
                         ))}
                      </select>
                      <button 
                         onClick={handleAddArtistToEvent} 
                         disabled={!selectedArtistId || isUpdatingArtists || isUpdatingState}
                         style={{ backgroundColor: '#28a745', color: 'white' }}
                      >
                         {isUpdatingArtists ? 'Agregando...' : 'Agregar'}
                      </button>
                  </div>
                </>
              )}
          </div>
          {/* --- FIN SECCIÓN --- */}
        </>
      ) : (
        !error && <p>No se pudo cargar la información del evento.</p>
      )}
    </div>
  );
}

export default EventEditPage;

