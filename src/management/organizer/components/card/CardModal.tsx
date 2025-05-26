declare global {
  interface Window {
    cardsByStatusRef?: {
      [statusId: number]: Array<{ position: number } & Record<string, any>>;
    };
    gridRefs?: {
      [statusId: number]: any;
    };
  }
}

import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { addHours } from 'date-fns';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

import { CardDTO, StatusDTO, ChecklistItemDTO, LabelDTO, UserDTO, ChecklistSubItemDTO } from '../../../../management';
import { useCardStore, useChecklistItemStore, useLabelStore, useAuthStore, useChecklistSubItemStore, useProfileStore } from '../../../../hooks';

import "react-datepicker/dist/react-datepicker.css";
import '../../style/CardModal.css';

interface CardModalProps {
  isOpen: boolean;
  closeModal: () => void;
  card: CardDTO | null;
  statuses: StatusDTO[] | null;
  checklistItems: ChecklistItemDTO[] | null;
  forceRender: () => void;
}

function getProgress(card: CardDTO): number {
  if (card.finished) return 100;

  const checklist = card.checklistItems;
  if (!checklist || checklist.length === 0) {
    return 0;
  }

  let total = checklist.length;
  let completed = 0;

  checklist.forEach(item => {
    if (item.completed) {
      completed += 1;
    } else if (item.subItems && item.subItems.length > 0) {
      const subCompleted = item.subItems.filter(sub => sub.done).length;
      completed += subCompleted / item.subItems.length;
    }
  });

  return Math.round((completed / total) * 100);
}

const DatePickerPortal = ({ children }: { children: React.ReactNode }) => {
  const el = document.getElementById('datepicker-portal');
  if (!el) {
    const newEl = document.createElement('div');
    newEl.id = 'datepicker-portal';
    document.body.appendChild(newEl);
    return ReactDOM.createPortal(children, newEl);
  }
  return ReactDOM.createPortal(children, el);
};

