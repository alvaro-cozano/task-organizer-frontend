import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { addHours } from 'date-fns';

import { CardDTO, StatusDTO } from '../../../../management';
import { useCardStore } from '../../../../hooks';

import "react-datepicker/dist/react-datepicker.css";

interface CardModalProps {
  isOpen: boolean;
  closeModal: () => void;
  card: CardDTO | null;
  statuses: StatusDTO[] | null;
}

const CardModal: React.FC<CardModalProps> = ({ isOpen, closeModal, card, statuses }) => {
  const { boardId } = useParams<{ boardId: string }>();

  const [formData, setFormData] = useState<CardDTO>({
    cardTitle: '',
    description: '',
    startDate: new Date,
    endDate: addHours( new Date(), 2 ),
    priority: 1,
    board_id: parseInt(boardId || '0', 10),
    status_id: 1,
    prev_status_id: 0,
    users: [{ email: '' }],
  });

  const { startSavingCard, startDeletingCard } = useCardStore();

  useEffect(() => {
    if (card) {
      setFormData({
        ...card,
        board_id: card.board_id || parseInt(boardId || '0', 10),
        prev_status_id: card.status_id || 0,
        users: card.users || [{ email: '' }],
      });
    } else {
      const defaultStatusId = Array.isArray(statuses) && statuses.length > 0
        ? statuses.find(s => s.boardId === parseInt(boardId || '0', 10))?.id ?? 0
        : 0;

      const currentDate = new Date();
      const endDate = addHours(currentDate, 2);

      setFormData({
        cardTitle: '',
        description: '',
        startDate: currentDate,
        endDate: endDate,
        priority: 1,
        board_id: parseInt(boardId || '0', 10),
        status_id: defaultStatusId,
        prev_status_id: 0,
        users: [{ email: '' }],
      });
    }
  }, [card, boardId, statuses]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatusId = parseInt(e.target.value, 10);
    setFormData(prevState => ({
      ...prevState,
      status_id: selectedStatusId,
    }));
  }, []);

  const handleDateChange = useCallback((date: Date | null, name: string) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: date || new Date(),
    }));
  }, []);
  

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    startSavingCard(formData);
    setFormData({
      cardTitle: '',
      description: '',
      startDate: new Date(),
      endDate: addHours(new Date(), 2),
      priority: 1,
      board_id: parseInt(boardId || '0', 10),
      status_id: statuses?.find(s => s.boardId === parseInt(boardId || '0', 10))?.id ?? 0,
      prev_status_id: 0,
      users: [{ email: '' }],
    });
    closeModal();
  }, [formData, startSavingCard, closeModal, boardId, statuses]);

  const handleDelete = useCallback(() => {
    if (card && card.id) {
      startDeletingCard(card.id, card.board_id, card.status_id);
      closeModal();
    }
  }, [card, startDeletingCard, closeModal]);

  const handleEmailChange = useCallback((index: number, email: string) => {
    const updatedUsers = [...formData.users];
    updatedUsers[index].email = email;
    setFormData({ ...formData, users: updatedUsers });
  }, [formData]);

  const handleAddUser = useCallback(() => {
    setFormData(prevState => ({
      ...prevState,
      users: [...prevState.users, { email: '' }],
    }));
  }, []);

  const handleRemoveUser = useCallback((index: number) => {
    const updatedUsers = formData.users.filter((_, i) => i !== index);
    setFormData({ ...formData, users: updatedUsers });
  }, [formData]);

  const isSubmitDisabled = () => {
    return !formData.cardTitle || !formData.startDate || !formData.endDate || !formData.priority || !formData.status_id;
  };

  return (
    <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="Card Modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
          content: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1001,
          },
        }}
      >
      <div className="modal-header">
        <h5 className="modal-title">{card ? 'Editar Tarjeta' : 'Crear Tarjeta'}</h5>
        <button type="button" className="btn-close" onClick={closeModal} aria-label="Cerrar"></button>
      </div>

      <form onSubmit={handleSubmit} className="modal-body">
        <div className="mb-3">
          <label className="form-label">Título:</label>
          <input
            type="text"
            name="cardTitle"
            value={formData.cardTitle}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descripción:</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de inicio:</label>
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
            maxTime={
              formData.endDate &&
              formData.startDate &&
              new Date(formData.startDate).toDateString() === new Date(formData.endDate).toDateString()
                ? new Date(formData.endDate)
                : new Date(0, 0, 0, 23, 59)
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de fin:</label>
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
            minTime={
              formData.endDate &&
              formData.startDate &&
              new Date(formData.endDate).toDateString() === new Date(formData.startDate).toDateString()
                ? new Date(formData.startDate)
                : new Date(0, 0, 0, 0, 0)
            }
            maxTime={new Date(0, 0, 0, 23, 59)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Prioridad:</label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            min={1}
            max={5}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status:</label>
          <select
            name="status_id"
            value={formData.status_id}
            onChange={handleStatusChange}
            required
            className="form-select"
          >
            <option value="" disabled>Selecciona un estado</option>
            {Array.isArray(statuses) && statuses.length > 0 ? (
              statuses.map((status: StatusDTO) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))
            ) : (
              <option value={0}>No hay estados disponibles</option>
            )}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Correos de los usuarios:</label>
          {formData.users.map((user, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="email"
                value={user.email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                className="form-control"
              />
              {formData.users.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveUser(index)}
                  className="btn btn-danger"
                >
                  <i className="bi bi-dash-circle"></i>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddUser} className="btn btn-secondary">
            Añadir Usuario
          </button>
        </div>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled()}>
            {card ? 'Actualizar' : 'Crear'}
          </button>
          {card && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Eliminar
            </button>
          )}
        </div>
      </form>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={closeModal}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default CardModal;
