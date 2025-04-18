import { useCardStore } from '../../../../hooks/useCardStore';
import Swal from 'sweetalert2';

export const FabDeleteBoard = () => {
  const { hasCardSelected, activeCard, startDeletingCard } = useCardStore();

  const handleClick = async () => {
    if (!activeCard || typeof activeCard.id !== 'number') return; // Asegúrate de que activeCard tenga un id válido

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tablero permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    });

    if (result.isConfirmed) {
      await startDeletingCard(activeCard.id); // Pasa el ID de la tarjeta activa para eliminarla
    }
  };

  return (
    <button
      className="btn btn-danger fab-danger"
      onClick={handleClick}
      style={{ display: hasCardSelected ? '' : 'none' }} // Solo mostrar si hay tarjeta seleccionada
    >
      <i className="fas fa-trash-alt" />
    </button>
  );
};
