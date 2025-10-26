import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext'; // Importa useAuth si necesitas logout

function HomePage({ onNavigate }) {
   const [eventos, setEventos] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   // const { logout } = useAuth(); // Descomenta si necesitas logout en caso de error

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
             <li key={evento.id} onClick={() => onNavigate('eventDetails', evento.id)} style={{cursor: 'pointer'}}>
               {evento.nombre} - {evento.startDate ? new Date(evento.startDate).toLocaleDateString() : 'Fecha no disponible'}
             </li>
           ))}
         </ul>
       </div>
     </div>
   );
}
export default HomePage;