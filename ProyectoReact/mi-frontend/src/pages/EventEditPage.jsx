import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Usa la instancia de Axios
import { useAuth } from '../AuthContext'; // Para logout en caso de error

function EventEditPage({ eventId, onNavigate }) {
  const { logout } = useAuth();

  // Estado para los datos del evento
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para la nueva fecha (reprogramación)
  const [newDate, setNewDate] = useState('');
  const [isUpdatingState, setIsUpdatingState] = useState(false); // Loading para cambios de estado

  // --- Fetch de Datos del Evento (RUTA CORREGIDA) ---
  const fetchEventData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEvento(null); // Limpia datos previos
    try {
      // --- CORRECCIÓN AQUÍ: Quitamos /search ---
      const response = await api.get(`/api/event/${eventId}`);
      // --------------------------------------
      const eventData = response.data;
      if (eventData) {
        setEvento(eventData);
        // Pre-rellena el input de fecha si ya hay una
        if (eventData.startDate) {
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
    fetchEventData(); // Llama al fetch al montar o si eventId cambia
  }, [fetchEventData]); // Depende de la función memoizada

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
      // Validar que la fecha sea válida (opcional pero recomendado)
      if (isNaN(new Date(newDate).getTime())) {
          alert("Fecha inválida.");
          return;
      }
      if (!window.confirm(`¿Seguro de reprogramar "${evento.nombre}" para ${new Date(newDate).toLocaleDateString()}?`)) return;
      setIsUpdatingState(true); setError(null);
      try {
          // Enviamos la nueva fecha como JSON string
          const response = await api.put(`/api/event/${eventId}/rescheduled`, `"${newDate}"` , {
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

  // --- Renderizado ---
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

            {/* --- Acciones de Cambio de Estado --- */}
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
            <h3>Gestionar Artistas:</h3>
            <p>(Funcionalidad pendiente)</p>

        </div>
      ) : (
        // Mensaje si no se cargó el evento y no hay error de carga
        !error && <p>No se pudo cargar la información del evento.</p>
      )}
    </div>
  );
}
export default EventEditPage;
