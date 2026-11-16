import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { faq } from "../../data/site";
import { usePageMeta } from "../../hooks/usePageMeta";
import {
  Accordion,
  Card,
  FormField,
  PageIntro,
  Section,
  Tabs,
} from "../../components/ui/MarketingUI";

type JoinType = "customer" | "vendor" | "partner";
interface Submission {
  type: JoinType;
  name: string;
  email: string;
  organization: string;
  note: string;
}

const submissions: Submission[] = [];

const tabs: { id: JoinType; label: string }[] = [
  { id: "customer", label: "Customer waitlist" },
  { id: "vendor", label: "Vendor" },
  { id: "partner", label: "Delivery partner" },
];

export default function JoinPage() {
  usePageMeta(
    "Join the launch",
    "Join the CampusCart early-access list as a customer, campus vendor, delivery partner or ambassador.",
  );
  const [params, setParams] = useSearchParams();
  const initialType =
    params.get("type") === "vendor"
      ? "vendor"
      : params.get("type") === "partner"
        ? "partner"
        : "customer";
  const [type, setType] = useState<JoinType>(initialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function chooseType(next: string) {
    const nextType = next as JoinType;
    setType(nextType);
    setSubmitted(false);
    setParams(nextType === "customer" ? {} : { type: nextType }, { replace: true });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submissions.push({ type, name, email, organization, note });
    setSubmitted(true);
    setName("");
    setEmail("");
    setOrganization("");
    setNote("");
  }

  const formCopy = {
    customer: {
      title: "Get early access.",
      helper: "Be first to hear when campus delivery opens.",
    },
    vendor: {
      title: "Bring your business to campus.",
      helper: "Tell us a little about your shop and we'll follow up about vendor onboarding.",
    },
    partner: {
      title: "Make campus time count.",
      helper: "Share your interests in student delivery or campus ambassador opportunities.",
    },
  }[type];

  return (
    <>
      <PageIntro
        eyebrow="Join the campus loop"
        title="The first launch starts with you."
        description="Get updates, partner with us or help deliver the campus day."
      />
      <Section className="cc-join-section">
        <div className="cc-join-grid">
          <div className="cc-join-copy">
            <span className="cc-eyebrow">CampusCart · Malabe launch</span>
            <h2>Bring your part of campus along.</h2>
            <p>
              We’re building with the SLIIT Malabe community—one customer, vendor and student
              partner at a time.
            </p>
            <div className="cc-join-points">
              <p>
                <CheckCircle2 size={18} /> Early launch updates
              </p>
              <p>
                <CheckCircle2 size={18} /> Local vendor discovery
              </p>
              <p>
                <CheckCircle2 size={18} /> A student-powered community
              </p>
            </div>
            <div className="cc-join-quote">
              “Your campus is already a community. We’re just making it easier to show up for one
              another.”
            </div>
          </div>
          <Card
            aria-labelledby={`cc-tab-${type}`}
            className="cc-form-card"
            id={`cc-panel-${type}`}
            role="tabpanel"
            tabIndex={0}
          >
            <Tabs items={tabs} label="Choose how to join" onChange={chooseType} selected={type} />
            <form className="cc-form" onSubmit={handleSubmit}>
              <div>
                <h2>{formCopy.title}</h2>
                <p>{formCopy.helper}</p>
              </div>
              <FormField
                id="cc-join-name"
                label="Full name"
                onChange={setName}
                placeholder="Your name"
                required
                value={name}
              />
              <FormField
                id="cc-join-email"
                label="Email address"
                onChange={setEmail}
                placeholder="you@university.edu"
                required
                type="email"
                value={email}
              />
              {type !== "customer" && (
                <FormField
                  id="cc-join-organization"
                  label={
                    type === "vendor" ? "Business or shop name" : "Course, year or campus group"
                  }
                  onChange={setOrganization}
                  placeholder={type === "vendor" ? "Your business name" : "A little about you"}
                  required
                  value={organization}
                />
              )}
              <FormField
                as="textarea"
                id="cc-join-note"
                label={
                  type === "vendor"
                    ? "What do you sell?"
                    : type === "partner"
                      ? "What interests you about joining?"
                      : "Anything you'd like us to know? (optional)"
                }
                onChange={setNote}
                placeholder="Share a little more..."
                required={type !== "customer"}
                value={note}
              />
              <button className="cc-button cc-form-submit" type="submit">
                {type === "customer" ? "Join the waitlist" : "Send my interest"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
              {submitted && (
                <p aria-live="polite" className="cc-form-success">
                  <CheckCircle2 size={17} /> Thanks for your interest. Your details are saved for
                  this session only.
                </p>
              )}
              <small>Client-side form · no backend · submissions are kept in memory only.</small>
            </form>
          </Card>
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="Good to know"
        title="Questions before you join?"
      >
        <Accordion items={faq} />
      </Section>
    </>
  );
}
