export const years = ["Y1", "Y2", "Y3"] as const;
export type FinancialYear = (typeof years)[number];
export const loanTerms = {
  amount: 1200000,
  annualRatePercent: 14,
  months: 36,
  monthlyCapital: 33333.33,
  planYearlyTotals: [
    { year: "Y1", capital: 400000, interest: 142333.33 },
    { year: "Y2", capital: 400000, interest: 86333.33 },
    { year: "Y3", capital: 400000, interest: 30333.33 },
  ],
};

export const marketingCostTotals = [
  { year: "Y1", amount: 17030500 },
  { year: "Y2", amount: 28735000 },
  { year: "Y3", amount: 43000000 },
];

export const revenueStreams = [
  { name: "F&B delivery commission", Y1: 4650000, Y2: 7000000, Y3: 8500000, color: "#126b50" },
  {
    name: "Stationery, pharmacy & convenience commission",
    Y1: 2550000,
    Y2: 5000000,
    Y3: 6000000,
    color: "#43a47e",
  },
  {
    name: "Delivery fee revenue (non-Premium)",
    Y1: 2500000,
    Y2: 4500000,
    Y3: 6500000,
    color: "#f4a261",
  },
  { name: "Premium subscriptions", Y1: 4550000, Y2: 6500000, Y3: 12500000, color: "#9268a6" },
  {
    name: "Vendor ads, featured placement & analytics",
    Y1: 5000000,
    Y2: 7500000,
    Y3: 9000000,
    color: "#4b82b7",
  },
  { name: "Campus event promotions", Y1: 550000, Y2: 600000, Y3: 750000, color: "#df7186" },
];

export const monthlyUnits = [
  {
    stream: "F&B",
    values: [184, 184, 183, 718, 718, 718, 1330, 1330, 1330, 1902, 1902, 1091],
    total: 12400,
  },
  {
    stream: "Stationery etc.",
    values: [189, 189, 188, 739, 739, 738, 1367, 1367, 1368, 1955, 1955, 1956],
    total: 12750,
  },
  {
    stream: "Delivery fees",
    values: [50, 50, 50, 196, 196, 197, 363, 363, 364, 520, 520, 519],
    total: 3388,
  },
  {
    stream: "Premium member-months",
    values: [41, 41, 41, 161, 161, 161, 298, 298, 299, 427, 427, 426],
    total: 2781,
  },
  {
    stream: "Vendor ads (vendor-months)",
    values: [5, 5, 5, 20, 19, 20, 36, 36, 35, 51, 51, 51],
    total: 333,
  },
  { stream: "Events", values: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 2], total: 11 },
];

export const profitAndLoss = [
  { item: "Sales", Y1: 19800000, Y2: 31100000, Y3: 43250000 },
  { item: "Cost of sales", Y1: 45040, Y2: 53000, Y3: 70000 },
  { item: "Gross profit", Y1: 19754960, Y2: 31047000, Y3: 43180000 },
  { item: "Admin", Y1: 240000, Y2: 263000, Y3: 263000 },
  { item: "Marketing & distribution", Y1: 192000, Y2: 201000, Y3: 161000 },
  { item: "Profit before interest & depreciation", Y1: 19652960, Y2: 30913000, Y3: 43036000 },
  { item: "Interest", Y1: 142333, Y2: 86333, Y3: 30333 },
  { item: "Depreciation", Y1: 330000, Y2: 330000, Y3: 280000 },
  { item: "Profit before tax", Y1: 19180627, Y2: 30496667, Y3: 42725667 },
  { item: "Tax 30%", Y1: 5754188, Y2: 9149000, Y3: 12817700 },
  { item: "Net profit", Y1: 13426439, Y2: 21347667, Y3: 29907967 },
];

export const ratios = [
  { item: "Gross profit ratio", Y1: "99.77%", Y2: "99.83%", Y3: "99.84%" },
  { item: "Net profit ratio", Y1: "67.81%", Y2: "68.64%", Y3: "69.15%" },
  { item: "ROI", Y1: "570.12%", Y2: "906.48%", Y3: "1,270.00%" },
];

export const cashFlow = {
  salesTotal: 19800,
  sales: [294, 294, 293, 1149, 1199, 1199, 2128, 2128, 2178, 3043, 3043, 1852],
  balance: [
    321.5, 550.7, 779.3, 1863.2, 2997.5, 4132.2, 6194.2, 8256.6, 10369.4, 13346.4, 16323.8, 18113.7,
  ],
  loanFunds: 1200,
  purchases: 1155,
};

export const depreciation = [
  {
    item: "Machinery & equipment",
    asset: 450000,
    life: "3 years",
    Y1: 150000,
    Y2: 150000,
    Y3: 150000,
  },
  { item: "Furniture & fittings", asset: 150000, life: "5 years", Y1: 30000, Y2: 30000, Y3: 30000 },
  { item: "Motor vehicle", asset: 500000, life: "5 years", Y1: 100000, Y2: 100000, Y3: 100000 },
  { item: "Other equipment", asset: 100000, life: "2 years", Y1: 50000, Y2: 50000, Y3: 0 },
];

export const marketingCosts = [
  { item: "Marketing lead wages", Y1: 5900000, Y2: 9840000, Y3: 10500000 },
  { item: "Ambassador stipends", Y1: 2800000, Y2: 3550000, Y3: 9000000 },
  { item: "Launch incentives", Y1: 2242500, Y2: 3625000, Y3: 7000000 },
  { item: "Social media", Y1: 2242500, Y2: 3625000, Y3: 7000000 },
  { item: "Event sponsorships", Y1: 1600000, Y2: 1970000, Y3: 2500000 },
  { item: "Referral", Y1: 1345500, Y2: 3575000, Y3: 4000000 },
  { item: "Loyalty redemption", Y1: 900000, Y2: 2550000, Y3: 3000000 },
];

export const monthlyCashFlow = Array.from({ length: 12 }, (_, index) => ({
  month: `M${index + 1}`,
  sales: cashFlow.sales[index],
  balance: cashFlow.balance[index],
}));

export const costBuildUps = {
  rawInputs: { Y1: 20040, Y2: 28000, Y3: 45000 },
  production: { Y1: 81900, Y2: 153700, Y3: 251900 },
  administration: { Y1: 70500, Y2: 85450, Y3: 102800 },
  marketing: { Y1: 17030500, Y2: 28735000, Y3: 43000000 },
  inputNotes: [
    "Cloud servers: Rs 600/month",
    "SMS & push notifications: Rs 0.05/message",
    "Insulated bags & safety apparel: Rs 35/set",
  ],
};

export const projectFunding = {
  projectCost: 1245000,
  equity: 45000,
  loan: 1200000,
  assets: [
    { item: "Machinery & equipment", amount: 450000 },
    { item: "Furniture & fittings", amount: 150000 },
    { item: "Motor vehicle", amount: 500000 },
    { item: "Other equipment", amount: 100000 },
  ],
};

export const financialAssumptions = [
  "All revenue, profit and cost values are projections from the student business plan.",
  "The cash-flow table values are given in LKR thousands, with a loan-funds row stated separately.",
  "The loan calculator recomputes a reducing-balance schedule from the entered amount, annual rate and term; the plan's stated yearly totals are shown separately.",
  "Tax is shown at the 30% rate stated in the plan.",
];
