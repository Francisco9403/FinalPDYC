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
         // Podrías llamar a logout() aquí si un error inesperado lo requiere
       } finally {
         if (isMounted) setLoading(false);
       }
     };
     fetchPublicEvents();
     return () => { isMounted = false; };
   }, []); // Se ejecuta solo una vez

   const handleFollowClick = async (e, eventId, eventName) => {
    e.stopPropagation();
    if (!token) {
      onRequireLogin();
      return; // Se detiene la ejecución si no hay token
    }
    try {
      const url = `/api/user/me/favoritos/${eventId}`; 
      await api.post(url); 

      // si necesitamos la respuesta
      // const response = await api.post(url);      
      alert(`¡El evento "${eventName}" fue agregado a tus favoritos!`); // Ver logica de exito (tal vez sacar el boton de seguir a ese artista)
    
    } catch (err) {
        console.error(`Error al agregar a evento favorito a ${eventId}:`, err);
        // Manejo de error 409 (Conflict) si el evento ya es favorito
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
           {eventos.map((evento) => (
              <li // El <li> maneja la navegación a detalles
                  key={evento.id} 
                  onClick={() => onNavigate('eventDetails', evento.id)} 
                  style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}>
                  <span>
                    <span style={{fontWeight: 'bold'}}> {evento.nombre} </span>
                    {' '} - {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'Fecha no disponible'}
                  </span>
                  <button 
                      // Pasamos el objeto del evento del navegador (e) para detener la propagación
                      onClick={(e) => handleFollowClick(e, evento.id, evento.nombre)} 
                      style={{marginLeft: '15px', padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer'}}
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