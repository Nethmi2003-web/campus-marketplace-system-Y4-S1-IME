export interface LoanPayment {
  month: number;
  openingBalance: number;
  capital: number;
  interest: number;
  payment: number;
  closingBalance: number;
}

export function calculateLoanSchedule(
  amount: number,
  annualRatePercent: number,
  months: number,
): LoanPayment[] {
  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(annualRatePercent) ||
    !Number.isFinite(months) ||
    amount <= 0 ||
    annualRatePercent < 0 ||
    months < 1
  ) {
    return [];
  }

  const count = Math.floor(months);
  const capitalPerMonth = amount / count;
  let balance = amount;

  return Array.from({ length: count }, (_, index) => {
    const openingBalance = balance;
    const capital = index === count - 1 ? balance : capitalPerMonth;
    const interest = openingBalance * (annualRatePercent / 100 / 12);
    balance = Math.max(0, openingBalance - capital);
    return {
      month: index + 1,
      openingBalance,
      capital,
      interest,
      payment: capital + interest,
      closingBalance: balance,
    };
  });
}

export interface SavingsEstimate {
  campusCartMonthly: number;
  campusCartPremiumMonthly: number;
  thirdPartyMonthly: number;
  premiumMonthly: number;
  monthlySavings: number;
  breakEvenOrdersPerMonth: number;
}

export function calculateSavings(
  ordersPerWeek: number,
  basketValue: number,
  premiumPrice: number,
  deliveryFee = 738,
  platformFeeRate = 0.05,
  thirdPartyFeeRate = 0.3,
): SavingsEstimate {
  const inputs = [
    ordersPerWeek,
    basketValue,
    premiumPrice,
    deliveryFee,
    platformFeeRate,
    thirdPartyFeeRate,
  ];
  if (inputs.some((value) => !Number.isFinite(value))) {
    return {
      campusCartMonthly: 0,
      campusCartPremiumMonthly: 0,
      thirdPartyMonthly: 0,
      premiumMonthly: 0,
      monthlySavings: 0,
      breakEvenOrdersPerMonth: 0,
    };
  }
  const monthlyOrders = Math.max(0, ordersPerWeek) * (52 / 12);
  const monthlyCartSpend = monthlyOrders * Math.max(0, basketValue);
  const monthlyPlatformFees = monthlyCartSpend * Math.max(0, platformFeeRate);
  const campusCartMonthly = monthlyOrders * Math.max(0, deliveryFee) + monthlyPlatformFees;
  const premiumMonthly = Math.max(0, premiumPrice);
  const campusCartPremiumMonthly = premiumMonthly + monthlyPlatformFees;
  const thirdPartyMonthly = monthlyCartSpend * Math.max(0, thirdPartyFeeRate);
  const breakEvenOrdersPerMonth = deliveryFee > 0 ? premiumMonthly / deliveryFee : 0;
  return {
    campusCartMonthly,
    campusCartPremiumMonthly,
    thirdPartyMonthly,
    premiumMonthly,
    monthlySavings: thirdPartyMonthly - campusCartMonthly,
    breakEvenOrdersPerMonth,
  };
}

export function formatLkr(value: number): string {
  const formatted = Number.isInteger(value)
    ? value.toLocaleString("en-LK")
    : value.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `Rs ${formatted}`;
}