const CardModal: React.FC<CardModalProps> = ({ isOpen, closeModal, card, statuses, forceRender }) => {
  const { boardId } = useParams<{ boardId: string }>();

  const swalDarkModal = Swal.mixin({
    customClass: {
      popup: 'cardpage-swal-popup',
      title: 'cardpage-swal-title',
      htmlContainer: 'cardpage-swal-html-container',
      confirmButton: 'cardpage-swal-confirm-button',
      cancelButton: 'cardpage-swal-cancel-button',
      input: 'cardpage-swal-input',
    },
    background: '#2a2a2a',
    color: '#f0f0f0',
  });

  const [formData, setFormData] = useState<CardDTO>({
    id: 0,
    cardTitle: '',
    description: '',
    startDate: new Date(),
    endDate: addHours(new Date(), 2),
    priority: 1,
    position: 0,
    board_id: parseInt(boardId || '0', 10),
    attachedLinks: "",
    status_id: 1,
    prev_status_id: 0,
    users: [] as UserDTO[],
    finished: false,
  });

  const [labelPendingDelete, setLabelPendingDelete] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [newLabelTitle, setNewLabelTitle] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#2196f3');
  const [editingAssignedLabel, setEditingAssignedLabel] = useState(false);
  const [editAssignedLabelTitle, setEditAssignedLabelTitle] = useState('');
  const [editAssignedLabelColor, setEditAssignedLabelColor] = useState('#2196f3');

  const {
    startSavingCard,
    startDeletingCard,
    startLoadingCardsByBoardAndStatus,
    cardsByStatus,
  } = useCardStore();

  const { startSavingChecklistItem } = useChecklistItemStore();
  const { getLabelsByBoard, startLoadingLabelsByBoard, startSavingLabel } = useLabelStore();
  const { user: currentUser } = useAuthStore();
  const { startLoadingProfile } = useProfileStore();

  const [labels, setLabels] = useState<LabelDTO[]>([]);
  const { startSavingSubItem, startDeletingSubItem } = useChecklistSubItemStore();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [editingSubItem, setEditingSubItem] = useState<{ checklistId: number; subItemId: number } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const activeColor = formData.label?.color || '#044C7E';

  const labelLoadInitiatedForBoardRef = React.useRef<string | null>(null);

  useEffect(() => {
    const currentBoardId = boardId || '0';
    const boardNum = parseInt(currentBoardId, 10);

    if (showLabelModal && boardNum > 0) {
      if (labelLoadInitiatedForBoardRef.current !== currentBoardId) {
        startLoadingLabelsByBoard(boardNum);
        labelLoadInitiatedForBoardRef.current = currentBoardId;
      }
    } else if (!showLabelModal) {
      labelLoadInitiatedForBoardRef.current = null;
    }
  }, [showLabelModal, boardId, startLoadingLabelsByBoard]);

  useEffect(() => {
    if (!showLabelModal) {
      return;
    }
    const boardNum = parseInt(boardId || '0', 10);
    if (!boardNum || boardNum <= 0) {
        return;
    }
    setLabels(getLabelsByBoard(boardNum));
  }, [showLabelModal, boardId, getLabelsByBoard]);

  useEffect(() => {
    if (card) {
      setFormData(card);
    }
  }, [card]);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formData.id && (name === "cardTitle" || name === "description")) {
      await startSavingCard({ ...formData, [name]: value });
      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    }
  }, [formData, startSavingCard, startLoadingCardsByBoardAndStatus]);

  const handleDateChange = useCallback(async (date: Date | null, name: string) => {
    const newDate = date || new Date();
    setFormData(prev => ({ ...prev, [name]: newDate }));
    if (formData.id) {
      await startSavingCard({ ...formData, [name]: newDate });
      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    }
  }, [formData, startSavingCard, startLoadingCardsByBoardAndStatus]);

  const handleFinishedChange = useCallback(async () => {
    setFormData(prev => ({ ...prev, finished: !prev.finished }));
    if (formData.id) {
      await startSavingCard({ ...formData, finished: !formData.finished });
      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    }
  }, [formData, startSavingCard, startLoadingCardsByBoardAndStatus]);

  const handleChecklistSubItemChange = async (item: ChecklistItemDTO, subItem: ChecklistSubItemDTO) => {
    const newDone = !subItem.done;

    const updatedChecklistItems = formData.checklistItems?.map(ci =>
      ci.id === item.id
        ? {
            ...ci,
            subItems: ci.subItems?.map(si =>
              si.id === subItem.id ? { ...si, done: newDone } : si
            )
          }
        : ci
    ) || [];

    const updatedItem = updatedChecklistItems.find(ci => ci.id === item.id);
    const allSubDone = updatedItem?.subItems?.length
      ? updatedItem.subItems.every(si => si.done)
      : false;

    setFormData(prev => ({
      ...prev,
      checklistItems: updatedChecklistItems.map(ci =>
        ci.id === item.id
          ? { ...ci, completed: allSubDone }
          : ci
      )
    }));

    await startSavingSubItem(item.id!, { ...subItem, done: newDone });

    if (typeof item.id === "number" && allSubDone !== item.completed) {
      await startSavingChecklistItem(item.cardId, { ...item, completed: allSubDone });
    }

    const allSubItemsDone = updatedChecklistItems.every(ci =>
      ci.subItems && ci.subItems.length > 0
        ? ci.subItems.every(si => si.done)
        : ci.completed
    );

    if (allSubItemsDone && !formData.finished) {
      setFormData(prev => ({ ...prev, finished: true }));
      if (formData.id) {
        await startSavingCard({ ...formData, finished: true });
      }
    }
    if (formData.finished && !allSubItemsDone) {
      setFormData(prev => ({ ...prev, finished: false }));
      if (formData.id) {
        await startSavingCard({ ...formData, finished: false });
      }
    }

    await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
  };

  const handleChecklistCompletedChange = async (item: ChecklistItemDTO) => {
    const newCompleted = !item.completed;

    const updatedChecklistItems = formData.checklistItems?.map(ci =>
      ci.id === item.id
        ? {
            ...ci,
            completed: newCompleted,
            subItems: ci.subItems?.map(si => ({ ...si, done: newCompleted }))
          }
        : ci
    ) || [];

    setFormData(prev => ({
      ...prev,
      checklistItems: updatedChecklistItems
    }));

    await startSavingChecklistItem(item.cardId, { ...item, completed: newCompleted });

    if (item.subItems && item.subItems.length > 0) {
      for (const si of item.subItems) {
        if (si.done !== newCompleted) {
          await startSavingSubItem(item.id!, { ...si, done: newCompleted });
        }
      }
    }

    const allChecklistCompleted = updatedChecklistItems.every(ci => ci.completed);
    if (allChecklistCompleted && !formData.finished) {
      setFormData(prev => ({ ...prev, finished: true }));
      if (formData.id) {
        await startSavingCard({ ...formData, finished: true });
      }
    }
    if (formData.finished && !allChecklistCompleted) {
      setFormData(prev => ({ ...prev, finished: false }));
      if (formData.id) {
        await startSavingCard({ ...formData, finished: false });
      }
    }

    await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
  };

  const handlePriorityChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setFormData(prev => ({ ...prev, priority: value }));
    if (formData.id) {
      await startSavingCard({ ...formData, priority: value });
      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    }
  }, [formData, startSavingCard, startLoadingCardsByBoardAndStatus]);

  const handleDelete = useCallback(async () => {
    if (card?.id) {
      const result = await Swal.fire({
        title: '¿Eliminar tarjeta?',
        text: `¿Seguro que quieres eliminar la tarjeta "${card.cardTitle}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        if (window.gridRefs && window.gridRefs[card.status_id]) {
        const grid = window.gridRefs[card.status_id];
        const el = document.querySelector(`.cardpage-grid-item[data-id="${card.id}"]`);
        if (el) {
          grid.removeWidget(el, false);
        }
      }

        await startDeletingCard(card.id, card.board_id, card.status_id);
        await startLoadingCardsByBoardAndStatus(card.board_id, card.status_id);
        closeModal();
        Swal.fire('Eliminada', 'La tarjeta ha sido eliminada.', 'success');
      }
    }
  }, [card, startDeletingCard, startLoadingCardsByBoardAndStatus, closeModal]);

  const handleAddChecklist = async () => {
    const { value: title } = await swalDarkModal.fire({
      title: 'Crear Nuevo Checklist',
      input: 'text',
      inputPlaceholder: 'Nombre del nuevo checklist',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡El nombre no puede estar vacío!';
        }
      }
    });

    if (!title || !title.trim() || !formData.id) return;
    const newItem: ChecklistItemDTO = {
      id: 0,
      title,
      completed: false,
      cardId: formData.id,
      subItems: []
    };

    const { id, ...itemToSend } = newItem;
    const saved = await startSavingChecklistItem(formData.id, itemToSend as Omit<ChecklistItemDTO, 'id'>);
    setFormData(prev => ({
      ...prev,
      checklistItems: [...(prev.checklistItems || []), saved]
    }));
  };

  const handleDeleteChecklist = async (item: ChecklistItemDTO) => {
    if (!item.id) return;
    const result = await swalDarkModal.fire({
      title: '¿Eliminar checklist?',
      text: `¿Seguro que quieres eliminar el checklist "${item.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setFormData(prev => ({
        ...prev,
        checklistItems: prev.checklistItems?.filter(ci => ci.id !== item.id)
      }));
      Swal.fire('Eliminado', 'El checklist ha sido eliminado (del frontend).', 'success');
    }
  };

  const handleAddSubItem = async (item: ChecklistItemDTO) => {
    const { value: content } = await swalDarkModal.fire({
      title: 'Crear Nuevo Subelemento',
      input: 'text',
      inputPlaceholder: 'Contenido del nuevo subelemento',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡El contenido no puede estar vacío!';
        }
      }
    });

    if (!content || !content.trim() || !item.id) return;
    const newSubItem: ChecklistSubItemDTO = {
      id: 0,
      content,
      done: false,
      checklistItemId: item.id
    };
    const saved = await startSavingSubItem(item.id, newSubItem);
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems?.map(ci =>
        ci.id === item.id
          ? { ...ci, subItems: [...(ci.subItems || []), saved] }
          : ci
      )
    }));
  };

  const handleChecklistEditSave = async (item: ChecklistItemDTO) => {
    setEditingChecklistId(null);
    if (editValue.trim() && item.title !== editValue.trim()) {
      await startSavingChecklistItem(item.cardId, { ...item, title: editValue.trim() });
      setFormData(prev => ({
        ...prev,
        checklistItems: prev.checklistItems?.map(ci =>
          ci.id === item.id ? { ...ci, title: editValue.trim() } : ci
        )
      }));
      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    }
  };

  const handleSubItemEditSave = async (item: ChecklistItemDTO, subItem: ChecklistSubItemDTO) => {
    setEditingSubItem(null);
    if (editValue.trim() && subItem.content !== editValue.trim()) {
      await startSavingSubItem(item.id!, { ...subItem, content: editValue.trim() });
      setFormData(prev => ({
        ...prev,
        checklistItems: prev.checklistItems?.map(ci =>
          ci.id === item.id
            ? {
                ...ci,
                subItems: ci.subItems?.map(si =>
                  si.id === subItem.id ? { ...si, content: editValue.trim() } : si
                )
              }
            : ci
        )
      }));
      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    }
  };

  const handleAssignedLabelEditSave = async () => {
    if (!formData.label) return;
    const updatedLabel = {
      ...formData.label,
      title: editAssignedLabelTitle.trim(),
      color: editAssignedLabelColor
    };
    await startSavingLabel(updatedLabel);
    setFormData(prev => ({
      ...prev,
      label: updatedLabel
    }));
    setLabels(prev => prev.map(l => l.id === updatedLabel.id ? updatedLabel : l));
    setEditingAssignedLabel(false);

    if (statuses && statuses.length > 0) {
      await Promise.all(
        statuses
          .filter(s => typeof s.id === "number")
          .map(s =>
            startLoadingCardsByBoardAndStatus(formData.board_id, s.id as number)
          )
      );
    }
    forceRender();
  };

  const isMember = !!currentUser && formData.users?.some(u => u.email === currentUser.email);

  const handleJoin = async () => {
  if (!currentUser) return;
  const loadedProfile = await startLoadingProfile();

  const normalizedUser: UserDTO = {
    ...currentUser,
    profileImageBase64:
      loadedProfile?.profileImageBase64 && loadedProfile.profileImageBase64.trim() !== ""
        ? loadedProfile.profileImageBase64
        : ""
  };
  const updatedUsers = [
    ...(formData.users || []),
    normalizedUser
  ];
  setFormData(prev => ({
    ...prev,
    users: updatedUsers
  }));
  await startSavingCard({ ...formData, users: updatedUsers });
  await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
  forceRender();
};

  const handleLeave = async () => {
    if (!currentUser) return;
    const updatedUsers = (formData.users || []).filter(u => u.email !== currentUser.email);
    setFormData(prev => ({
      ...prev,
      users: updatedUsers
    }));
    await startSavingCard({ ...formData, users: updatedUsers });
    await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
    forceRender();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Card Modal"
      overlayClassName="card-modal-overlay"
      className="custom-card-modal"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={closeModal}
        className="card-modal-close-btn"
      >
        &times;
      </button>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-8 order-lg-1 order-1">
            <div className="d-flex align-items-center">
              <input
                className="form-check-input me-2"
                type="checkbox"
                checked={formData.finished}
                onChange={handleFinishedChange}
                id="finishedCheck"
                style={formData.finished ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
              />
              {editingChecklistId === -1 ? (
                <input
                  type="text"
                  name="cardTitle"
                  value={editValue}
                  autoFocus
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={async () => {
                    setEditingChecklistId(null);
                    if (editValue.trim() && formData.cardTitle !== editValue.trim()) {
                      setFormData(prev => ({ ...prev, cardTitle: editValue.trim() }));
                      await startSavingCard({ ...formData, cardTitle: editValue.trim() });
                      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                    }
                  }}
                  onKeyDown={async e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setEditingChecklistId(null);
                      if (editValue.trim() && formData.cardTitle !== editValue.trim()) {
                        setFormData(prev => ({ ...prev, cardTitle: editValue.trim() }));
                        await startSavingCard({ ...formData, cardTitle: editValue.trim() });
                        await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                      }
                    }
                    if (e.key === "Escape") {
                      setEditingChecklistId(null);
                    }
                  }}
                  className="form-control-plaintext card-modal-title-input"
                />
              ) : (
                <span
                  className="ms-2 card-modal-title-span"
                  onDoubleClick={() => {
                    setEditingChecklistId(-1);
                    setEditValue(formData.cardTitle);
                  }}
                  tabIndex={0}
                >
                  {formData.cardTitle || <span className="card-modal-title-placeholder">Sin título</span>}
                </span>
              )}
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <span className="badge bg-secondary">
                Estado: {statuses?.find(s => s.id === formData.status_id)?.name || 'Desconocida'}
              </span>
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label members-area-label">Miembros</label>
                <ul className="pm-user-list">
                  {formData.users?.slice(0, 3).map((user, index) => (
                    <li key={index} className="pm-user-item">
                      {user.profileImageBase64 && user.profileImageBase64.trim() !== "" ? (
                        <img
                          className="pm-user-avatar"
                          src={`data:image/jpeg;base64,${user.profileImageBase64}`}
                          alt={user.email}
                        />
                      ) : (
                        <img
                          className="pm-user-avatar"
                          src={`https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&background=random&color=fff`}
                          alt={user.email}
                        />
                      )}
                    </li>
                  ))}
                  {formData.users && formData.users.length > 3 && (
                    <li className="pm-more-users">+{formData.users.length - 3}</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label">Prioridad</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handlePriorityChange}
                  className="form-select"
                >
                  <option value={1}>Alta</option>
                  <option value={2}>Media</option>
                  <option value={3}>Baja</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Etiqueta</label>
                <div className="d-flex flex-wrap gap-2">
                  {formData.label && !labelPendingDelete ? (
                    editingAssignedLabel ? (
                      <div
                        className="card-label-edit"
                        style={{
                          backgroundColor: editAssignedLabelColor
                        }}
                      >
                        <input
                          type="text"
                          value={editAssignedLabelTitle}
                          onChange={e => setEditAssignedLabelTitle(e.target.value)}
                          className="card-label-edit-title-input"
                          autoFocus
                          onKeyDown={async e => {
                            if (e.key === "Enter") {
                              await handleAssignedLabelEditSave();
                            }
                            if (e.key === "Escape") {
                              setEditingAssignedLabel(false);
                            }
                          }}
                        />
                        <input
                          type="color"
                          value={editAssignedLabelColor}
                          onChange={e => setEditAssignedLabelColor(e.target.value)}
                          className="card-label-edit-color-input"
                        />
                        <button className="btn btn-sm btn-success btn-save-label" onClick={async () => await handleAssignedLabelEditSave()} type="button">
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <div
                        className="card-label"
                        key={formData.label?.id}
                        style={{
                          backgroundColor: formData.label?.color
                        }}
                        onDoubleClick={() => {
                          if (!formData.label) return;
                          setEditingAssignedLabel(true);
                          setEditAssignedLabelTitle(formData.label.title);
                          setEditAssignedLabelColor(formData.label.color);
                        }}
                        title="Doble click para editar"
                      >
                        {formData.label?.title}
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Fecha de inicio</label>
                <DatePicker
                  selected={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(date: Date | null) => handleDateChange(date, 'startDate')}
                  dateFormat="yyyy-MM-dd HH:mm"
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Hora"
                  required
                  className="form-control"
                  maxDate={formData.endDate ? new Date(formData.endDate) : undefined}
                  minTime={new Date(0, 0, 0, 0, 0)}
                  maxTime={formData.endDate && formData.startDate && new Date(formData.startDate).toDateString() === new Date(formData.endDate).toDateString()
                    ? new Date(formData.endDate)
                    : new Date(0, 0, 0, 23, 59)}
                  popperContainer={DatePickerPortal}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha de fin</label>
                <DatePicker
                  selected={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(date: Date | null) => handleDateChange(date, 'endDate')}
                  dateFormat="yyyy-MM-dd HH:mm"
                  showTimeSelect
                  timeIntervals={15}
                  timeCaption="Hora"
                  required
                  className="form-control"
                  minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                  minTime={formData.endDate && formData.startDate &&
                    new Date(formData.endDate).toDateString() === new Date(formData.startDate).toDateString()
                      ? new Date(formData.startDate)
                      : new Date(0, 0, 0, 0, 0)}
                  maxTime={new Date(0, 0, 0, 23, 59)}
                  popperContainer={DatePickerPortal}
                />
              </div>
            </div>
          </div>

          <div className="col-12 order-lg-3 order-3 mt-4">
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Descripción</label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control card-modal-description"
                placeholder="Añade una descripción más detallada..."
              />
            </div>

            {formData.attachedLinks && (
              <div className="mb-3">
                <label className="form-label">Enlace adjunto</label>
                <div>
                  <a
                    href={formData.attachedLinks}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-modal-link"
                  >
                    {formData.attachedLinks}
                  </a>
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Progreso</label>
              <div className="progress card-modal-progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${getProgress(formData)}%`,
                    backgroundColor: activeColor
                  }}
                  aria-valuenow={getProgress(formData)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {getProgress(formData)}%
                </div>
              </div>
            </div>

            {formData.checklistItems?.map((item, i) => (
              <div key={i} className="card mb-2">
                <div className="card-body d-flex align-items-start justify-content-between">
                  <div className="card-modal-checklist-main">
                    <div className="form-check mb-2 d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.completed}
                        onChange={() => handleChecklistCompletedChange(item)}
                        style={item.completed ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
                      />
                      {editingChecklistId === item.id ? (
                        <input
                          type="text"
                          className="form-control form-control-sm ms-2 card-modal-checklist-title-input"
                          value={editValue}
                          autoFocus
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleChecklistEditSave(item)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleChecklistEditSave(item);
                            }
                            if (e.key === "Escape") {
                              setEditingChecklistId(null);
                            }
                          }}
                        />
                      ) : (
                        <span
                          className="form-check-label ms-2 card-modal-checklist-title-span"
                          onDoubleClick={() => {
                            setEditingChecklistId(item.id ?? null);
                            setEditValue(item.title);
                          }}
                          tabIndex={0}
                          title="Doble click para editar"
                          style={{
                            textDecoration: item.completed ? "line-through" : "none",
                            color: item.completed ? "#888" : undefined
                          }}
                        >
                          {item.title}
                        </span>
                      )}
                    </div>
                    {item.subItems?.map((subItem, j) => (
                      <div
                        key={j}
                        className="form-check ms-4 position-relative checklist-subitem-row card-modal-subitem-row"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={subItem.done}
                          onChange={() => handleChecklistSubItemChange(item, subItem)}
                          style={subItem.done ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
                        />
                        {editingSubItem && editingSubItem.checklistId === item.id && editingSubItem.subItemId === subItem.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm ms-2 card-modal-subitem-input"
                            value={editValue}
                            autoFocus
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleSubItemEditSave(item, subItem)}
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSubItemEditSave(item, subItem);
                              }
                              if (e.key === "Escape") {
                                setEditingSubItem(null);
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="form-check-label ms-2 card-modal-subitem-span"
                            onDoubleClick={() => {
                              setEditingSubItem({ checklistId: item.id ?? 0, subItemId: subItem.id ?? 0});
                              setEditValue(subItem.content);
                            }}
                            tabIndex={0}
                            title="Doble click para editar"
                            style={{
                              textDecoration: subItem.done ? "line-through" : "none",
                              color: subItem.done ? "#888" : undefined
                            }}
                          >
                            {subItem.content}
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-link p-0 ms-2 delete-subitem-btn"
                          onClick={() => {
                            if (window.confirm('¿Seguro que quieres eliminar este elemento?')) {
                              startDeletingSubItem(subItem.id, item.id!);
                              setFormData(prev => ({
                                ...prev,
                                checklistItems: prev.checklistItems?.map(ci =>
                                  ci.id === item.id
                                    ? { ...ci, subItems: ci.subItems?.filter(si => si.id !== subItem.id) }
                                    : ci
                                )
                              }));
                            }
                          }}
                          tabIndex={-1}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="card-modal-checklist-menu-container">
                    <button
                      type="button"
                      className="btn btn-link p-0 ms-2"
                      onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}
                      tabIndex={0}
                    >
                      <MoreVertIcon />
                    </button>
                    {openMenuIndex === i && (
                      <div className="card-modal-checklist-menu">
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => {
                            setOpenMenuIndex(null);
                            handleAddSubItem(item);
                          }}
                        >
                          Añadir elemento
                        </button>
                        <button
                          className="dropdown-item text-danger"
                          type="button"
                          onClick={() => {
                            setOpenMenuIndex(null);
                            handleDeleteChecklist(item);
                          }}
                        >
                          Eliminar checklist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>

          <div className="col-lg-4 d-flex flex-column align-items-end order-lg-2 order-4 mt-3 mt-lg-4">
            <div className="d-grid gap-2 w-100">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={isMember ? handleLeave : handleJoin}
              >
                {isMember ? "Abandonar" : "Unirme"}
              </button>
              {formData.label ? (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={async () => {
                    setLabelPendingDelete(true);
                    setFormData(prev => ({ ...prev, label: null }));
                    await startSavingCard({ ...formData, label: null });
                    await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                    const updatedCard = cardsByStatus[formData.status_id]?.find(c => c.id === formData.id);
                    if (updatedCard && !updatedCard.label) {
                      setFormData({ ...updatedCard });
                      setLabelPendingDelete(false);
                    }
                  }}
                >
                  Eliminar Etiqueta
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowLabelModal(true)}
                >
                  Añadir Etiqueta
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleAddChecklist}
              >
                Añadir Checklist
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={async () => {
                  if (!formData.id) {
                    swalDarkModal.fire({
                      title: 'Acción no permitida',
                      text: 'Debes guardar la tarjeta antes de adjuntar un enlace.',
                      icon: 'warning'
                    });
                    return;
                  }
                  if (formData.attachedLinks) {
                    const result = await swalDarkModal.fire({
                      title: '¿Borrar enlace?',
                      text: `¿Seguro que quieres borrar el enlace "${formData.attachedLinks}"?`,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'Sí, borrar',
                      cancelButtonText: 'Cancelar',
                      confirmButtonColor: '#d33',
                    });

                    if (result.isConfirmed) {
                      setFormData(prev => ({ ...prev, attachedLinks: "" }));
                      await startSavingCard({ ...formData, attachedLinks: "" });
                      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                    }
                  } else {
                    const { value: url } = await swalDarkModal.fire({
                      title: 'Adjuntar Nuevo Enlace',
                      input: 'url',
                      inputPlaceholder: 'https://ejemplo.com',
                      showCancelButton: true,
                      confirmButtonText: 'Adjuntar',
                      cancelButtonText: 'Cancelar',
                      inputValidator: (value) => {
                        if (!value) {
                          return '¡El enlace no puede estar vacío!';
                        }
                        if (!value.startsWith("https://") && !value.startsWith("http://")) {
                          return 'El enlace debe empezar con http:// o https://';
                        }
                      }
                    });

                    if (url) {
                      setFormData(prev => ({ ...prev, attachedLinks: url }));
                      await startSavingCard({ ...formData, attachedLinks: url });
                      await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                    }
                  }
                }}
              >
                {formData.attachedLinks ? "Borrar Enlace" : "Adjuntar Enlace"}
              </button>
              <button
                type="button"
                className="btn btn-danger card-modal-delete-btn"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLabelModal && (
        <Modal
          isOpen={showLabelModal}
          onRequestClose={() => setShowLabelModal(false)}
          contentLabel="Seleccionar o crear etiqueta"
          overlayClassName="card-modal-label-modal-overlay"
          className="card-modal-label-modal-content"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setShowLabelModal(false)}
            className="card-modal-label-modal-close-btn"
          >
            &times;
          </button>
          <h5>Selecciona una etiqueta</h5>
          <div className="mb-3 card-modal-label-btn-list">
            {labels.map(label => (
              <button
                key={label.id}
                type="button"
                className="btn card-modal-label-btn"
                style={{
                  backgroundColor: label.color
                }}
                onClick={async () => {
                  setFormData(prev => ({ ...prev, label }));
                  setLabelPendingDelete(false);
                  await startSavingCard({ ...formData, label });
                  await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                  setShowLabelModal(false);
                }}
              >
                {label.title}
              </button>
            ))}
          </div>
          <hr />
          <h6>Crear nueva etiqueta</h6>
          <div className="create-label-form">
            <div className="create-label-inputs">
              <input
                type="text"
                className="form-control me-2"
                value={newLabelTitle}
                onChange={e => setNewLabelTitle(e.target.value)}
              />
              <div className="create-label-color-picker">
                <input
                  type="color"
                  value={newLabelColor}
                  onChange={e => setNewLabelColor(e.target.value)}
                  className="card-modal-label-color-input"
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary mt-2"
              disabled={!newLabelTitle.trim()}
              onClick={async () => {
                const labelToCreate = {
                  title: newLabelTitle.trim(),
                  color: newLabelColor,
                  boardId: formData.board_id
                };
                const created = await startSavingLabel(labelToCreate);
                setLabels(prev => [...prev, created]);
                setFormData(prev => ({ ...prev, label: created }));
                setLabelPendingDelete(false);
                await startSavingCard({ ...formData, label: created });
                await startLoadingCardsByBoardAndStatus(formData.board_id, formData.status_id);
                setShowLabelModal(false);
                setNewLabelTitle('');
                setNewLabelColor('#2196f3');
              }}
            >
              Crear y asignar
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default CardModal;