import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Usa la instancia de Axios
import { useAuth } from '../AuthContext'; // Para logout en caso de error

function ArtistEditPage({ artistId, onNavigate }) {
  const { logout } = useAuth();

  // Estados para los datos del artista
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState(''); // Estado para 'genero'
  const [active, setActive] = useState(true); // Estado para 'active'

  // Estados para carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Fetch de Datos del Artista (CORREGIDO) ---
  const fetchArtistData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos el endpoint público
      const response = await api.get(`/api/artist/public/${artistId}`);
      const artistData = response.data;
      if (artistData) {
        setNombre(artistData.nombre || '');
        // --- CORRECCIÓN AQUÍ: Leer 'genero' ---
        setGenero(artistData.genero || ''); // Usar el nombre de campo correcto de tu DTO/BD
        // ------------------------------------
        setActive(artistData.active === undefined ? true : artistData.active);
      } else {
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

  // --- Función para Manejar la Actualización (CORREGIDO) ---
  const handleUpdate = async (event) => {
    event.preventDefault();
    if (nombre.trim() === '') {
      alert('El nombre es requerido.');
      return;
    }
    setIsUpdating(true);
    setError(null);

    try {
      // Objeto con los datos actualizados
      const updatedArtistData = {
        nombre: nombre,
        // --- CORRECCIÓN AQUÍ: Enviar 'genero' ---
        genero: genero, // Usar el nombre de campo correcto que espera tu backend
        // -------------------------------------
        active: active,
      };

      // Llamada PUT al endpoint protegido
      const response = await api.put(`/api/artist/${artistId}`, updatedArtistData);

      alert(`Artista "${response.data.nombre || nombre}" actualizado con éxito.`);
      onNavigate('admin'); // Volver a la lista

    } catch (err) {
      console.error(`Error updating artist ${artistId}:`, err);
      setError(`Error al actualizar: ${err.response?.data?.message || err.message}`);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Renderizado (sin cambios estructurales) ---
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
            onChange={(e) => setGenero(e.target.value)} placeholder="Ej: Rock, Pop..." className="input-field"
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

