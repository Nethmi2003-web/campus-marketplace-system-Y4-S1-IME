import { describe, expect, it } from "vitest";
import { calculateLoanSchedule, calculateSavings, formatLkr } from "./campusCartCalculators";

describe("calculateLoanSchedule", () => {
  it("returns a reducing-balance schedule that fully repays the principal", () => {
    const schedule = calculateLoanSchedule(1_200_000, 14, 36);

    expect(schedule).toHaveLength(36);
    expect(schedule[0].capital).toBeCloseTo(33_333.33, 2);
    expect(schedule[0].interest).toBeCloseTo(14_000, 2);
    expect(schedule.at(-1)?.closingBalance).toBe(0);
    expect(schedule.reduce((total, payment) => total + payment.capital, 0)).toBeCloseTo(
      1_200_000,
      2,
    );
  });

  it("handles a zero-interest loan and rejects invalid terms", () => {
    const schedule = calculateLoanSchedule(1200, 0, 12);
    expect(schedule[0].payment).toBe(100);
    expect(schedule.reduce((total, payment) => total + payment.interest, 0)).toBe(0);
    expect(calculateLoanSchedule(0, 14, 12)).toEqual([]);
    expect(calculateLoanSchedule(100, -1, 12)).toEqual([]);
  });
});

describe("calculateSavings", () => {
  it("compares monthly delivery costs and calculates Premium break-even", () => {
    const result = calculateSavings(3, 1200, 1636, 492, 0.05, 0.3);

    expect(result.campusCartMonthly).toBeCloseTo(7176);
    expect(result.campusCartPremiumMonthly).toBeCloseTo(2416);
    expect(result.thirdPartyMonthly).toBeCloseTo(4680);
    expect(result.breakEvenOrdersPerMonth).toBeCloseTo(1636 / 492);
  });

  it("returns zero estimates for invalid input and avoids division by zero", () => {
    expect(calculateSavings(Number.NaN, 1000, 1636)).toMatchObject({
      campusCartMonthly: 0,
      thirdPartyMonthly: 0,
      breakEvenOrdersPerMonth: 0,
    });
    expect(calculateSavings(2, 1000, 1636, 0, 0.05).breakEvenOrdersPerMonth).toBe(0);
  });
});

describe("formatLkr", () => {
  it("formats LKR consistently while preserving supplied decimal currency", () => {
    expect(formatLkr(1636)).toBe("Rs 1,636");
    expect(formatLkr(142333.33)).toBe("Rs 142,333.33");
  });
});
