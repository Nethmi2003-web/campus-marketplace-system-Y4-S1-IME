import { ArrowDownRight, ArrowRight, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  appPreview,
  appPreviewStatus,
  brand,
  comparison,
  homeContent,
  homeStats,
  orderSteps,
  sampleQuotes,
  services,
  marketShare,
} from "../../data/site";
import { usePageMeta } from "../../hooks/usePageMeta";
import { CtaBand, Card, ChartCard, Section, StatCard } from "../../components/ui/MarketingUI";

const iconByService = {
  utensils: "◒",
  notebook: "▤",
  heart: "♡",
  crown: "♛",
  megaphone: "◉",
  calendar: "▦",
};
const iconByProblem = {
  clock: <Clock3 size={19} />,
  arrow: <ArrowRight size={19} />,
  location: <MapPin size={19} />,
};

export default function HomePage() {
  usePageMeta(
    "Campus essentials, made easy",
    `${brand.tagline} A student-powered campus delivery platform for SLIIT Malabe.`,
  );
  return (
    <>
      <section className="cc-hero">
        <div className="cc-container cc-hero-grid">
          <div className="cc-hero-copy">
            <div className="cc-hero-pill">
              <span /> Your campus, a little closer
            </div>
            <h1>
              Campus essentials.
              <br />
              <span>Right when</span> you need them.
            </h1>
            <p className="cc-hero-description">
              {brand.tagline} From your favourite canteen to last-minute stationery, campus life
              just got easier.
            </p>
            <div className="cc-hero-actions">
              <Link className="cc-button" to="/join">
                Get early access <ArrowRight size={17} />
              </Link>
              <Link className="cc-button cc-button-outline" to="/join?type=partner">
                Become a delivery partner <ArrowDownRight size={17} />
              </Link>
            </div>
            <div className="cc-hero-note">
              <ShieldCheck size={16} /> Student-powered · Local vendors · Made for SLIIT
            </div>
          </div>
          <div aria-label="UniSwap app preview" className="cc-hero-visual">
            <div className="cc-orbit cc-orbit-one" />
            <div className="cc-orbit cc-orbit-two" />
            <div className="cc-floating-note cc-note-time">
              <Clock3 size={15} /> {appPreviewStatus.around}
            </div>
            <div className="cc-floating-note cc-note-location">
              <MapPin size={15} /> SLIIT Malabe
            </div>
            <div className="cc-phone">
              <div className="cc-phone-top">
                <span className="cc-phone-speaker" />
                <span className="cc-phone-camera" />
              </div>
              <div className="cc-phone-screen">
                <div className="cc-phone-greeting">
                  <small>MONDAY, MALABE</small>
                  <strong>
                    Hey there, <span>campus star</span> ✦
                  </strong>
                </div>
                <div className="cc-search-faux">
                  ⌕ <span>What are you craving?</span>
                  <span className="cc-filter">☷</span>
                </div>
                <div className="cc-phone-section-title">
                  <b>Good around you</b>
                  <span>See all →</span>
                </div>
                <div className="cc-preview-list">
                  {appPreview.map((item) => (
                    <div className="cc-preview-item" key={item.name}>
                      <div className={`cc-food-icon cc-food-${item.color}`}>{item.symbol}</div>
                      <div className="cc-food-copy">
                        <b>{item.name}</b>
                        <small>{item.type}</small>
                      </div>
                      <strong>{item.price}</strong>
                    </div>
                  ))}
                </div>
                <div className="cc-live-order">
                  <div className="cc-live-icon">
                    <MapPin size={17} />
                  </div>
                  <div>
                    <b>Your order is on its way</b>
                    <small>{appPreviewStatus.inTransit}</small>
                    <div className="cc-progress">
                      <i />
                    </div>
                  </div>
                  <span className="cc-live-dot" />
                </div>
                <div className="cc-phone-nav">
                  <span>
                    ⌂<small>Explore</small>
                  </span>
                  <span>
                    ♡<small>Saved</small>
                  </span>
                  <span>
                    ◷<small>Orders</small>
                  </span>
                  <span>
                    ☺<small>Profile</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="cc-sparkle cc-sparkle-a">
              <Sparkles size={20} />
            </div>
            <div className="cc-sparkle cc-sparkle-b">✳</div>
          </div>
        </div>
      </section>

      <section aria-label="UniSwap highlights" className="cc-stats-strip">
        <div className="cc-container cc-stats-grid">
          {homeStats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      <Section
        className="cc-problem-section"
        eyebrow={homeContent.problemEyebrow}
        title={homeContent.problemTitle}
        description={homeContent.problemDescription}
      >
        <div className="cc-problem-grid">
          {homeContent.problemCards.map((problem, index) => (
            <Card className="cc-problem-card" key={problem.title}>
              <span
                className={`cc-card-icon ${["cc-icon-peach", "cc-icon-green", "cc-icon-lavender"][index]}`}
              >
                {iconByProblem[problem.icon as keyof typeof iconByProblem]}
              </span>
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="cc-steps-section"
        eyebrow="Simple as a swap"
        title="From tap to doorstep."
        description="A clear six-step journey, with campus partners at every hand-off."
      >
        <div className="cc-step-grid">
          {orderSteps.map((step, index) => (
            <Card className="cc-step-card" key={step.title}>
              <span className="cc-step-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="cc-step-dot" />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Card>
          ))}
        </div>
        <div className="cc-center-link">
          <Link className="cc-text-link" to="/how-it-works">
            See how it works <ArrowRight size={16} />
          </Link>
        </div>
      </Section>

      <Section
        className="cc-service-section"
        eyebrow="One campus cart, many little wins"
        title="The things you need. The places you love."
        description="A considered mix of campus favourites and Malabe local businesses."
      >
        <div className="cc-service-grid">
          {services.map((service) => (
            <Card className="cc-service-card" key={service.title}>
              <span className="cc-card-icon">
                {iconByService[service.icon as keyof typeof iconByService]}
              </span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <Link aria-label={`Learn about ${service.title}`} to="/pricing">
                Explore <ArrowRight size={14} />
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="cc-comparison-section"
        eyebrow="A better fit for campus"
        title="Campus convenience, on your terms."
        description="Plan figures for UniSwap and the ranges cited in the student business plan."
      >
        <div className="cc-table-wrap cc-compare-wrap">
          <table className="cc-table cc-comparison-table">
            <caption>UniSwap compared with other campus and delivery options</caption>
            <thead>
              <tr>
                <th scope="col">At a glance</th>
                <th scope="col">UniSwap</th>
                <th scope="col">Third-party apps</th>
                <th scope="col">In-campus canteens</th>
                <th scope="col">Off-campus shops</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>
                    <strong>{row.campusCart}</strong>
                  </td>
                  <td>{row.otherApps}</td>
                  <td>{row.canteen}</td>
                  <td>{row.shops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        className="cc-testimonials-section"
        eyebrow="A campus idea in motion"
        title="Built around the voices we want to hear."
        description="These sample quotes are placeholders, not actual customer endorsements."
      >
        <div className="cc-quote-grid">
          {sampleQuotes.map((quote) => (
            <Card className="cc-quote-card" key={quote.name}>
              <div aria-label="Sample quote" className="cc-quote-stars">
                “
              </div>
              <blockquote>{quote.quote}</blockquote>
              <div className="cc-quote-person">
                <span>{quote.name.charAt(0)}</span>
                <div>
                  <b>{quote.name}</b>
                  <small>{quote.role}</small>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="cc-last-section"
        eyebrow="A little campus magic, made practical"
        title="Small errands. Big time back."
        description="A student-powered way to make everyday campus essentials feel closer."
      >
        <div className="cc-highlight-card">
          <div>
            <h3>UniSwap is being built for the in-between moments.</h3>
            <p>
              Between lectures. Before a deadline. When the canteen queue is just a little too long.
            </p>
            <Link className="cc-button" to="/join">
              Be part of the launch <ArrowRight size={16} />
            </Link>
          </div>
          <ChartCard title="Campus choices today" caption="Plan estimate for existing market split">
            <ResponsiveContainer height={210} width="100%">
              <PieChart>
                <Pie
                  data={marketShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={78}
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
            <p className="cc-note">{appPreviewStatus.disclaimer}</p>
          </ChartCard>
        </div>
      </Section>
      <CtaBand
        title="Your next campus favourite is just around the corner."
        description="Get launch updates, support local vendors and help shape a better campus day."
      />
    </>
  );
}
