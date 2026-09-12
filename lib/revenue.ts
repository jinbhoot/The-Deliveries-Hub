/**
 * Deliveries Hub - Revenue & Commission Split Configuration
 *
 * Revenue Model:
 * 1. Base Bill Amount (Subtotal): Fully separated and accounted for product/store costs.
 * 2. Delivery Charge (Delivery Fee): Split between Rider and Admin platform:
 *    - Rider Earnings: 80% of the Delivery Charge
 *    - Admin Platform Fee: 20% of the Delivery Charge
 */

export const RIDER_DELIVERY_FEE_PERCENTAGE = 80;
export const ADMIN_PLATFORM_FEE_PERCENTAGE = 20;

export type RevenueSplit = {
  totalAmount: number;     // Total collected amount (subtotal + deliveryFee)
  subtotal: number;        // Base bill amount (items cost, fully separated)
  deliveryFee: number;     // Total delivery charge collected
  riderEarnings: number;   // Rider share of the delivery fee (80%)
  adminCommission: number; // Admin platform commission of the delivery fee (20%)
  riderPercentage: number;
  adminPercentage: number;
};

/**
 * Calculates the revenue split based strictly on the delivery fee.
 * - Deducts delivery charge from total collected.
 * - Allocates 80% of delivery fee to rider earnings balance.
 * - Allocates 20% of delivery fee to admin platform fee.
 * - Keeps base bill amount (subtotal) fully separated.
 */
export function calculateRevenueSplit(
  subtotal: number,
  deliveryFee: number,
  totalAmount?: number
): RevenueSplit {
  const baseBill = Math.max(0, Math.round(subtotal || 0));
  const fee = Math.max(0, Math.round(deliveryFee || 0));
  const total = typeof totalAmount === "number" && totalAmount > 0 ? totalAmount : baseBill + fee;

  // Split applies ONLY to deliveryFee
  const riderEarnings = Math.round(fee * (RIDER_DELIVERY_FEE_PERCENTAGE / 100));
  const adminCommission = fee - riderEarnings; // ensures riderEarnings + adminCommission === fee

  return {
    totalAmount: total,
    subtotal: baseBill,
    deliveryFee: fee,
    riderEarnings,
    adminCommission,
    riderPercentage: RIDER_DELIVERY_FEE_PERCENTAGE,
    adminPercentage: ADMIN_PLATFORM_FEE_PERCENTAGE,
  };
}
