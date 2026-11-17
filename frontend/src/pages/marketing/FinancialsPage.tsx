import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Check, ChevronDown, Landmark } from "lucide-react";
import {
  cashFlow,
  costBuildUps,
  depreciation,
  financialAssumptions,
  loanTerms,
  marketingCosts,
  monthlyCashFlow,
  monthlyUnits,
  profitAndLoss,
  projectFunding,
  ratios,
  revenueStreams,
  years,
  type FinancialYear,
} from "../../data/financials";
import { team } from "../../data/site";
import { usePageMeta } from "../../hooks/usePageMeta";
import { calculateLoanSchedule, formatLkr } from "../../lib/campusCartCalculators";
import {
  Card,
  ChartCard,
  DataTable,
  FormField,
  PageIntro,
  Section,
  Tabs,
  type TableColumn,
} from "../../components/ui/MarketingUI";

type DashboardTab = "sales" | "profit" | "cash" | "funding" | "loan" | "assumptions";
const dashboardTabs: { id: DashboardTab; label: string }[] = [
  { id: "sales", label: "Sales forecast" },
  { id: "profit", label: "Profit & loss" },
  { id: "cash", label: "Cash flow" },
  { id: "funding", label: "Funding & assets" },
  { id: "loan", label: "Loan" },
  { id: "assumptions", label: "Ratios & assumptions" },
];

const unitsRows = monthlyUnits.map((row) => ({
  stream: row.stream,
  ...Object.fromEntries(row.values.map((value, index) => [`M${index + 1}`, value])),
  total: row.total,
}));

const loanColumns = [
  { key: "month", heading: "Month" },
  {
    key: "openingBalance",
    heading: "Opening balance",
    cell: (row: LoanRow) => formatLkr(row.openingBalance),
  },
  { key: "capital", heading: "Capital", cell: (row: LoanRow) => formatLkr(row.capital) },
  { key: "interest", heading: "Interest", cell: (row: LoanRow) => formatLkr(row.interest) },
  { key: "payment", heading: "Payment", cell: (row: LoanRow) => formatLkr(row.payment) },
  {
    key: "closingBalance",
    heading: "Closing balance",
    cell: (row: LoanRow) => formatLkr(row.closingBalance),
  },
] satisfies TableColumn<LoanRow>[];

type LoanRow = ReturnType<typeof calculateLoanSchedule>[number];

function YearSelector({
  selected,
  onChange,
}: {
  selected: FinancialYear;
  onChange: (year: FinancialYear) => void;
}) {
  return (
    <Tabs
      items={years.map((year) => ({ id: year, label: year }))}
      label="Select financial year"
      onChange={(year) => onChange(year as FinancialYear)}
      selected={selected}
    />
  );
}

