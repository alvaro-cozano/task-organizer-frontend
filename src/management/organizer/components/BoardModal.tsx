import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { useBoardStore } from '../../../hooks/useBoardStore';

export interface UserReferenceDTO {
    email: string;
}

export interface BoardDTO {
    id: number;
    boardName: string;
    users: UserReferenceDTO[];
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

Modal.setAppElement('#root');

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const BoardModal = ({ isOpen, onClose }: Props) => {
    const { activeBoard, startSavingBoard } = useBoardStore();
    
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [boardName, setBoardName] = useState('');
    const [users, setUsers] = useState<UserReferenceDTO[]>([]); // Lista de usuarios
    const [boardId, setBoardId] = useState<number | null>(null);

    useEffect(() => {
        if (activeBoard) {
            setBoardName(activeBoard.boardName);
            setUsers(activeBoard.users || []);
            setBoardId(activeBoard.id);
        } else {
            setBoardName('');
            setUsers([]);
            setBoardId(null);
        }
    }, [activeBoard]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (boardName.trim().length === 0) {
            Swal.fire('Nombre requerido', 'Debes ingresar un nombre de tablero', 'error');
            return;
        }

        const newBoard: BoardDTO = {
            id: boardId || 0,  // Si es un nuevo tablero, el ID será 0
            boardName,
            users,
        };

        await startSavingBoard(newBoard); // Guarda o actualiza el tablero según el caso

        onClose();
        setFormSubmitted(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            closeTimeoutMS={200}
        >
            <h2>{activeBoard ? 'Editar Tablero' : 'Nuevo Tablero'}</h2>
            <hr />
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Nombre del Tablero</label>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Nombre del tablero"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Usuarios</label>
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Añadir usuarios (por correo)"
                        value={users.map(user => user.email).join(', ')}
                        onChange={(e) => {
                            const emails = e.target.value.split(',').map(email => ({ email: email.trim() }));
                            setUsers(emails);
                        }}
                    />
                </div>

                <button className="btn btn-primary" type="submit">
                    Guardar
                </button>
            </form>
        </Modal>
    );
};
