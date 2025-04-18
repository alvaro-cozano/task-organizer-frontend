import { useEffect, useState } from 'react';
import { StatusDTO } from '../../types/StatusDTO';

interface StatusModalProps {
  isOpen: boolean;
  closeModal: () => void;
  boardId: number;
  status?: StatusDTO | null; // Prop para pasar un estado existente para editar
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, closeModal, boardId, status }) => {
  const [statusName, setStatusName] = useState('');

  // Si es un estado existente, lo cargamos en el formulario para editar
  useEffect(() => {
    if (status) {
      setStatusName(status.name);
    } else {
      setStatusName(''); // Si no hay estado, es para crear uno nuevo
    }
  }, [status]);

  const handleSaveStatus = () => {
    if (statusName.trim()) {
      if (status) {
        // Aquí iría la lógica para editar el estado existente
        console.log(`Editar estado con ID ${status.id}: ${statusName}`);
      } else {
        // Aquí iría la lógica para crear un nuevo estado
        console.log(`Crear estado en el tablero ${boardId} con el nombre: ${statusName}`);
      }
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" tabIndex={-1} style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{status ? 'Editar Estado' : 'Crear Estado'}</h5>
            <button type="button" className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="statusName" className="form-label">Nombre del Estado</label>
              <input
                type="text"
                id="statusName"
                className="form-control"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveStatus}>
              {status ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
