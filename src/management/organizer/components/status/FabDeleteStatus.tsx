import Swal from 'sweetalert2';
import { useStatusStore } from '../../../../hooks/useStatusStore'; // Asegúrate de importar el hook de useStatusStore
import { StatusDTO } from '../../types/StatusDTO';

interface FabEditStatusProps {
  status: StatusDTO | null; // Puede ser nulo si estamos en modo de creación
  onEdit: () => void; // Función para abrir el modal de edición
}

export const FabEditStatus: React.FC<FabEditStatusProps> = ({ status, onEdit }) => {
  return (
    <button
      className="btn btn-primary fab-edit"
      onClick={onEdit} // Llamamos a la función que abre el modal
      style={{ display: status ? '' : 'none' }} // Solo mostrar si hay estado
    >
      <i className="fas fa-edit" /> Editar
    </button>
  );
};
