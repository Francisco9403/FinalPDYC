import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

function EventDetailsPage({ eventId, onBack, onRequireLogin }) {
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth(); // Usamos token y logout

  useEffect(() => {
    if (!eventId) { setLoading(false); setError("ID de evento no válido."); return; }
    let isMounted = true;
    setLoading(true); setError(null); setEvento(null);
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/api/public/evento/${eventId}`);
        if (isMounted) {
          if (response.data?.state === "TENTATIVE") {
            setError("Información preliminar — acceso restringido.");
          } else {
            setEvento(response.data);
          }
        }
      } catch (err) {
        console.error(`Error detalles evento ${eventId}:`, err);
        if (isMounted) {
          if (err.response && err.response.status === 403) { setError("Acceso restringido (evento tentativo o no encontrado)."); }
          else { setError("Error al cargar detalles."); }
        }
      } finally { if (isMounted) setLoading(false); }
    };
    fetchDetails();
    return () => { isMounted = false; };
  }, [eventId]); // Solo depende de eventId

  const handleFavoriteClick = () => {
    if (!token) { onRequireLogin(); }
    else {
      alert(`Funcionalidad 'Favorito' evento ${eventId} pendiente.`);
      // TODO: Implementar POST /api/user/me/favoritos/{id}
    }
  };

  return (
    <div className="page-container">
      <nav><button onClick={onBack}>Volver</button></nav>
      {loading && <p>Cargando detalles...</p>}
      {error && <p className="error">{error}</p>}
      {evento && (
        <div className="section event-details">
          <h2>{evento.nombre || 'Detalles del Evento'}</h2>
          <p><strong>Estado:</strong> {evento.state || 'N/A'}</p>
          <p><strong>Fecha:</strong> {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Descripción:</strong> {evento.descripcion || 'N/A'}</p>
          {evento.artistIds?.length > 0 && (<p><strong>Artistas (IDs):</strong> {evento.artistIds.join(', ')}</p>)}
          <button onClick={handleFavoriteClick}>Marcar Favorito</button>
        </div>
      )}
      {/* Mensaje si no hay evento o hubo error */}
      {!loading && !evento && <p>{error ? error : 'No se encontraron detalles.'}</p>}
    </div>
  );
}
export default EventDetailsPage;


