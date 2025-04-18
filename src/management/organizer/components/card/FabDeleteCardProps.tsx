import Swal from 'sweetalert2';
import { CardDTO } from '../../types/CardDTO'; // Importa el tipo de CardDTO
import { useCardStore } from '../../../../hooks/useCardStore'; // Asegúrate de importar el hook de useCardStore

interface FabDeleteCardProps {
  card: CardDTO | null; // Puede ser nulo si estamos en modo de creación
}

export const FabDeleteCard: React.FC<FabDeleteCardProps> = ({ card }) => {
  const { startDeletingCard } = useCardStore(); // Usa el hook para acceder a la lógica de eliminación

  const handleClick = async () => {
    if (!card || typeof card.id !== 'number') return; // Verifica que card.id sea un número

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarjeta permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    });

    if (result.isConfirmed) {
      try {
        // Llama a startDeletingCard, que se encarga de la API y la actualización del estado
        await startDeletingCard(card.id, card.board_id, card.status_id);
      } catch (error) {
        console.error('Error al eliminar tarjeta:', error);
        Swal.fire('Error', 'No se pudo eliminar la tarjeta', 'error');
      }
    }
  };

  return (
    <button
      className="btn btn-danger fab-danger"
      onClick={handleClick}
      style={{ display: card ? '' : 'none' }} // Solo mostrar si hay tarjeta (es decir, estamos editando)
    >
      <i className="fas fa-trash-alt" />Eliminar
    </button>
  );
};
