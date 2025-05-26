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
    <div className="subscription-card-component">
      <div className="subscription-header-gradient text-center mb-4 glasmorphism-effect">
        <h2 className="card-title">Taskor Premium</h2>
        <p className="subtitle">Lleva tu productividad al siguiente nivel</p>
      </div>

      <div className="subscription-benefits-section mb-4 neumorphism-sunken-container">
        <h4 className="benefits-title-gradient text-center mb-3">Beneficios exclusivos</h4>
        <div className="row gy-4 justify-content-center">
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="benefit-card w-100 neumorphism-raised-card">
              <i className="fas fa-th-large benefit-icon"></i>
              <span>Tableros ilimitados</span>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="benefit-card w-100 neumorphism-raised-card">
              <i className="fas fa-users benefit-icon"></i>
              <span>Colaboradores ilimitados</span>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="benefit-card w-100 neumorphism-raised-card">
              <i className="fas fa-robot benefit-icon"></i>
              <span>Funciones de IA</span>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="benefit-card w-100 neumorphism-raised-card">
              <i className="fas fa-headset benefit-icon"></i>
              <span>Soporte prioritario 24/7</span>
            </div>
          </div>
        </div>
      </div>

      <div className="subscription-price-section d-flex flex-column flex-md-row align-items-center justify-content-center text-center text-md-start mb-4 glasmorphism-effect">
        <span className="price-badge me-md-3 mb-2 mb-md-0">
          <span className="price-main">$1</span>
          <span className="price-sub">/mes</span>
        </span>
        <span className="price-desc">Sin permanencia. Cancela cuando quieras.</span>
      </div>

      <div className="d-grid">
        <button
          className="btn neumorphism-button"
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

      <p className="text-center mt-4 text-muted-dark-theme">
        Serás redirigido a nuestra pasarela de pago segura.
      </p>
    </div>
  );
};
