import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Usa la instancia de Axios
import { useAuth } from '../AuthContext'; // Para logout en caso de error

function EventEditPage({ eventId, onNavigate }) {
  const { logout } = useAuth();
  const [evento, setEvento] = useState(null);// Estado para los datos del evento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDate, setNewDate] = useState('');// Estado para la nueva fecha (reprogramación)
  const [isUpdatingState, setIsUpdatingState] = useState(false); // Loading para cambios de estado
  const [availableArtists, setAvailableArtists] = useState([]); // Todos los artistas para el dropdown
  const [loadingAvailableArtists, setLoadingAvailableArtists] = useState(true);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [isUpdatingArtists, setIsUpdatingArtists] = useState(false); // Loading para agregar/quitar

  // --- [ADICIÓN] Carga de Todos los Artistas Disponibles ---
  const fetchAvailableArtists = useCallback(async () => {
      setLoadingAvailableArtists(true);
      try {
          const response = await api.get('/api/artist/public/all');
          setAvailableArtists(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
          console.error("Error fetching available artists:", err);
          // Opcional: setError("Error al cargar lista de artistas.");
      } finally {
          setLoadingAvailableArtists(false);
      }
  }, []);

  const fetchEventData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEvento(null); // Limpia datos previos
    try {
      const response = await api.get(`/api/event/${eventId}`);
      const eventData = response.data;
      if (eventData) {
        setEvento(eventData);
        if (eventData.startDate) {// Pre-rellena el input de fecha si ya hay una
          // Asegura formato YYYY-MM-DD para el input type="date"
          try {
             const formattedDate = new Date(eventData.startDate).toISOString().split('T')[0];
             setNewDate(formattedDate);
          } catch(e) {
             console.error("Error formateando fecha inicial:", e);
             setNewDate(''); // Fallback
          }
        }
      } else {
        setError("No se encontraron datos para este evento.");
      }
    } catch (err) {
      console.error(`Error fetching event ${eventId}:`, err);
      setError("Error al cargar los datos del evento.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout(); // Desloguear si falla la autenticación/permisos
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, logout]); // Depende de eventId y logout

  useEffect(() => {
      fetchEventData(); // Llama al fetch del evento
      fetchAvailableArtists(); // Llama al fetch de artistas disponibles
  }, [fetchEventData, fetchAvailableArtists]); // Depende de las funciones memoizadas

  // --- Funciones para Cambiar Estado (Sin cambios) ---
  const handleConfirm = async () => {
    if (!evento || evento.state === 'CONFIRMED' || evento.state === 'CANCELLED') return; // Añadido chequeo CANCELLED
    if (!window.confirm(`¿Seguro de confirmar el evento "${evento.nombre}"?`)) return;
    setIsUpdatingState(true); setError(null);
    try {
      const response = await api.put(`/api/event/${eventId}/confirmed`); // Interceptor añade token
      setEvento(response.data);
      alert("Evento confirmado.");
    } catch (err) {
      console.error(`Error al confirmar evento ${eventId}:`, err);
      setError(`Error al confirmar: ${err.response?.data?.message || err.message}`);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) logout();
    } finally { setIsUpdatingState(false); }
  };

  const handleReschedule = async () => {
      if (!evento || !newDate || evento.state === 'CANCELLED') return;
      if (isNaN(new Date(newDate).getTime())) {
          alert("Fecha inválida.");
          return;
      }
      if (!window.confirm(`¿Seguro de reprogramar "${evento.nombre}" para ${new Date(newDate).toLocaleDateString()}?`)) return;
      setIsUpdatingState(true); setError(null);
      try {
          const response = await api.put(`/api/event/${eventId}/rescheduled`, `"${newDate}"` , {// Enviamos la nueva fecha como JSON string
             headers: { 'Content-Type': 'application/json' }
          }); // Interceptor añade token
          setEvento(response.data);
          alert("Evento reprogramado.");
      } catch (err) {
          console.error(`Error al reprogramar evento ${eventId}:`, err);
          setError(`Error al reprogramar: ${err.response?.data?.message || err.message}`);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) logout();
      } finally { setIsUpdatingState(false); }
  };

  const handleAddArtistToEvent = async () => {
    if (!evento || !selectedArtistId || isUpdatingArtists) return;

    const artistId = parseInt(selectedArtistId); //selectedArtistId es el artista que seleccionaron en el front
    const artistName = availableArtists.find(a => a.id === artistId)?.nombre || `ID ${artistId}`; //availableArtists es la lista de artistas

    setIsUpdatingArtists(true);
    try {
        // POST /api/event/{eventId}/artists con body: { "artistId": Long }
        const response = await api.post(`/api/event/${eventId}/artists`, { artistId });

        // Para simplificar y mejorar UX: Actualizamos el estado local del evento con el nuevo artista.
        const addedArtist = availableArtists.find(a => a.id === artistId);
        if (addedArtist) {
            setEvento(prev => ({
                ...prev,
                // Asumimos que la lista en el estado se llama 'artists' (como objeto)
                artistIds: [...(prev.artistIds || []), artistId] //prev.artists || []: Toma el array de artistas existente (prev.artists). Si es null o undefined (por ejemplo, en la primera asignación), usa un array vacío ([]) para evitar errores.
            }));                                                    //Sino añade el objeto completo del artista (addedArtist)
        }  
        setSelectedArtistId(''); // Limpiar la selección
        alert(`Artista ${artistName} agregado con éxito.`);
    } catch (err) {
        console.error("Error al agregar artista:", err);
        alert(`Error al agregar ${artistName}: ${err.response?.data?.message || err.message}`);
    } finally {
        setIsUpdatingArtists(false);
    }
  };

  const handleRemoveArtistFromEvent = async (artistId, artistName) => {
    if (!evento || isUpdatingArtists) return;

    if (!window.confirm(`¿Seguro que quieres quitar a ${artistName} del evento "${evento.nombre}"?`)) return;

    setIsUpdatingArtists(true);
    try {
        // DELETE /api/event/{eventId}/artists/{artistId}
        await api.delete(`/api/event/${eventId}/artists/${artistId}`);
        setEvento(prev => ({// Actualizar el estado local
            ...prev,
            // Filtra el artista eliminado de la lista 'artists'
            artists: (prev.artists || []).filter(a => a.id !== artistId)
        }));  
        alert(`${artistName} ha sido quitado del evento.`);
    } catch (err) {
        console.error("Error al quitar artista:", err);
        alert(`Error al quitar ${artistName}: ${err.response?.data?.message || err.message}`);
    } finally {
        setIsUpdatingArtists(false);
    }
  };

  if (loading) return <div className="page-container"><p>Cargando datos del evento...</p></div>;
  return (
    <div className="page-container">
      <nav>
        <button onClick={() => onNavigate('admin')}>Volver al Panel Admin</button>
      </nav>
      <h1>Editar Evento (ID: {eventId})</h1>
      {error && <p className="error" style={{textAlign: 'center'}}>{error}</p>}
      {evento ? (
        <div className="section event-details">
            <h2>{evento.nombre}</h2>
            <p><strong>Estado Actual:</strong>
               <span style={{ fontWeight: 'bold', color: evento.state === 'TENTATIVE' ? 'orange' : (evento.state === 'CANCELLED' ? 'red' : 'green'), marginLeft:'5px'}}>
                 {evento.state}
               </span>
            </p>
            <p><strong>Fecha Actual:</strong> {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Descripción:</strong> {evento.descripcion || 'N/A'}</p>
            {evento.artistIds?.length > 0 && (<p><strong>Artistas (IDs):</strong> {evento.artistIds.join(', ')}</p>)}
            <hr style={{margin: '20px 0'}}/>
            
            <h3>Cambiar Estado:</h3>
            <div className="state-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}> {/* Flex layout */}
                {/* Botón Confirmar */}
                {evento.state !== 'CONFIRMED' && evento.state !== 'CANCELLED' && (
                  <button onClick={handleConfirm} disabled={isUpdatingState} style={{backgroundColor: '#5cb85c'}}>
                    {isUpdatingState ? '...' : 'Confirmar Evento'}
                  </button>
                )}
                
                {/* Sección Reprogramar */}
                {evento.state !== 'CANCELLED' && (
                    <div className="reschedule-section" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}> {/* Flex para alinear */}
                        <label htmlFor="newDate" style={{whiteSpace: 'nowrap'}}>Reprogramar:</label> {/* Evita que se rompa */}
                        <input
                           id="newDate"
                           type="date"
                           value={newDate}
                           onChange={(e) => setNewDate(e.target.value)}
                           required
                           className="input-field date-input"
                           style={{width: 'auto'}} // Ajusta ancho
                        />
                        <button onClick={handleReschedule} disabled={isUpdatingState || !newDate} style={{backgroundColor: '#f0ad4e'}}>
                          {isUpdatingState ? '...' : 'Reprogramar'}
                        </button>
                    </div>
                )}
                 {/* El botón Cancelar sigue en AdminPage */}
            </div>
             <hr style={{margin: '20px 0'}}/>
            {/* --- Sección Gestión de Artistas (Placeholder) --- */}
            <h3 style={{ marginTop: '20px' }}>Gestionar Artistas:</h3>
            {loadingAvailableArtists ? (
                <p>Cargando artistas disponibles...</p>
            ) : (
                <div className="artist-management-container">                    
                    {/* --- 3.1. Añadir Artista con Dropdown --- */}
                    <div className="manage-add" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <label htmlFor="selectArtist">Añadir:</label>
                        <select 
                            id="selectArtist"
                            value={selectedArtistId} 
                            onChange={(e) => setSelectedArtistId(e.target.value)} 
                            disabled={isUpdatingArtists}
                            className="input-field"
                            style={{ minWidth: '200px' }}>
                            <option value="" disabled>Selecciona un artista...</option>
                            {/* Filtramos los artistas que YA están asignados al evento (usando evento.artists) */}
                            {availableArtists
                                .filter(a => !evento.artists?.some(assigned => assigned.id === a.id)) 
                                .map(artista => (
                                    <option key={artista.id} value={artista.id}>
                                        {artista.nombre} ({artista.genero})
                                    </option>
                            ))}
                        </select>
                        <button 
                            onClick={handleAddArtistToEvent} 
                            disabled={!selectedArtistId || isUpdatingArtists}
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                        >
                            {isUpdatingArtists ? 'Agregando...' : 'Agregar'}
                        </button>
                    </div>
                    {/* --- 3.2. Listar Artistas Asignados y Botón Quitar --- */}
                    <h4>Artistas en el Evento ({evento.artists?.length || 0})</h4>
                    {(evento.artists?.length === 0 || !evento.artists) && <p>No hay artistas asignados.</p>}
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {evento.artists?.map(a => (
                            <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                                <span>{a.nombre}</span>
                                <button 
                                    onClick={() => handleRemoveArtistFromEvent(a.id, a.nombre)}
                                    disabled={isUpdatingArtists}
                                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                                    Quitar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <hr style={{margin: '20px 0'}}/>       
        </div>
      ) : (
        // Mensaje si no se cargó el evento y no hay error de carga
        !error && <p>No se pudo cargar la información del evento.</p>
      )}
    </div>
  );
}
export default EventEditPage;