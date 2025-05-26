import React from 'react';

interface RenewSubProps {
  startRenewingSubscription: () => Promise<void>;
  isRenewingSubscription: boolean;
}

export const RenewSub: React.FC<RenewSubProps> = ({
  startRenewingSubscription,
  isRenewingSubscription,
}) => {
  const handleRenew = async () => {
    try {
      await startRenewingSubscription();
    } catch (error) {
    }
  };

  return (
    <div className="subscription-card-component">
      <div 
        className="text-center p-3 mb-4 glasmorphism-effect"
        role="alert"
      >
        <h4 className="alert-heading">Cancelación Programada</h4>
        <p>Tu suscripción Premium ha sido programada para cancelación y permanecerá activa hasta el final de tu periodo de facturación actual.</p>
      </div>
      <p className="text-center mb-4 text-muted-dark-theme">
        Puedes reactivar tu suscripción antes de que finalice.
      </p>
      <div className="d-grid">
        <button
          className="neumorphism-button neumorphism-button-success"
          onClick={handleRenew}
          disabled={isRenewingSubscription}
        >
          {isRenewingSubscription ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Reactivando...
            </>
          ) : (
            'Reactivar Suscripción'
          )}
        </button>
      </div>
    </div>
  );
};