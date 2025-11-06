import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Usa la instancia de Axios
import { useAuth } from '../AuthContext'; // Para logout en caso de error

function ArtistEditPage({ artistId, onNavigate }) {
  const { logout } = useAuth();

  // --- Estados para los datos del artista
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState('');
  const [email, setEmail] = useState('');     //agrego esto para Email
  const [active, setActive] = useState(true);

  // Estados para carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Fetch de Datos del Artista ---
  const fetchArtistData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos el endpoint público (asumiendo que devuelve todos los campos)
      const response = await api.get(`/api/artist/public/${artistId}`);
      const artistData = response.data;
      if (artistData) {
        setNombre(artistData.nombre || '');
        setGenero(artistData.genero || ''); // Campo 'genero'
        setEmail(artistData.email || '');               // artistData.active == 1 // Si es 1 (activo), devuelve true, sino (si es 0), devuelve false.
        setActive(artistData.active === undefined ? true : artistData.active == 1); //si el campo "active" esta indefinido, se setea en true,
      } else {                                                                // si si esta definido, se setea con el valor que ya trae
        setError("No se encontraron datos para este artista.");
      }
    } catch (err) {
      console.error(`Error fetching artist ${artistId}:`, err);
      setError("Error al cargar los datos del artista.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [artistId, logout]);

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  // --- Función para Manejar la Actualización ---
  const handleUpdate = async (event) => {
    event.preventDefault();
    // Validación de campos requeridos
    if (nombre.trim() === '' || genero.trim() === '' || email.trim() === '') {
      alert('Nombre, Género y Email son requeridos.');
      return;
    }
    // Validación formato email
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert("Por favor, ingresa un email válido.");
        return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updatedArtistData = {
        nombre: nombre,
        genero: genero,
        email: email, 
        active: active, // Campo 'active' //(active ? 1 : 0) probar con esto
      };
      
      console.log("estado active? : "+updatedArtistData.active);  
      // Llamada PUT al endpoint protegido
      const response = await api.put(`/api/artist/${artistId}`, updatedArtistData);

      alert(`Artista "${response.data.nombre || nombre}" actualizado con éxito.`);
      onNavigate('admin'); // Volver a la lista

    } catch (err) {
      console.error(`Error updating artist ${artistId}:`, err);
      // Mostrar error específico si el backend lo devuelve
      setError(`Error al actualizar: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Renderizado ---
  if (loading) return <div className="page-container"><p>Cargando datos del artista...</p></div>;

  return (
    <div className="page-container">
      <nav>
        <button onClick={() => onNavigate('admin')}>Volver al Panel Admin</button>
      </nav>
      <h1>Editar Artista (ID: {artistId})</h1>

      {error && <p className="error" style={{textAlign: 'center'}}>{error}</p>}

      <form onSubmit={handleUpdate} className="edit-form section">
        <div className="form-group">
          <label htmlFor="nombreArtista">Nombre:</label>
          <input
            id="nombreArtista" type="text" value={nombre}
            onChange={(e) => setNombre(e.target.value)} required className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="generoArtista">Género:</label>
          <input
            id="generoArtista" type="text" value={genero}
            onChange={(e) => setGenero(e.target.value)} required placeholder="Ej: Rock, Pop..." className="input-field" // Añadido required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emailArtista">Email:</label>
          <input
            id="emailArtista" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required placeholder="contactoArtista@gmail.com" className="input-field"
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="activeArtista">Activo:</label>
          <input
            id="activeArtista" type="checkbox" checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </div>

        <button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
export default ArtistEditPage;

