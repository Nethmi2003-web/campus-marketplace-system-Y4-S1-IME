export const customerRetention = [
  { title: "Refer a friend", description: "Rs 1,640 credit for the referrer and their friend." },
  {
    title: "Collect loyalty points",
    description: "Reward repeat campus orders with a points-based program.",
  },
  {
    title: "Make it Premium",
    description: "Free delivery and exclusive offers for Rs 1,636 per month.",
  },
  {
    title: "Personal recommendations",
    description: "Email ideas shaped around campus interests and orders.",
  },
  { title: "Build community trust", description: "Ratings, reviews and 24/7 partner support." },
];

export const swotMitigations: Partial<Record<string, string>> = {
  Weaknesses:
    "Proposed: build trust with a small, measurable campus pilot; cross-train the team; schedule partner coverage around semester calendars; and use documented vendor quality checks.",
  Threats:
    "Proposed: differentiate through local partnerships; maintain a flexible partner pool; prepare campus-policy and compliance reviews; monitor vendor retention; and define payment/platform incident procedures.",
};

export const operationsGroups = [
  { title: "Platform Lead", children: ["Technical Support"] },
  { title: "Business Manager", children: ["Growth / Marketing Lead", "Campus Ambassadors"] },
  { title: "Operations Manager", children: ["Delivery Partners"] },
];

export const operationalPillars = [
  {
    title: "A distributed Campus Command Hub",
    items: [
      "Operations and administration desks",
      "Partner gear and support station",
      "Virtual AWS / Google Cloud infrastructure",
    ],
  },
  {
    title: "Partner welfare & safety",
    items: [
      "Flexible shifts around timetables",
      "Reflective vests, helmets and insulated bags",
      "Live location monitoring and 24/7 emergency support",
      "Performance bonuses",
    ],
  },
  {
    title: "Responsible operations",
    items: [
      "Paperless receipts",
      "Foot, bicycle and e-scooter deliveries",
      "Commercial liability, partner accident and cyber cover",
    ],
  },
  {
    title: "Legal & intellectual property",
    items: [
      "Business registration, terms and vendor agreements",
      "PCI-compliant payments",
      "CampusCart trademark and source-code copyright",
    ],
  },
];

export const riskRegister = [
  {
    risk: "Large delivery apps add campus discounts",
    likelihood: "Medium",
    impact: "High",
    response:
      "Proposed: emphasize local vendor access, campus partnerships and service reliability.",
  },
  {
    risk: "Delivery-partner retention",
    likelihood: "Medium",
    impact: "High",
    response: "Proposed: flexible timetables, safety gear, support and performance bonuses.",
  },
  {
    risk: "Vendor churn",
    likelihood: "Medium",
    impact: "Medium",
    response: "Proposed: clear settlements, onboarding support and useful analytics.",
  },
  {
    risk: "Campus policy restrictions",
    likelihood: "Low–medium",
    impact: "High",
    response: "Proposed: consult campus stakeholders and align operations with campus policy.",
  },
  {
    risk: "Platform or payment downtime",
    likelihood: "Low–medium",
    impact: "High",
    response: "Proposed: monitoring, incident procedures and resilient cloud operations.",
  },
  {
    risk: "Payment and data regulation changes",
    likelihood: "Medium",
    impact: "High",
    response: "Proposed: periodic PCI-DSS and data-protection compliance reviews.",
  },
];

export const roadmapTimeline = [
  {
    period: "Weeks 1–9",
    title: "Platform launch",
    description:
      "Prepare the platform, vendors and student delivery network for the first campus launch.",
  },
  {
    period: "Weeks 17–24",
    title: "Plan the next campuses",
    description: "Assess and prepare expansion to the second and third campus.",
  },
  {
    period: "Five-year vision",
    title: "A connected campus network",
    description:
      "50+ campuses nationwide, automated parcel lockers, a peer-to-peer textbook marketplace and an integrated campus wallet.",
  },
];

export const objectives = [
  { value: "50+ vendors", label: "and 150 student delivery partners to onboard" },
  {
    value: "5,500 active users",
    label: "and 11,000+ monthly orders by Q4 of Year 1",
  },
  { value: "15–30 min", label: "delivery target with 95%+ satisfaction" },
  { value: "8–10 months", label: "break-even objective" },
  { value: "35%+", label: "gross-margin objective" },
];

export const customerVendorPartnerSteps = {
  customers: {
    title: "For Customers",
    description:
      "Browse campus and Malabe vendors, place an order, confirm your hand-off with QR verification, then follow delivery with live GPS tracking. Rate your experience and reach in-app support any time.",
  },
  vendors: {
    title: "For Vendors",
    description:
      "Onboard your menu or product range, accept incoming campus orders, prepare for a verified student-partner pick-up, then receive settlement through your agreed vendor terms.",
  },
  partners: {
    title: "For Delivery Partners",
    description:
      "Choose shifts around your timetable, accept a nearby dispatch, verify each pick-up and deliver across campus. Partner support, safety gear and performance bonuses are part of the proposed program.",
  },
};

export const aboutDetails = {
  submission: "IT4050 Innovation Management & Entrepreneurship · 17/09/2026",
  ownershipShare: "25%",
  established: "2026",
  registration: "PV 00298412",
  registrationAuthority: "Department of the Registrar of Companies, Sri Lanka",
  skills: [
    "Flutter / React Native",
    "AWS / Google Cloud",
    "Digital marketing",
    "Agile project management",
  ],
};

export const launchReadiness = [
  "High-fidelity UI/UX wireframes done",
  "Demand survey of 500+ students",
  "Letters of Intent from 15 vendors",
  "Tech stack and backend architecture finalised",
];

export const marketOverview = {
  malabeStudents: "13,000–15,000",
  sliitNetwork: "25,000+",
  annualSpend: "Rs 25–30 million",
  potentialDailyUsers: "About 8,000",
};