export default function FinancialsPage() {
  usePageMeta(
    "Financials",
    "Interactive UniSwap sales, profit and loss, cash-flow, funding and loan projections.",
  );
  const [activeTab, setActiveTab] = useState<DashboardTab>("sales");
  const [selectedYear, setSelectedYear] = useState<FinancialYear>("Y1");
  const [visibleStreams, setVisibleStreams] = useState<string[]>(
    revenueStreams.map((stream) => stream.name),
  );
  const [loanAmount, setLoanAmount] = useState(loanTerms.amount);
  const [loanRate, setLoanRate] = useState(loanTerms.annualRatePercent);
  const [loanMonths, setLoanMonths] = useState(loanTerms.months);
  const loanSchedule = useMemo(
    () => calculateLoanSchedule(loanAmount, loanRate, loanMonths),
    [loanAmount, loanMonths, loanRate],
  );
  const loanYearly = loanTerms.planYearlyTotals;
  const revenueByYear = years.map((year) => ({
    year,
    ...Object.fromEntries(revenueStreams.map((stream) => [stream.name, stream[year]])),
  }));
  const pAndLChartRows = profitAndLoss.map((row) => ({
    item: row.item,
    amount: row[selectedYear],
  }));
  const loanYearColumns: TableColumn<(typeof loanYearly)[number]>[] = [
    { key: "year", heading: "Plan year" },
    { key: "capital", heading: "Capital", cell: (row) => formatLkr(row.capital) },
    { key: "interest", heading: "Interest", cell: (row) => formatLkr(row.interest) },
  ];

  function toggleStream(name: string) {
    setVisibleStreams((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="The numbers behind the idea"
        title="A transparent look at the plan."
        description="Explore the student business plan's sales forecast, cost assumptions, cash flow and financing."
      />
      <Section
        className="cc-financial-section"
        eyebrow="Planning dashboard"
        title="Three years, several ways to look."
      >
        <p className="cc-financial-disclaimer">
          Projections are estimates from the student business plan, not guarantees.
        </p>
        <Tabs
          items={dashboardTabs}
          label="Financial dashboard sections"
          onChange={(tab) => setActiveTab(tab as DashboardTab)}
          selected={activeTab}
        />

        {activeTab === "sales" && (
          <div
            aria-labelledby={`cc-tab-${activeTab}`}
            className="cc-dashboard-panel"
            id={`cc-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="cc-chart-control-row">
              <div>
                <h3>Revenue by stream</h3>
                <p>Stacked revenue forecast · LKR</p>
              </div>
              <div className="cc-chart-legend">
                {revenueStreams.map((stream) => (
                  <button
                    aria-pressed={visibleStreams.includes(stream.name)}
                    key={stream.name}
                    onClick={() => toggleStream(stream.name)}
                    type="button"
                  >
                    <i style={{ background: stream.color }} />
                    {stream.name}
                  </button>
                ))}
              </div>
            </div>
            <ChartCard
              title="Sales forecast"
              caption="Toggle a legend item to show or hide its series"
            >
              <ResponsiveContainer height={350} width="100%">
                <BarChart data={revenueByYear}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value: number) => `Rs ${(value / 1000000).toFixed(0)}m`} />
                  <Tooltip formatter={(value) => [formatLkr(Number(value)), "Revenue"]} />
                  {revenueStreams
                    .filter((stream) => visibleStreams.includes(stream.name))
                    .map((stream) => (
                      <Bar
                        dataKey={stream.name}
                        fill={stream.color}
                        key={stream.name}
                        name={stream.name}
                        stackId="revenue"
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="cc-stat-grid cc-stat-grid-three">
              {years.map((year) => (
                <Card className="cc-funding-stat" key={year}>
                  <span className="cc-eyebrow">{year} sales total</span>
                  <strong>{formatLkr(profitAndLoss[0][year])}</strong>
                  <small>Plan revenue projection</small>
                </Card>
              ))}
            </div>
            <div className="cc-table-heading">
              <h3>Year-one monthly units</h3>
              <p>Plan units by stream · monthly totals are reproduced as provided</p>
            </div>
            <DataTable
              caption="Year-one monthly units by revenue stream"
              columns={[
                { key: "stream", heading: "Stream" },
                ...Array.from({ length: 12 }, (_, index) => ({
                  key: `M${index + 1}`,
                  heading: `M${index + 1}`,
                })),
                { key: "total", heading: "Total" },
              ]}
              rows={unitsRows}
              rowKey={(row) => row.stream}
            />
          </div>
        )}

        {activeTab === "profit" && (
          <div
            aria-labelledby={`cc-tab-${activeTab}`}
            className="cc-dashboard-panel"
            id={`cc-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="cc-year-controls">
              <div>
                <h3>Projected profit & loss</h3>
                <p>Plan figures in LKR</p>
              </div>
              <YearSelector onChange={setSelectedYear} selected={selectedYear} />
            </div>
            <ChartCard
              title={`Profit & loss · ${selectedYear}`}
              caption="Select a plan year to explore the projected line items"
            >
              <ResponsiveContainer height={340} width="100%">
                <BarChart data={pAndLChartRows} layout="vertical" margin={{ left: 36, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(value: number) => `Rs ${(value / 1000000).toFixed(0)}m`}
                  />
                  <YAxis dataKey="item" type="category" width={210} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [formatLkr(Number(value)), "Amount"]} />
                  <Bar dataKey="amount" fill="#126b50" name="Amount" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <DataTable
              caption="Projected profit and loss in LKR"
              columns={[
                { key: "item", heading: "Line item" },
                ...years.map((year) => ({
                  key: year,
                  heading: year,
                  cell: (row: (typeof profitAndLoss)[number]) => formatLkr(row[year]),
                })),
              ]}
              rows={profitAndLoss}
              rowKey={(row) => row.item}
            />
          </div>
        )}

        {activeTab === "cash" && (
          <div
            aria-labelledby={`cc-tab-${activeTab}`}
            className="cc-dashboard-panel"
            id={`cc-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="cc-stat-grid cc-stat-grid-three">
              <Card className="cc-funding-stat">
                <span className="cc-eyebrow">Plan-reported sales total</span>
                <strong>{cashFlow.salesTotal.toLocaleString("en-LK")}</strong>
                <small>LKR thousands</small>
              </Card>
              <Card className="cc-funding-stat">
                <span className="cc-eyebrow">Month-one loan funds</span>
                <strong>{cashFlow.loanFunds.toLocaleString("en-LK")}</strong>
                <small>LKR thousands</small>
              </Card>
              <Card className="cc-funding-stat">
                <span className="cc-eyebrow">Month-one purchases</span>
                <strong>{cashFlow.purchases.toLocaleString("en-LK")}</strong>
                <small>LKR thousands</small>
              </Card>
            </div>
            <ChartCard
              title="Year-one monthly cash flow"
              caption="Plan values in LKR thousands · the balance and sales series are shown as given"
            >
              <ResponsiveContainer height={350} width="100%">
                <LineChart data={monthlyCashFlow}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value: number) => value.toLocaleString("en-LK")} />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toLocaleString("en-LK")} (LKR thousands)`,
                      "",
                    ]}
                  />
                  <Legend />
                  <Line
                    dataKey="sales"
                    name="Sales"
                    stroke="#f4a261"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    dataKey="balance"
                    name="Cumulative balance"
                    stroke="#126b50"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="cc-cash-flow-note">
              <Landmark size={17} />
              <span>
                Loan funds of {cashFlow.loanFunds.toLocaleString("en-LK")} and purchases of{" "}
                {cashFlow.purchases.toLocaleString("en-LK")} are stated for month one in the plan's
                LKR-thousands cash-flow section.
              </span>
            </div>
            <DataTable
              caption="Year-one monthly cash flow in LKR thousands"
              columns={[
                { key: "month", heading: "Month" },
                { key: "sales", heading: "Sales" },
                { key: "balance", heading: "Cumulative balance" },
              ]}
              rows={monthlyCashFlow}
              rowKey={(row) => row.month}
            />
          </div>
        )}

        {activeTab === "funding" && (
          <div
            aria-labelledby={`cc-tab-${activeTab}`}
            className="cc-dashboard-panel"
            id={`cc-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="cc-stat-grid cc-stat-grid-three">
              <Card className="cc-funding-stat">
                <span className="cc-eyebrow">Cost of project</span>
                <strong>{formatLkr(projectFunding.projectCost)}</strong>
                <small>Cost-of-project figure as stated in the plan</small>
              </Card>
              <Card className="cc-funding-stat">
                <span className="cc-eyebrow">Equity</span>
                <strong>{formatLkr(projectFunding.equity)}</strong>
                <small>Means of finance</small>
              </Card>
              <Card className="cc-funding-stat">
                <span className="cc-eyebrow">Loan</span>
                <strong>{formatLkr(projectFunding.loan)}</strong>
                <small>Means of finance</small>
              </Card>
            </div>
            <div className="cc-data-grid">
              <DataTable
                caption="Project assets and cost in LKR"
                columns={[
                  { key: "item", heading: "Asset" },
                  { key: "amount", heading: "Amount", cell: (row) => formatLkr(row.amount) },
                ]}
                rows={projectFunding.assets}
                rowKey={(row) => row.item}
              />
              <DataTable
                caption="Depreciation by asset and year in LKR"
                columns={[
                  { key: "item", heading: "Asset" },
                  { key: "life", heading: "Life" },
                  ...years.map((year) => ({
                    key: year,
                    heading: year,
                    cell: (row: (typeof depreciation)[number]) => formatLkr(row[year]),
                  })),
                ]}
                rows={depreciation}
                rowKey={(row) => row.item}
              />
            </div>
            <DataTable
              caption="Means of finance in LKR"
              columns={[
                { key: "name", heading: "Source" },
                { key: "amount", heading: "Amount", cell: (row) => formatLkr(row.amount) },
              ]}
              rows={[
                { name: "Equity", amount: projectFunding.equity },
                { name: "Loan", amount: projectFunding.loan },
              ]}
              rowKey={(row) => row.name}
            />
            <p className="cc-note">
              The plan lists a Rs 1,200,000 asset/depreciation base and a Rs 1,245,000 cost of
              project. See DATA_NOTES.md for the source conflict.
            </p>
          </div>
        )}

        {activeTab === "loan" && (
          <div
            aria-labelledby={`cc-tab-${activeTab}`}
            className="cc-dashboard-panel"
            id={`cc-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="cc-loan-grid">
              <Card className="cc-loan-input-card">
                <span className="cc-eyebrow">Loan calculator</span>
                <h3>Change the assumptions.</h3>
                <FormField
                  id="cc-loan-amount"
                  label="Loan amount (LKR)"
                  max={100000000}
                  min={1}
                  onChange={(value) => setLoanAmount(Math.max(1, Number(value) || 1))}
                  type="number"
                  value={loanAmount}
                />
                <FormField
                  id="cc-loan-rate"
                  label="Annual interest rate (%)"
                  max={100}
                  min={0}
                  onChange={(value) => setLoanRate(Math.max(0, Number(value) || 0))}
                  step={0.1}
                  type="number"
                  value={loanRate}
                />
                <FormField
                  id="cc-loan-months"
                  label="Repayment term (months)"
                  max={600}
                  min={1}
                  onChange={(value) => setLoanMonths(Math.max(1, Math.floor(Number(value) || 1)))}
                  type="number"
                  value={loanMonths}
                />
                <div className="cc-loan-slider">
                  <label htmlFor="cc-loan-term-slider">
                    Adjust repayment term <strong>{loanMonths} months</strong>
                  </label>
                  <input
                    id="cc-loan-term-slider"
                    max={120}
                    min={6}
                    onChange={(event) => setLoanMonths(Number(event.target.value))}
                    type="range"
                    value={loanMonths}
                  />
                </div>
              </Card>
              <ChartCard
                title="Monthly payment profile"
                caption="Reducing-balance principal repayment; recalculated from inputs"
              >
                <ResponsiveContainer height={270} width="100%">
                  <LineChart data={loanSchedule}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={(month: number) => `M${month}`} />
                    <YAxis tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [formatLkr(Number(value)), "Payment"]} />
                    <Line
                      dataKey="payment"
                      name="Monthly payment"
                      stroke="#126b50"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div className="cc-table-heading">
              <h3>Plan-stated yearly loan totals</h3>
              <p>
                Reproduced from the business plan, separately from the interactive reducing-balance
                schedule.
              </p>
            </div>
            <DataTable
              caption="Plan-stated yearly loan capital and interest in LKR"
              columns={loanYearColumns}
              rows={loanYearly}
              rowKey={(row) => row.year}
            />
            <div className="cc-table-heading">
              <h3>Interactive amortization schedule</h3>
              <p>
                {loanSchedule.length} monthly instalments · computed using the entered annual rate
                and term
              </p>
            </div>
            <DataTable
              caption="Interactive monthly loan amortization schedule in LKR"
              columns={loanColumns}
              rows={loanSchedule}
              rowKey={(row) => String(row.month)}
            />
            <details className="cc-details">
              <summary>
                Cost details <ChevronDown size={17} />
              </summary>
              <div className="cc-data-grid">
                <DataTable
                  caption="Cost build-ups in LKR"
                  columns={[
                    { key: "item", heading: "Cost item" },
                    ...years.map((year) => ({
                      key: year,
                      heading: year,
                      cell: (row: { item: string; Y1: number; Y2: number; Y3: number }) =>
                        formatLkr(row[year]),
                    })),
                  ]}
                  rows={[
                    { item: "Raw material / inputs", ...costBuildUps.rawInputs },
                    { item: "Production cost", ...costBuildUps.production },
                    { item: "Admin cost", ...costBuildUps.administration },
                    { item: "Marketing cost", ...costBuildUps.marketing },
                  ]}
                  rowKey={(row) => row.item}
                />
                <div className="cc-input-notes">
                  <h3>Raw material / input assumptions</h3>
                  {costBuildUps.inputNotes.map((note) => (
                    <p key={note}>
                      <Check size={15} />
                      {note}
                    </p>
                  ))}
                </div>
              </div>
              <DataTable
                caption="Marketing cost line items in LKR"
                columns={[
                  { key: "item", heading: "Marketing item" },
                  ...years.map((year) => ({
                    key: year,
                    heading: year,
                    cell: (row: (typeof marketingCosts)[number]) => formatLkr(row[year]),
                  })),
                ]}
                rows={marketingCosts}
                rowKey={(row) => row.item}
              />
              <p className="cc-note">
                The detailed marketing cost build-up is shown as supplied. The plan's marketing
                totals differ from the marketing & distribution expense in its projected P&L.
              </p>
              <div className="cc-table-heading">
                <h3>Team and labour roles</h3>
                <p>
                  Role details are available; reconciled labour totals were not supplied in the
                  brief.
                </p>
              </div>
              <DataTable
                caption="Team and labour roles"
                columns={[
                  { key: "name", heading: "Team member" },
                  { key: "role", heading: "Role" },
                  { key: "focus", heading: "Responsibility" },
                ]}
                rows={team}
                rowKey={(row) => row.id}
              />
            </details>
          </div>
        )}

        {activeTab === "assumptions" && (
          <div
            aria-labelledby={`cc-tab-${activeTab}`}
            className="cc-dashboard-panel"
            id={`cc-panel-${activeTab}`}
            role="tabpanel"
            tabIndex={0}
          >
            <DataTable
              caption="Financial ratios by plan year"
              columns={[
                { key: "item", heading: "Ratio" },
                ...years.map((year) => ({ key: year, heading: year })),
              ]}
              rows={ratios}
              rowKey={(row) => row.item}
            />
            <Card className="cc-assumption-card">
              <span className="cc-eyebrow">Read with care</span>
              <h3>What these projections are—and aren't.</h3>
              <ul>
                {financialAssumptions.map((item) => (
                  <li key={item}>
                    <Check size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                The plan reports gross-profit ratios of {ratios[0].Y1}–{ratios[0].Y3} and net-profit
                ratios of {ratios[1].Y1}–{ratios[1].Y3}, while other sections cite lower
                gross-margin targets. These source figures are preserved; see DATA_NOTES.md.
              </p>
            </Card>
          </div>
        )}
      </Section>
      <div className="cc-container cc-financial-footnote">
        <p>Projections are estimates from the student business plan, not guarantees.</p>
      </div>
    </>
  );
}
