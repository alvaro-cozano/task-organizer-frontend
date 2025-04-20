import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { CardDTO } from '../../types/CardDTO';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addHours, format } from 'date-fns';
import { FabDeleteCard } from '../card/FabDeleteCardProps';
import { RootState } from '../../../../store';
import { useCardStore } from '../../../../hooks/useCardStore'; // Importamos el hook
import { useParams } from 'react-router-dom';
import { StatusDTO } from '../../types/StatusDTO';

interface CardModalProps {
  isOpen: boolean;
  closeModal: () => void;
  card: CardDTO | null;
  statuses: StatusDTO[];
}

const CardModal: React.FC<CardModalProps> = ({ isOpen, closeModal, card, statuses }) => {
  const { boardId } = useParams<{ boardId: string }>();
  const [formData, setFormData] = useState<CardDTO>({
    cardTitle: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 1,
    board_id: 0,
    status_id: 1,
    prev_status_id: 0,
    users: [{ email: '' }]
  });

  const { startSavingCard } = useCardStore(); // Usamos el hook para guardar la tarjeta


  useEffect(() => {
    if (card) {
      setFormData({
        ...card,
        board_id: card.board_id || 0,
        status_id: card.status_id || 1,
        prev_status_id: card.status_id || 0,
        users: card.users || [{ email: '' }],
      });
    } else {
      const defaultStatusId = Array.isArray(statuses)
        ? statuses.find(s => s.boardId === parseInt(boardId || '0', 10))?.id ?? 0
        : 0;
  
      setFormData({
        cardTitle: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 1,
        board_id: boardId ? parseInt(boardId, 10) : 0,
        status_id: defaultStatusId,
        prev_status_id: 0,
        users: [{ email: '' }]
      });
    }
  }, [card, boardId, statuses]); // <---- ¡Agregamos `statuses`!
  

  useEffect(() => {
  }, [statuses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatusId = parseInt(e.target.value, 10);
    setFormData({
      ...formData,
      status_id: selectedStatusId,
    });
  };

  const handleDateChange = (date: Date | null, name: string) => {
    if (date) {
      const updatedDate = addHours(date, 1);
      setFormData({
        ...formData,
        [name]: format(updatedDate, "yyyy-MM-dd HH:mm:ss")  // Cambié el formato a "yyyy-MM-dd HH:mm:ss"
      });
    } else {
      setFormData({
        ...formData,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startSavingCard(formData); // Llamamos al método startSavingCard desde el hook

    closeModal();
  };

  const handleEmailChange = (index: number, email: string) => {
    const updatedUsers = [...formData.users];
    updatedUsers[index].email = email;
    setFormData({ ...formData, users: updatedUsers });
  };

  const handleAddUser = () => {
    setFormData({
      ...formData,
      users: [...formData.users, { email: '' }]
    });
  };

  const handleRemoveUser = (index: number) => {
    const updatedUsers = formData.users.filter((_, i) => i !== index);
    setFormData({ ...formData, users: updatedUsers });
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Card Modal">
      <h2>{card ? 'Editar Tarjeta' : 'Crear Tarjeta'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            name="cardTitle"
            value={formData.cardTitle}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Descripción:</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Fecha de inicio:</label>
          <DatePicker
            selected={formData.startDate ? new Date(formData.startDate) : null}
            onChange={(date: Date | null) => handleDateChange(date, 'startDate')}
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect
            timeIntervals={15}
            timeCaption="Hora"
            required
          />
        </div>

        <div>
          <label>Fecha de fin:</label>
          <DatePicker
            selected={formData.endDate ? new Date(formData.endDate) : null}
            onChange={(date: Date | null) => handleDateChange(date, 'endDate')}
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect
            timeIntervals={15}
            timeCaption="Hora"
            minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
            required
          />
        </div>

        <div>
          <label>Prioridad:</label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            min={1}
            max={5}
          />
        </div>

        <div>
          <label>Status:</label>
          <select
            name="status_id"
            value={formData.status_id || 0}
            onChange={handleStatusChange}
            required
          >
            <option value="" disabled>Selecciona un estado</option>
            {Array.isArray(statuses) && statuses.map((status: StatusDTO) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Correos de los usuarios:</label>
          {formData.users.map((user, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="email"
                name={`users[${index}].email`}
                value={user.email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                required
              />
              {formData.users.length > 1 && (
                <button type="button" onClick={() => handleRemoveUser(index)}>-</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddUser}>Añadir Usuario</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit">
            {card ? 'Actualizar' : 'Crear'}
          </button>
          
          {card && (
            <FabDeleteCard card={card} />
          )}
        </div>

        <button type="button" onClick={closeModal}>Cancelar</button>
      </form>
    </Modal>
  );
};

export default CardModal;
