import { useState } from "react";
import { Check, ChevronRight, Shield, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import {
  aboutContent,
  brand,
  customerSegments,
  competitors,
  customerJourneyFeatures,
  growthPlans,
  marketShare,
  marketAdvantages,
  orderSteps,
  swot,
  team,
} from "../../data/site";
import { marketingCosts, marketingCostTotals, years } from "../../data/financials";
import {
  customerRetention,
  customerVendorPartnerSteps,
  aboutDetails,
  launchReadiness,
  marketOverview,
  objectives,
  operationalPillars,
  operationsGroups,
  riskRegister,
  roadmapTimeline,
  swotMitigations,
} from "../../data/strategy";
import { usePageMeta } from "../../hooks/usePageMeta";
import {
  Card,
  CtaBand,
  ChartCard,
  DataTable,
  PageIntro,
  Section,
  StatCard,
  Tabs,
  type TableColumn,
} from "../../components/ui/MarketingUI";

const competitorColumns: TableColumn<(typeof competitors)[number]>[] = [
  { key: "name", heading: "Provider" },
  { key: "product", heading: "Product" },
  { key: "value", heading: "Value to customers" },
  { key: "advertising", heading: "Advertising" },
  { key: "strengths", heading: "Strengths" },
  { key: "weaknesses", heading: "Limitations" },
];

export function HowItWorksPage() {
  usePageMeta(
    "How it works",
    "A six-step order journey for CampusCart customers, campus vendors and student delivery partners.",
  );
  const [selected, setSelected] = useState<keyof typeof customerVendorPartnerSteps>("customers");
  const chapter = customerVendorPartnerSteps[selected];
  const reduceMotion = useReducedMotion();
  return (
    <>
      <PageIntro
        eyebrow="The campus loop"
        title="A smoother way to get there."
        description="One simple flow connects campus customers, local vendors and student delivery partners."
      />
      <Section
        title="Six steps, one familiar campus."
        description="Each hand-off is designed to be easy to follow and easy to verify."
      >
        <div className="cc-flow-line">
          {orderSteps.map((step, index) => (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              key={step.title}
              transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.35 }}
              viewport={{ once: true, amount: 0.2 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            >
              <Card className="cc-flow-card">
                <span className="cc-flow-count">{String(index + 1).padStart(2, "0")}</span>
                <div className="cc-flow-pulse" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Made for your side of campus"
        title="One network, three good experiences."
      >
        <Tabs
          items={Object.entries(customerVendorPartnerSteps).map(([id, value]) => ({
            id,
            label: value.title,
          }))}
          label="Choose a CampusCart experience"
          onChange={(value) => setSelected(value as keyof typeof customerVendorPartnerSteps)}
          selected={selected}
        />
        <Card
          aria-labelledby={`cc-tab-${selected}`}
          className="cc-tab-content"
          id={`cc-panel-${selected}`}
          role="tabpanel"
          tabIndex={0}
        >
          <span className="cc-card-icon">
            <Sparkles size={20} />
          </span>
          <h3>{chapter.title}</h3>
          <p>{chapter.description}</p>
          <div className="cc-pill-list">
            {customerJourneyFeatures.map((feature) => (
              <span key={feature}>
                <Check size={15} /> {feature}
              </span>
            ))}
          </div>
        </Card>
      </Section>
      <CtaBand
        title="Ready to make campus days feel easier?"
        description="Join the early-access list and help us shape the first launch."
      />
    </>
  );
}

export function CustomersPage() {
  usePageMeta(
    "Customers",
    "Meet the student, graduate, faculty and staff segments CampusCart is designed for.",
  );
  return (
    <>
      <PageIntro
        eyebrow="For all of campus"
        title="Different campus days. One easier cart."
        description="CampusCart is shaped around the rhythms, routines and everyday essentials of the SLIIT Malabe community."
      />
      <Section
        eyebrow="The people we're building for"
        title="Campus, in four everyday rhythms."
        description="User-base share and order patterns are drawn from the business-plan market research."
      >
        <div className="cc-segment-layout">
          <div className="cc-segment-cards">
            {customerSegments.map((segment) => (
              <Card className="cc-segment-card" key={segment.name}>
                <div className="cc-segment-title">
                  <h3>{segment.name}</h3>
                  <strong>{segment.share}%</strong>
                </div>
                <p>{segment.frequency}</p>
                <small>Peak times · {segment.peaks}</small>
                <small>Often looking for · {segment.needs}</small>
              </Card>
            ))}
          </div>
          <ChartCard title="Estimated user-base share" caption="Segments from the market research">
            <ResponsiveContainer height={290} width="100%">
              <PieChart>
                <Pie
                  data={customerSegments}
                  dataKey="share"
                  nameKey="name"
                  innerRadius={66}
                  outerRadius={103}
                  paddingAngle={3}
                  stroke="none"
                >
                  {customerSegments.map((item, index) => (
                    <Cell
                      fill={["#126b50", "#f4a261", "#97c9b5", "#9268a6"][index]}
                      key={item.name}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="More than a first order"
        title="Give campus regulars a reason to return."
      >
        <div className="cc-retention-grid">
          {customerRetention.map((item) => (
            <Card className="cc-retention-card" key={item.title}>
              <span className="cc-check">
                <Check size={16} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Card>
          ))}
        </div>
      </Section>
      <CtaBand
        title="Find your place in the campus community."
        description="Join the waitlist, partner as a vendor or deliver between classes."
      />
    </>
  );
}

export function MarketPage() {
  usePageMeta(
    "Market & competition",
    "Market research and competitor context for UniSwap CampusCart at SLIIT Malabe.",
  );
  return (
    <>
      <PageIntro
        eyebrow="A close-to-campus opportunity"
        title="A big market, right on the doorstep."
        description="The initial opportunity is focused on SLIIT Malabe: a concentrated campus community with everyday local commerce needs."
      />
      <Section
        eyebrow="The opportunity"
        title="Hyper-local, by design."
        description="Market sizing figures are estimates from the student business plan."
      >
        <div className="cc-stat-grid cc-stat-grid-four">
          <StatCard value={marketOverview.malabeStudents} label="students at SLIIT Malabe" />
          <StatCard value={marketOverview.sliitNetwork} label="students in the SLIIT network" />
          <StatCard value={marketOverview.annualSpend} label="estimated annual spend" />
          <StatCard value={marketOverview.potentialDailyUsers} label="potential daily users" />
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Where orders happen today"
        title="Room to bring local options together."
      >
        <div className="cc-market-chart-grid">
          <ChartCard
            title="Current market split"
            caption="Plan estimate for campus food and convenience"
          >
            <ResponsiveContainer height={285} width="100%">
              <PieChart>
                <Pie
                  data={marketShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={102}
                  paddingAngle={3}
                  stroke="none"
                >
                  {marketShare.map((item) => (
                    <Cell fill={item.color} key={item.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <div className="cc-edge-list">
            <span className="cc-eyebrow">CampusCart's edge</span>
            <h3>Local is the advantage.</h3>
            {marketAdvantages.map((item) => (
              <p key={item}>
                <Check size={17} />
                {item}
              </p>
            ))}
          </div>
        </div>
      </Section>
      <Section
        eyebrow="The alternatives"
        title="A different fit for a campus day."
        description="Comparison reflects the competitor categories and claims provided in the business-plan brief."
      >
        <DataTable
          caption="Competitor products, customer value, advertising, strengths and limitations"
          columns={competitorColumns}
          rows={competitors}
          rowKey={(row) => row.name}
        />
      </Section>
      <CtaBand
        title="Make the local campus network stronger."
        description="Help build a marketplace where campus customers, vendors and student partners grow together."
      />
    </>
  );
}

export function SwotPage() {
  usePageMeta(
    "SWOT analysis",
    "Interactive strengths, weaknesses, opportunities and threats for CampusCart.",
  );
  const [expanded, setExpanded] = useState<string | null>("Strengths");
  return (
    <>
      <PageIntro
        eyebrow="The honest opportunity"
        title="A plan with strengths, and a plan for the hard parts."
        description="Explore the factors that shape the CampusCart opportunity. Proposed mitigations are identified as proposals, not completed actions."
      />
      <Section
        eyebrow="Click a quadrant to explore"
        title="CampusCart SWOT"
        description="Open each panel for the complete assessment."
      >
        <div className="cc-swot-grid">
          {(Object.entries(swot) as [keyof typeof swot, string[]][]).map(([quadrant, items]) => (
            <Card
              className={`cc-swot-card cc-swot-${quadrant.toLowerCase()} ${expanded === quadrant ? "is-expanded" : ""}`}
              key={quadrant}
            >
              <button
                aria-expanded={expanded === quadrant}
                className="cc-swot-trigger"
                onClick={() => setExpanded(expanded === quadrant ? null : quadrant)}
                type="button"
              >
                <span className="cc-swot-letter">{quadrant.slice(0, 1)}</span>
                <span>
                  <small>
                    CampusCart /{" "}
                    {quadrant === "Strengths"
                      ? "Internal advantage"
                      : quadrant === "Weaknesses"
                        ? "Internal challenge"
                        : quadrant === "Opportunities"
                          ? "External opening"
                          : "External risk"}
                  </small>
                  <strong>{quadrant}</strong>
                </span>
                <ChevronRight className={expanded === quadrant ? "is-rotated" : ""} size={19} />
              </button>
              {expanded === quadrant && (
                <div className="cc-swot-detail">
                  <ul>
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {swotMitigations[quadrant] && (
                    <p className="cc-mitigation">
                      <Shield size={16} />
                      <span>{swotMitigations[quadrant]}</span>
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </Section>
      <CtaBand
        title="Turn local insight into a campus advantage."
        description="See the launch plan and the people behind the project."
      />
    </>
  );
}

export function GrowthPage() {
  usePageMeta("Marketing & growth", "Launch and expansion strategy for CampusCart.");
  const totals = marketingCostTotals;
  return (
    <>
      <PageIntro
        eyebrow="Campus-first growth"
        title="Grow by showing up where campus life happens."
        description="Start with the communities closest to the problem, then take a proven campus playbook to new locations."
      />
      <Section eyebrow="A measured rollout" title="Three chapters of campus growth.">
        <div className="cc-growth-grid">
          {growthPlans.map((plan, index) => (
            <Card className="cc-growth-card" key={plan.title}>
              <span className="cc-growth-count">0{index + 1}</span>
              <h3>{plan.title}</h3>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>
                    <Check size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Spend by plan year"
        title="Marketing investment forecast."
        description="Cost figures are displayed exactly as stated in the financial plan."
      >
        <div className="cc-growth-chart-grid">
          <ChartCard title="Marketing costs" caption="LKR · Y1–Y3">
            <ResponsiveContainer height={270} width="100%">
              <BarChart data={totals}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value: number) => `Rs ${(value / 1000000).toFixed(0)}m`} />
                <Tooltip
                  formatter={(value) => [
                    `Rs ${Number(value).toLocaleString("en-LK")}`,
                    "Plan cost",
                  ]}
                />
                <Bar dataKey="amount" fill="#126b50" name="Marketing cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <DataTable
            caption="Marketing cost forecast in LKR"
            columns={[
              { key: "item", heading: "Plan year" },
              ...years.map((year) => ({
                key: year,
                heading: year,
                cell: () => `Rs ${totals[years.indexOf(year)].amount.toLocaleString("en-LK")}`,
              })),
            ]}
            rows={[{ item: "Marketing cost" }]}
            rowKey={(row) => row.item}
          />
        </div>
        <details className="cc-details">
          <summary>
            See marketing cost line items <ChevronRight size={17} />
          </summary>
          <DataTable
            caption="Marketing plan cost line items in LKR"
            columns={[
              { key: "item", heading: "Cost item" },
              ...years.map((year) => ({
                key: year,
                heading: year,
                cell: (row: (typeof marketingCosts)[number]) =>
                  `Rs ${row[year].toLocaleString("en-LK")}`,
              })),
            ]}
            rows={marketingCosts}
            rowKey={(row) => row.item}
          />
        </details>
      </Section>
      <CtaBand
        title="Start on one campus. Learn for the next."
        description="Local communities are the first chapter of a much bigger campus network."
      />
    </>
  );
}

export function OperationsPage() {
  usePageMeta(
    "Operations",
    "The distributed campus delivery model, student partner organization and safety plan.",
  );
  return (
    <>
      <PageIntro
        eyebrow="Light on footprint, close to campus"
        title="A Campus Command Hub, wherever the work happens."
        description="The proposed asset-light model combines a small campus support presence with cloud infrastructure and a flexible student partner network."
      />
      <Section eyebrow="How the team connects" title="Clear roles, one campus mission.">
        <div className="cc-org-top">
          <Card className="cc-org-lead">
            <span>Shared leadership</span>
            <strong>CampusCart founding team</strong>
          </Card>
          <div className="cc-org-branches">
            {operationsGroups.map((group) => (
              <div className="cc-org-branch" key={group.title}>
                <Card className="cc-org-card">
                  <strong>{group.title}</strong>
                </Card>
                <div>
                  {group.children.map((child) => (
                    <Card className="cc-org-child" key={child}>
                      {child}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Designed for everyday delivery"
        title="Operations that support people and place."
      >
        <div className="cc-operations-grid">
          {operationalPillars.map((pillar) => (
            <Card className="cc-operation-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <ul>
                {pillar.items.map((item) => (
                  <li key={item}>
                    <Check size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <CtaBand
        title="Local partners are at the heart of the model."
        description="Learn about vendor onboarding and student delivery opportunities."
      />
    </>
  );
}

export function RoadmapPage() {
  usePageMeta("Risks & roadmap", "CampusCart launch timeline, expansion goals and risk register.");
  return (
    <>
      <PageIntro
        eyebrow="Roadmap & readiness"
        title="Start close. Build with intention."
        description="A focused first campus, measured expansion and a longer-term vision for campus commerce."
      />
      <Section eyebrow="The plan" title="From launch to a connected network.">
        <div className="cc-roadmap">
          {roadmapTimeline.map((item) => (
            <div className="cc-roadmap-item" key={item.period}>
              <span className="cc-roadmap-dot" />
              <Card>
                <span className="cc-eyebrow">{item.period}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="What success looks like"
        title="Objectives to keep the team focused."
        description="Progress-style KPI cards show plan targets, not verified current performance."
      >
        <div className="cc-kpi-grid">
          {objectives.map((kpi) => (
            <Card className="cc-kpi-card" key={kpi.value}>
              <div className="cc-kpi-heading">
                <strong>{kpi.value}</strong>
                <span>Target</span>
              </div>
              <p>{kpi.label}</p>
              <div aria-label="Objective, progress not yet reported" className="cc-kpi-track">
                <i />
              </div>
              <small>Plan objective · progress not reported</small>
            </Card>
          ))}
        </div>
      </Section>
      <Section
        eyebrow="Risks & responses"
        title="Plan for the bumps, not just the launch."
        description="Likelihood and impact levels are qualitative planning assessments; proposed responses are not represented as implemented controls."
      >
        <DataTable
          caption="Risk register and proposed responses"
          columns={[
            { key: "risk", heading: "Risk" },
            { key: "likelihood", heading: "Likelihood" },
            { key: "impact", heading: "Impact" },
            { key: "response", heading: "Proposed mitigation" },
          ]}
          rows={riskRegister}
          rowKey={(row) => row.risk}
        />
      </Section>
      <Section
        className="cc-status-section"
        eyebrow="Where things stand"
        title="Early work already underway."
      >
        <div className="cc-status-list">
          {launchReadiness.map((status) => (
            <Card key={status}>
              <Check size={18} />
              <span>{status}</span>
            </Card>
          ))}
        </div>
      </Section>
      <CtaBand
        title="Help bring the first campus launch to life."
        description="Join early access and follow the journey from first order to next campus."
      />
    </>
  );
}

export function AboutPage() {
  usePageMeta(
    "About & team",
    "Meet the student team behind UniSwap CampusCart and read the vision, mission and values.",
  );
  return (
    <>
      <PageIntro
        eyebrow="A campus idea, built by students"
        title="A little more time for the things that matter."
        description="UniSwap – Campus Cart is a student-founded hyper-local commerce and delivery concept for SLIIT Malabe."
      />
      <Section eyebrow="Why we're here" title="A more connected campus ecosystem.">
        <div className="cc-purpose-grid">
          <Card className="cc-purpose-card">
            <span className="cc-eyebrow">Our vision</span>
            <h3>{aboutContent.vision}</h3>
          </Card>
          <Card className="cc-purpose-card cc-purpose-dark">
            <span className="cc-eyebrow">Our mission</span>
            <h3>{aboutContent.mission}</h3>
          </Card>
        </div>
        <div className="cc-values-grid">
          {aboutContent.values.map((value, index) => (
            <Card key={value}>
              <span>0{index + 1}</span>
              <h3>{value}</h3>
            </Card>
          ))}
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Four founders, one campus"
        title="Meet the team."
        description={`Fourth-year Faculty of Computing undergraduates · ${aboutDetails.ownershipShare} ownership each · ${aboutDetails.submission}.`}
      >
        <div className="cc-team-grid">
          {team.map((member) => (
            <Card className="cc-team-card" key={member.id}>
              <div aria-hidden="true" className="cc-avatar">
                {member.initials}
              </div>
              <span className="cc-team-role">{member.role}</span>
              <h3>{member.name}</h3>
              <small>
                {member.id} · {aboutDetails.ownershipShare} ownership
              </small>
              <p>{member.focus}</p>
            </Card>
          ))}
        </div>
        <div className="cc-skills">
          <span className="cc-eyebrow">Team capabilities</span>
          <p>{aboutDetails.skills.join(" · ")}</p>
        </div>
      </Section>
      <Section eyebrow="Business details" title="Registered to grow from Malabe.">
        <div className="cc-business-grid">
          <Card>
            <span className="cc-eyebrow">Business</span>
            <h3>UniSwap – Campus Cart</h3>
            <p>
              Established {aboutDetails.established} · Registration {aboutDetails.registration}
            </p>
            <p>{aboutDetails.registrationAuthority}</p>
          </Card>
          <Card>
            <span className="cc-eyebrow">Find us</span>
            <h3>SLIIT Innovation Hub</h3>
            <p>New Kandy Road, Malabe</p>
            <p>
              <a href={`tel:${brand.phoneLink}`}>{brand.phone}</a> ·{" "}
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </p>
            <p>{brand.website}</p>
          </Card>
        </div>
      </Section>
      <CtaBand
        title="A campus platform should belong to its community."
        description="Get involved as a customer, campus vendor, delivery partner or ambassador."
      />
    </>
  );
}
