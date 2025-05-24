import React from 'react';

interface CancelSubProps {
  handleCancelSubscription: () => void;
  isCancelingSubscription: boolean;
  currentSubscriptionId: string | null | undefined;
  isPremiumUser: boolean | undefined;
}

export const CancelSub: React.FC<CancelSubProps> = ({
  handleCancelSubscription,
  isCancelingSubscription,
  currentSubscriptionId,
  isPremiumUser,
}) => {
  return (
    <>
      <div 
        className="text-center p-3 mb-4 subscription-alert" 
        role="alert"
      >
        <h4 className="alert-heading">¡Actualmente eres un usuario Premium!</h4>
        <p>Disfrutas de todos los beneficios de Taskor Premium.</p>
      </div>
      <p className="text-center mb-4 text-muted-dark-theme">
        Si deseas cancelar tu suscripción, puedes hacerlo a continuación. Tu suscripción se cancelará al final del periodo de facturación actual.
      </p>
      <div className="d-grid">
        <button
          className="btn btn-danger btn-lg"
          onClick={handleCancelSubscription}
          disabled={isCancelingSubscription || (!currentSubscriptionId && !isPremiumUser)}
        >
          {isCancelingSubscription ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Cancelando...
            </>
          ) : (
            'Cancelar Suscripción'
          )}
        </button>
      </div>
    </>
  );
};