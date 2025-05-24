import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store/store';
import { springApi } from '../api';
import {
  startLoadingCheckoutSession,
  setCheckoutSessionSuccess,
  setCheckoutSessionFailed,
  clearStripeSessionData,
  startLoadingCancelSubscription,
  setCancelSubscriptionSuccess,
  setCancelSubscriptionFailed,
  resetCancelSubscriptionStatus,
  setCurrentSubscriptionId,
  setSubscriptionStatusDetails,
  startLoadingRenewSubscription,
  setRenewSubscriptionSuccess,
  setRenewSubscriptionFailed,
  resetRenewSubscriptionStatus,
} from '../store';

interface StripeCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

interface StripeCancelSubscriptionResponse {
  message: string;
  status: string;
}

interface SubscriptionStatusResponse {
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
}

interface StripeReactivateSubscriptionResponse {
    message: string;
    status: string;
}

export const useStripeStore = () => {
  const dispatch = useAppDispatch();

  const {
    sessionId,
    checkoutUrl,
    isLoadingCheckout,
    checkoutError,
    currentSubscriptionId,
    isCancelingSubscription,
    cancelSubscriptionError,
    cancelSubscriptionSuccessMessage,
    cancelAtPeriodEnd,
    isRenewingSubscription,
    renewSubscriptionError,
    renewSubscriptionSuccessMessage,
  } = useSelector((state: RootState) => state.stripe);

  const startCreatingCheckoutSession = useCallback(async (payload?: { priceId?: string }) => {
    dispatch(startLoadingCheckoutSession());
    try {
      const requestBody = payload && payload.priceId ? { priceId: payload.priceId } : {};
      const { data } = await springApi.post<StripeCheckoutResponse>('/api/stripe/create-checkout-session', requestBody);
      dispatch(setCheckoutSessionSuccess(data));
      return data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create checkout session';
      dispatch(setCheckoutSessionFailed(message));
      throw new Error(message);
    }
  }, [dispatch]);

  const startLoadingSubscriptionStatus = useCallback(async () => {
    try {
      const { data } = await springApi.get<SubscriptionStatusResponse>('/api/stripe/subscription-status');
      dispatch(setSubscriptionStatusDetails({
        subscriptionId: data.stripeSubscriptionId,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        subscriptionStatus: data.subscriptionStatus
      }));
    } catch (error: any) {
      console.error("Failed to load subscription status:", error);
      dispatch(setSubscriptionStatusDetails({ subscriptionId: null, cancelAtPeriodEnd: false, subscriptionStatus: null }));
    }
  }, [dispatch]);

  const startCancelingSubscription = useCallback(async () => {
    dispatch(startLoadingCancelSubscription());
    try {
      const { data } = await springApi.post<StripeCancelSubscriptionResponse>('/api/stripe/cancel-subscription', {});
      dispatch(setCancelSubscriptionSuccess(data));
      await startLoadingSubscriptionStatus();
      return data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to cancel subscription';
      dispatch(setCancelSubscriptionFailed(message));
      throw new Error(message);
    }
  }, [dispatch, startLoadingSubscriptionStatus]);

  const clearSessionData = useCallback(() => {
    dispatch(clearStripeSessionData());
  }, [dispatch]);

  const setSubscriptionId = useCallback((subscriptionId: string | null) => {
    dispatch(setCurrentSubscriptionId(subscriptionId));
  }, [dispatch]);

  const resetCancelStatus = useCallback(() => {
    dispatch(resetCancelSubscriptionStatus());
  }, [dispatch]);

  const startRenewingSubscription = useCallback(async () => {
    dispatch(startLoadingRenewSubscription());
    try {
      const { data } = await springApi.post<StripeReactivateSubscriptionResponse>('/api/stripe/reactivate-subscription', {});
      dispatch(setRenewSubscriptionSuccess(data));
      await startLoadingSubscriptionStatus();
      return data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to renew subscription';
      dispatch(setRenewSubscriptionFailed(message));
      throw new Error(message);
    }
  }, [dispatch, startLoadingSubscriptionStatus]);

  const resetRenewStatus = useCallback(() => {
    dispatch(resetRenewSubscriptionStatus());
  }, [dispatch]);

  return {
    sessionId,
    checkoutUrl,
    isLoadingCheckout,
    checkoutError,
    currentSubscriptionId,
    isCancelingSubscription,
    cancelSubscriptionError,
    cancelSubscriptionSuccessMessage,
    cancelAtPeriodEnd,
    isRenewingSubscription,
    renewSubscriptionError,
    renewSubscriptionSuccessMessage,
    startCreatingCheckoutSession,
    startCancelingSubscription,
    clearSessionData,
    setSubscriptionId,
    resetCancelStatus,
    startLoadingSubscriptionStatus,
    startRenewingSubscription,
    resetRenewStatus,
  };
};
