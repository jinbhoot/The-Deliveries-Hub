import Stripe from "stripe";

export function getStripe(): Stripe {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build_time_only";
  return new Stripe(stripeSecretKey, {
    typescript: true,
  });
}

// Lazy proxy so that importing `stripe` doesn't crash during Next.js static build analysis
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (instance as any)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
