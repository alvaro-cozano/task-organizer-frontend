import React from 'react';

interface GetSubProps {
  handleSubscribe: () => void;
  isLoadingCheckout: boolean;
}

export const GetSub: React.FC<GetSubProps> = ({
  handleSubscribe,
  isLoadingCheckout,
}) => {
  return (
    <>
      <div 
        className="text-center p-3 mb-4 subscription-alert" 
        role="alert"
      >
        <h4 className="alert-heading">¡Actualiza a Premium!</h4>
        <p>Desbloquea todo el potencial de Taskor con una suscripción Premium.</p>
      </div>
      <div className="mb-4">
        <h5 className="text-center text-light-emphasis">Beneficios de Taskor Premium:</h5>
        <ul className="list-group list-group-flush text-center">
          <li className="list-group-item subscription-list-item"><i className="fas fa-check-circle text-success me-2"></i>Tableros ilimitados</li>
          <li className="list-group-item subscription-list-item"><i className="fas fa-check-circle text-success me-2"></i>Colaboradores ilimitados</li>
          <li className="list-group-item subscription-list-item"><i className="fas fa-check-circle text-success me-2"></i>Soporte prioritario</li>
        </ul>
      </div>
      <p className="text-center lead mb-4 text-light-emphasis">
        <strong>Precio: $5/mes</strong>
      </p>
      <div className="d-grid">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubscribe}
          disabled={isLoadingCheckout}
        >
          {isLoadingCheckout ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Procesando...
            </>
          ) : (
            'Suscribirse Ahora'
          )}
        </button>
      </div>
      <p className="text-center mt-3 text-muted-dark-theme">
        Serás redirigido a nuestra pasarela de pago segura.
      </p>
    </>
  );
};