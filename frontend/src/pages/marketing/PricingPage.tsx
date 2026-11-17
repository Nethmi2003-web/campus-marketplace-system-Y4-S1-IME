import { useMemo, useState } from "react";
import { ArrowRight, Check, Crown, Gift, Megaphone, PackageCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { pricing } from "../../data/pricing";
import { usePageMeta } from "../../hooks/usePageMeta";
import { calculateSavings, formatLkr } from "../../lib/campusCartCalculators";
import { Card, CtaBand, FormField, PageIntro, Section } from "../../components/ui/MarketingUI";

const included = [
  "Free delivery on eligible orders",
  "Member-only campus offers",
  "A simple monthly membership",
];

export default function PricingPage() {
  usePageMeta(
    "Pricing",
    "Transparent UniSwap delivery, Premium, vendor and campus-event pricing.",
  );
  const [ordersPerWeek, setOrdersPerWeek] = useState(pricing.calculatorExampleOrdersPerWeek);
  const [basketValue, setBasketValue] = useState(pricing.calculatorExampleBasketValue);
  const estimate = useMemo(
    () =>
      calculateSavings(
        ordersPerWeek,
        basketValue,
        pricing.premiumMonthly,
        pricing.deliveryFeeMin,
        pricing.calculatorPlatformFeeRate,
        pricing.comparisonAppFeeRate,
      ),
    [ordersPerWeek, basketValue],
  );
  const fieldValue = (value: string) => Math.max(0, Number(value) || 0);

  return (
    <>
      <PageIntro
        eyebrow="Clear prices, closer to campus"
        title="Good campus days shouldn't come with surprises."
        description="Straightforward customer options and a campus-friendly vendor model. All prices are plan figures."
      />
      <Section eyebrow="For your next order" title="Pick the way you like to campus.">
        <div className="cc-price-grid">
          <Card className="cc-price-card">
            <span className="cc-card-icon">
              <PackageCheck size={19} />
            </span>
            <span className="cc-price-label">Pay as you go</span>
            <h3>Delivery, when you need it.</h3>
            <div className="cc-price-amount">
              {formatLkr(pricing.deliveryFeeMin)}–{formatLkr(pricing.deliveryFeeMax)}
              <small> / order</small>
            </div>
            <p>
              Delivery fees vary by order. New customers get free delivery on their first{" "}
              {pricing.launchFreeOrders} orders.
            </p>
            <Link className="cc-text-link" to="/join">
              Get early access <ArrowRight size={16} />
            </Link>
          </Card>
          <Card className="cc-price-card cc-price-featured">
            <span className="cc-price-badge">For campus regulars</span>
            <span className="cc-card-icon">
              <Crown size={19} />
            </span>
            <span className="cc-price-label">UniSwap Premium</span>
            <h3>One membership. More campus freedom.</h3>
            <div className="cc-price-amount">
              {formatLkr(pricing.premiumMonthly)}
              <small> / month</small>
            </div>
            <ul>
              {included.map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="cc-button" to="/join">
              Join the waitlist <ArrowRight size={16} />
            </Link>
          </Card>
          <Card className="cc-price-card">
            <span className="cc-card-icon">
              <Gift size={19} />
            </span>
            <span className="cc-price-label">Pass it along</span>
            <h3>Good friends, good credit.</h3>
            <div className="cc-price-amount">
              {formatLkr(pricing.referralCredit)}
              <small> each</small>
            </div>
            <p>
              The referring customer and their friend each receive referral credit, as described in
              the plan.
            </p>
            <span className="cc-text-muted">Points-based loyalty rewards, too.</span>
          </Card>
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Make the numbers personal"
        title="Your campus delivery savings calculator."
        description="Enter a weekly order habit and basket size to compare an illustrative monthly delivery-fee cost."
      >
        <div className="cc-calculator-grid">
          <Card className="cc-calculator-inputs">
            <span className="cc-eyebrow">Your estimate</span>
            <h3>How often do you order?</h3>
            <FormField
              id="cc-orders-per-week"
              label="Orders per week"
              max={50}
              min={0}
              onChange={(value) => setOrdersPerWeek(fieldValue(value))}
              type="number"
              value={ordersPerWeek}
            />
            <FormField
              id="cc-basket-value"
              label="Average basket value (LKR)"
              max={1000000}
              min={0}
              onChange={(value) => setBasketValue(fieldValue(value))}
              step={100}
              type="number"
              value={basketValue}
            />
            <div className="cc-calculator-assumption">
              For comparison, this estimate uses a{" "}
              {Math.round(pricing.calculatorPlatformFeeRate * 100)}% UniSwap platform fee, the
              lowest stated delivery fee ({formatLkr(pricing.deliveryFeeMin)}) and the lower end of
              the typical third-party app fee range (
              {Math.round(pricing.comparisonAppFeeRate * 100)}% of basket value). Your first-
              {pricing.launchFreeOrders}-order launch offer is not included in recurring monthly
              estimates. Starting values are illustrative examples, not plan data.
            </div>
          </Card>
          <Card className="cc-calculator-result">
            <span className="cc-eyebrow">Estimated monthly delivery cost</span>
            <div className="cc-cost-row">
              <span>UniSwap · no membership</span>
              <strong>{formatLkr(estimate.campusCartMonthly)}</strong>
            </div>
            <div className="cc-cost-row">
              <span>UniSwap Premium</span>
              <strong>{formatLkr(estimate.campusCartPremiumMonthly)}</strong>
            </div>
            <div className="cc-cost-row">
              <span>Typical third-party app fee</span>
              <strong>{formatLkr(estimate.thirdPartyMonthly)}</strong>
            </div>
            <div className="cc-savings-box">
              <Sparkles size={18} />
              <div>
                <span>Potential monthly savings with Premium vs typical app fee</span>
                <strong>
                  {formatLkr(estimate.thirdPartyMonthly - estimate.campusCartPremiumMonthly)}
                </strong>
              </div>
            </div>
            <p>
              Premium break-even: about {estimate.breakEvenOrdersPerMonth.toFixed(1)} orders per
              month at the lowest stated delivery fee of {formatLkr(pricing.deliveryFeeMin)}.
            </p>
          </Card>
        </div>
        <p className="cc-note">
          Illustrative comparison only. Actual fees, order eligibility and savings depend on vendor,
          delivery and membership terms.
        </p>
      </Section>
      <Section eyebrow="For campus businesses" title="Grow with the people already nearby.">
        <div className="cc-vendor-price-grid">
          <Card>
            <span className="cc-card-icon">
              <Sparkles size={18} />
            </span>
            <h3>Vendor commission</h3>
            <div className="cc-price-amount">
              {pricing.vendorCommissionMin}–{pricing.vendorCommissionMax}%
            </div>
            <p>
              Commission range listed for vendor orders; onboarding terms are agreed directly with
              each vendor.
            </p>
          </Card>
          <Card>
            <span className="cc-card-icon">
              <Megaphone size={18} />
            </span>
            <h3>Featured placement</h3>
            <div className="cc-price-amount">
              {formatLkr(pricing.vendorPromotionMonthly)}
              <small> / vendor-month</small>
            </div>
            <p>Vendor advertising, featured placement and analytics package.</p>
          </Card>
          <Card>
            <span className="cc-card-icon">
              <Gift size={18} />
            </span>
            <h3>Campus event promotion</h3>
            <div className="cc-price-amount">
              {formatLkr(pricing.eventPromotion)}
              <small> / event</small>
            </div>
            <p>Promote campus events through the student community marketplace.</p>
          </Card>
        </div>
        <div className="cc-center-link">
          <Link className="cc-button" to="/join?type=vendor">
            Talk vendor pricing <ArrowRight size={16} />
          </Link>
        </div>
      </Section>
      <CtaBand
        title="Good value should work for the whole campus."
        description="Join the early list to hear about launch offers and Premium."
      />
    </>
  );
}
