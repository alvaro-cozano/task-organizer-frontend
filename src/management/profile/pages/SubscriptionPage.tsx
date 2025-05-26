import { useEffect } from 'react';
import Swal from 'sweetalert2';

import { Navbar } from '../../../management';
import { useAuthStore, useStripeStore } from '../../../hooks';
import { RenewSub, GetSub, CancelSub } from '../../../management';

import '../style/subscription.css';

export const SubscriptionPage = () => {
  type UserWithSubscription = {
    id: number;
    username: string;
    email: string;
    roles?: string[];
    subscriptionId?: string | null;
  };

  const { user, status: authStatus, checkAuthToken } = useAuthStore() as {
    user: UserWithSubscription | null;
    status: string;
    checkAuthToken: () => void;
  };

  const {
    startCreatingCheckoutSession,
    startCancelingSubscription,
    checkoutUrl,
    isLoadingCheckout,
    checkoutError,
    isCancelingSubscription,
    cancelSubscriptionError,
    cancelSubscriptionSuccessMessage,
    clearSessionData,
    resetCancelStatus,
    currentSubscriptionId,
    setSubscriptionId,
    cancelAtPeriodEnd,
    isRenewingSubscription,
    renewSubscriptionError,
    renewSubscriptionSuccessMessage,
    startLoadingSubscriptionStatus,
    startRenewingSubscription,
    resetRenewStatus,
  } = useStripeStore();

  const isPremiumUser = user?.roles?.includes('Premium');
  const userRolesDefined = user ? typeof user.roles !== 'undefined' : false;

  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      startLoadingSubscriptionStatus();
    }
  }, [authStatus, user, startLoadingSubscriptionStatus]);

  useEffect(() => {
    if (user?.subscriptionId) {
      setSubscriptionId(user.subscriptionId);
    } else {
      setSubscriptionId(null);
    }
  }, [user, setSubscriptionId]);

  const handleSubscribe = async () => {
    try {
      await startCreatingCheckoutSession();
    } catch (error) {}
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscriptionId && !isPremiumUser) {
      Swal.fire('Error', 'No parece haber una suscripción activa para cancelar.', 'error');
      return;
    }
    try {
      await startCancelingSubscription();
    } catch (error) {}
  };

  useEffect(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  useEffect(() => {
    if (checkoutError) {
      Swal.fire('Error de Suscripción', checkoutError, 'error');
      clearSessionData();
    }
  }, [checkoutError, clearSessionData]);

  useEffect(() => {
    if (cancelSubscriptionSuccessMessage) {
      Swal.fire('Solicitud de Cancelación Procesada', cancelSubscriptionSuccessMessage, 'success');
      resetCancelStatus();
      checkAuthToken();
    }
    if (cancelSubscriptionError) {
      Swal.fire('Error al Cancelar', cancelSubscriptionError, 'error');
      resetCancelStatus();
    }
  }, [cancelSubscriptionSuccessMessage, cancelSubscriptionError, resetCancelStatus, checkAuthToken, startLoadingSubscriptionStatus]);

  useEffect(() => {
    if (renewSubscriptionSuccessMessage) {
      Swal.fire('Suscripción Reactivada', renewSubscriptionSuccessMessage, 'success');
      resetRenewStatus();
      checkAuthToken();
    }
    if (renewSubscriptionError) {
      Swal.fire('Error al Reactivar', renewSubscriptionError, 'error');
      resetRenewStatus();
    }
  }, [renewSubscriptionSuccessMessage, renewSubscriptionError, resetRenewStatus, checkAuthToken, startLoadingSubscriptionStatus]);

  if (authStatus === 'checking') {
    return (
      <>
        <Navbar />
        <div className="profile-page-container d-flex align-items-center justify-content-center">
          <div className="text-center loading-text-dark-theme">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando información de tu suscripción...</p>
          </div>
        </div>
      </>
    );
  }

  if (authStatus !== 'authenticated' || !user) {
    return (
      <>
        <Navbar />
        <div className="profile-page-container d-flex align-items-center justify-content-center">
          <div className="text-center unauthenticated-text-dark-theme">
            <p>No estás autenticado. Por favor, inicia sesión para gestionar tu suscripción.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="sub-page-container">
        <div className="card-sub-body"> 
          {
            !userRolesDefined ? (
              <div className="d-flex justify-content-center align-items-center loading-text-dark-theme">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando datos de usuario...</span>
                </div>
              </div>
            ) : isPremiumUser ? (
              cancelAtPeriodEnd ? (
                <RenewSub
                  startRenewingSubscription={async () => { await startRenewingSubscription(); }}
                  isRenewingSubscription={isRenewingSubscription}
                />
              ) : (
                <CancelSub
                  handleCancelSubscription={handleCancelSubscription}
                  isCancelingSubscription={isCancelingSubscription}
                  currentSubscriptionId={currentSubscriptionId}
                  isPremiumUser={isPremiumUser}
                />
              )
            ) : (
              <GetSub
                handleSubscribe={handleSubscribe}
                isLoadingCheckout={isLoadingCheckout}
              />
            )
          }
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;