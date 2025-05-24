import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface StripeCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

interface StripeCancelSubscriptionResponse {
  message: string;
  status: string;
}

interface StripeState {
  sessionId: string | null;
  checkoutUrl: string | null;
  currentSubscriptionId: string | null;
  isLoadingCheckout: boolean;
  checkoutError: string | null;
  isCancelingSubscription: boolean;
  cancelSubscriptionError: string | null;
  cancelSubscriptionSuccessMessage: string | null;
  cancelAtPeriodEnd: boolean;
  isRenewingSubscription: boolean;
  renewSubscriptionError: string | null;
  renewSubscriptionSuccessMessage: string | null;
}

const initialState: StripeState = {
  sessionId: null,
  checkoutUrl: null,
  currentSubscriptionId: null,
  isLoadingCheckout: false,
  checkoutError: null,
  isCancelingSubscription: false,
  cancelSubscriptionError: null,
  cancelSubscriptionSuccessMessage: null,
  cancelAtPeriodEnd: false,
  isRenewingSubscription: false,
  renewSubscriptionError: null,
  renewSubscriptionSuccessMessage: null,
};

export const stripeSlice = createSlice({
  name: 'stripe',
  initialState,
  reducers: {
    startLoadingCheckoutSession: (state) => {
      state.isLoadingCheckout = true;
      state.checkoutError = null;
      state.sessionId = null;
      state.checkoutUrl = null;
    },
    setCheckoutSessionSuccess: (state, action: PayloadAction<StripeCheckoutResponse>) => {
      state.isLoadingCheckout = false;
      state.sessionId = action.payload.sessionId;
      state.checkoutUrl = action.payload.checkoutUrl;
    },
    setCheckoutSessionFailed: (state, action: PayloadAction<string>) => {
      state.isLoadingCheckout = false;
      state.checkoutError = action.payload;
    },
    clearStripeSessionData: (state) => {
      state.sessionId = null;
      state.checkoutUrl = null;
      state.isLoadingCheckout = false;
      state.checkoutError = null;
    },
    startLoadingCancelSubscription: (state) => {
      state.isCancelingSubscription = true;
      state.cancelSubscriptionError = null;
      state.cancelSubscriptionSuccessMessage = null;
    },
    setCancelSubscriptionSuccess: (state, action: PayloadAction<StripeCancelSubscriptionResponse>) => {
      state.isCancelingSubscription = false;
      state.cancelSubscriptionSuccessMessage = action.payload.message;
    },
    setCancelSubscriptionFailed: (state, action: PayloadAction<string>) => {
      state.isCancelingSubscription = false;
      state.cancelSubscriptionError = action.payload;
    },
    resetCancelSubscriptionStatus: (state) => {
      state.isCancelingSubscription = false;
      state.cancelSubscriptionError = null;
      state.cancelSubscriptionSuccessMessage = null;
    },
    setSubscriptionStatusDetails: (state, action: PayloadAction<{ subscriptionId: string | null, cancelAtPeriodEnd: boolean, subscriptionStatus?: string | null }>) => {
      state.currentSubscriptionId = action.payload.subscriptionId;
      state.cancelAtPeriodEnd = action.payload.cancelAtPeriodEnd;
    },
    startLoadingRenewSubscription: (state) => {
      state.isRenewingSubscription = true;
      state.renewSubscriptionError = null;
      state.renewSubscriptionSuccessMessage = null;
    },
    setRenewSubscriptionSuccess: (state, action: PayloadAction<{ message: string; status: string }>) => {
      state.isRenewingSubscription = false;
      state.renewSubscriptionSuccessMessage = action.payload.message;
      state.cancelAtPeriodEnd = false;
    },
    setRenewSubscriptionFailed: (state, action: PayloadAction<string>) => {
      state.isRenewingSubscription = false;
      state.renewSubscriptionError = action.payload;
    },
    resetRenewSubscriptionStatus: (state) => {
      state.isRenewingSubscription = false;
      state.renewSubscriptionError = null;
      state.renewSubscriptionSuccessMessage = null;
    },
    // --- Current Subscription ID ---
    setCurrentSubscriptionId: (state, action: PayloadAction<string | null>) => {
      state.currentSubscriptionId = action.payload;
    },
  },
});

export const {
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
} = stripeSlice.actions;

export const selectStripeSessionId = (state: RootState) => state.stripe.sessionId;
export const selectStripeCheckoutUrl = (state: RootState) => state.stripe.checkoutUrl;
export const selectIsLoadingCheckout = (state: RootState) => state.stripe.isLoadingCheckout;
export const selectStripeCheckoutError = (state: RootState) => state.stripe.checkoutError;
export const selectCurrentSubscriptionId = (state: RootState) => state.stripe.currentSubscriptionId;
export const selectIsCancelingSubscription = (state: RootState) => state.stripe.isCancelingSubscription;
export const selectCancelSubscriptionError = (state: RootState) => state.stripe.cancelSubscriptionError;
export const selectCancelSubscriptionSuccessMessage = (state: RootState) => state.stripe.cancelSubscriptionSuccessMessage;
export const selectCancelAtPeriodEnd = (state: RootState) => state.stripe.cancelAtPeriodEnd;
export const selectIsRenewingSubscription = (state: RootState) => state.stripe.isRenewingSubscription;
export const selectRenewSubscriptionError = (state: RootState) => state.stripe.renewSubscriptionError;
export const selectRenewSubscriptionSuccessMessage = (state: RootState) => state.stripe.renewSubscriptionSuccessMessage; // Nuevo

export default stripeSlice.reducer;