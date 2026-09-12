/**
 * Deliveries Hub - Delivery Charges & Final Bill Calculation Utility
 *
 * Base Delivery Charges:
 * - Up to Rs. 3,000     -> Rs. 250
 * - Rs. 3,001 to 5,000  -> Rs. 300
 * - Rs. 5,001 to 10,000 -> Rs. 400
 * - Above Rs. 10,000    -> Rs. 500
 *
 * Extra Item Charge:
 * - (Number of Items - 1) * Rs. 50
 *
 * Extra Category Charge:
 * - (Number of Different Categories - 1) * Rs. 100
 *
 * Complete Formula:
 * Delivery Charges = Base Delivery Fee + Extra Item Charge + Extra Category Charge
 * Final Bill = Total Item Cost + Delivery Charges
 */

export type DeliveryCalculation = {
  subtotal: number;
  baseDeliveryFee: number;
  extraItemCharge: number;
  extraCategoryCharge: number;
  totalDeliveryCharges: number;
  finalBill: number;
};

export function calculateDeliveryCharges(
  subtotal: number,
  totalItemQuantity: number,
  differentCategoriesCount: number
): DeliveryCalculation {
  if (subtotal <= 0 || totalItemQuantity <= 0) {
    return {
      subtotal: 0,
      baseDeliveryFee: 0,
      extraItemCharge: 0,
      extraCategoryCharge: 0,
      totalDeliveryCharges: 0,
      finalBill: 0,
    };
  }

  // 1. Base Delivery Fee
  let baseDeliveryFee = 250;
  if (subtotal > 10000) {
    baseDeliveryFee = 500;
  } else if (subtotal > 5000) {
    baseDeliveryFee = 400;
  } else if (subtotal > 3000) {
    baseDeliveryFee = 300;
  } else {
    baseDeliveryFee = 250;
  }

  // 2. Extra Item Charge
  const extraItemCharge = Math.max(0, totalItemQuantity - 1) * 50;

  // 3. Extra Category Charge
  const extraCategoryCharge = Math.max(0, differentCategoriesCount - 1) * 100;

  // Total Delivery Charges
  const totalDeliveryCharges = baseDeliveryFee + extraItemCharge + extraCategoryCharge;

  // Final Total Bill
  const finalBill = subtotal + totalDeliveryCharges;

  return {
    subtotal,
    baseDeliveryFee,
    extraItemCharge,
    extraCategoryCharge,
    totalDeliveryCharges,
    finalBill,
  };
}
