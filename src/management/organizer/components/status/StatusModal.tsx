import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import { useStatusStore } from "../../../../hooks";
import { StatusDTO } from "../../../../management";

interface StatusModalProps {
  isOpen: boolean;
  closeModal: () => void;
  boardId: number;
  statuses: StatusDTO[] | undefined;
  statusToEdit: StatusDTO | null;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  closeModal,
  boardId,
  statuses = [],
  statusToEdit,
}) => {
  const [statusName, setStatusName] = useState("");
  const [editingStatus, setEditingStatus] = useState<StatusDTO | null>(null);

  const { createStatus, modifyStatus, removeStatus, loadStatuses } = useStatusStore();

  useEffect(() => {
    if (statusToEdit) {
      setEditingStatus(statusToEdit);
      setStatusName(statusToEdit.name);
    } else {
      resetForm();
    }
  }, [statusToEdit]);

  const handleCreateStatus = useCallback(async () => {
    const newStatus: StatusDTO = { name: statusName, boardId };
    await createStatus(newStatus);
    await loadStatuses(boardId);
    resetModal();
  }, [statusName, boardId, createStatus, loadStatuses]);

  const handleModifyStatus = useCallback(async () => {
    if (!editingStatus) return;
    const updatedStatus: StatusDTO = { ...editingStatus, name: statusName };
    await modifyStatus(updatedStatus);
    await loadStatuses(boardId);
    resetModal();
  }, [statusName, editingStatus, modifyStatus, loadStatuses, boardId]);

  const handleRemoveStatus = useCallback(async (statusId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este estado será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      await removeStatus(statusId);
      if (editingStatus?.id === statusId) {
        resetForm();
      }
      await loadStatuses(boardId);
    }
  }, [removeStatus, loadStatuses, editingStatus, boardId]);

  const handleEditClick = (status: StatusDTO) => {
    if (editingStatus?.id === status.id) {
      resetForm();
    } else {
      setEditingStatus(status);
      setStatusName(status.name);
    }
  };

  const resetForm = () => {
    setEditingStatus(null);
    setStatusName("");
  };

  const resetModal = () => {
    resetForm();
    closeModal();
  };

  const isSaveButtonDisabled = !editingStatus || editingStatus.name === statusName;
  const isCreateButtonDisabled = !statusName;

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: "block" }} tabIndex={-1} aria-labelledby="statusModal">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="statusModal">
              {editingStatus ? "Editar Estado" : "Nuevo Estado"}
            </h5>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={resetModal}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="statusName" className="form-label">Nombre del Estado</label>
              <input
                type="text"
                className="form-control"
                id="statusName"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                placeholder="Introduce el nombre del estado"
              />
            </div>

            <div>
              <h5>Estados actuales:</h5>
              {statuses?.length ? (
                statuses.map((status) => (
                  <div key={status.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{status.name}</span>
                      <div>
                        <button
                          className={`btn me-2 ${editingStatus?.id === status.id ? "btn-info" : "btn-warning"}`}
                          onClick={() => handleEditClick(status)}
                        >
                          {editingStatus?.id === status.id ? "Editando" : "Editar"}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveStatus(status.id ?? 0)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay estados disponibles.</p>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={resetModal}>
              Cerrar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={editingStatus ? handleModifyStatus : handleCreateStatus}
              disabled={editingStatus ? isSaveButtonDisabled : isCreateButtonDisabled}
            >
              {editingStatus ? "Guardar Cambios" : "Crear Estado"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
