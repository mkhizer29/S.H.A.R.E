import { loadStripe } from '@stripe/stripe-js';

// We fallback to a test key explicitly so the UI doesn't break if env is missing during mock rendering
const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';

export const stripePromise = loadStripe(key);
