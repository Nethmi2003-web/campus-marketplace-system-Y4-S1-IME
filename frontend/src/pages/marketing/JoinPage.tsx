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

type JoinType = "buyer" | "seller";

interface Submission {
  type: JoinType;
  name: string;
  email: string;
  studentId: string;
  note: string;
}

const submissions: Submission[] = [];

const tabs: { id: JoinType; label: string }[] = [
  { id: "buyer", label: "Buyer" },
  { id: "seller", label: "Seller" },
];

export default function JoinPage() {
  usePageMeta(
    "Join UniSwap",
    "Join the UniSwap verified student-only campus marketplace as a Buyer or Seller.",
  );

  const [params, setParams] = useSearchParams();
  const initialType: JoinType =
    params.get("type") === "seller" || params.get("type") === "vendor"
      ? "seller"
      : "buyer";

  const [type, setType] = useState<JoinType>(initialType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function chooseType(next: string) {
    const nextType = next as JoinType;
    setType(nextType);
    setSubmitted(false);
    setParams(nextType === "buyer" ? {} : { type: nextType }, { replace: true });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submissions.push({ type, name, email, studentId, note });
    setSubmitted(true);
    setName("");
    setEmail("");
    setStudentId("");
    setNote("");
  }

  const formCopy = {
    buyer: {
      title: "Join as a Student Buyer.",
      helper: "Browse affordable second-hand books, electronics, and hostel essentials from verified students.",
    },
    seller: {
      title: "Join as a Student Seller.",
      helper: "List your pre-owned textbooks, gadgets, or hostel items safely within your university community.",
    },
  }[type];

  return (
    <>
      <PageIntro
        eyebrow="Join the campus marketplace"
        title="The student marketplace starts with you."
        description="Register with your verified university email and student ID to buy or sell safely on campus."
      />
      <Section className="cc-join-section">
        <div className="cc-join-grid">
          <div className="cc-join-copy">
            <span className="cc-eyebrow">UniSwap · Verified Student Loop</span>
            <h2>Bring your part of campus along.</h2>
            <p>
              We’re building a trusted, student-only buying and selling community—one verified
              buyer and seller at a time.
            </p>
            <div className="cc-join-points">
              <p>
                <CheckCircle2 size={18} /> University email (`@uni.edu` / `@my.sliit.lk`) & Student ID verification
              </p>
              <p>
                <CheckCircle2 size={18} /> Affordable second-hand books, electronics & hostel items
              </p>
              <p>
                <CheckCircle2 size={18} /> AI-monitored trust scores, bulk discounts & secure payments
              </p>
            </div>
            <div className="cc-join-quote">
              “No outsiders, no fraud—just verified university students trading essentials safely
              with one another.”
            </div>
          </div>

          <Card
            aria-labelledby={`cc-tab-${type}`}
            className="cc-form-card"
            id={`cc-panel-${type}`}
            role="tabpanel"
            tabIndex={0}
          >
            <Tabs
              items={tabs}
              label="Choose your marketplace role"
              onChange={chooseType}
              selected={type}
            />
            <form className="cc-form" onSubmit={handleSubmit}>
              <div>
                <h2>{formCopy.title}</h2>
                <p>{formCopy.helper}</p>
              </div>
              <FormField
                id="cc-join-name"
                label="Full name"
                onChange={setName}
                placeholder="Your full name"
                required
                value={name}
              />
              <FormField
                id="cc-join-email"
                label="University email address"
                onChange={setEmail}
                placeholder="it23312708@my.sliit.lk"
                required
                type="email"
                value={email}
              />
              <FormField
                id="cc-join-student-id"
                label="University Student ID"
                onChange={setStudentId}
                placeholder="e.g., IT23312708"
                required
                value={studentId}
              />
              <FormField
                as="textarea"
                id="cc-join-note"
                label={
                  type === "seller"
                    ? "What categories do you plan to sell? (Books, Electronics, Hostel Items)"
                    : "What campus essentials are you looking for? (optional)"
                }
                onChange={setNote}
                placeholder={
                  type === "seller"
                    ? "e.g., 2nd-year IT textbooks, scientific calculator, hostel study lamp..."
                    : "Share what you'd like to find on UniSwap..."
                }
                required={type === "seller"}
                value={note}
              />
              <button className="cc-button cc-form-submit" type="submit">
                {type === "buyer" ? "Register as Buyer" : "Apply as Seller"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
              {submitted && (
                <p aria-live="polite" className="cc-form-success">
                  <CheckCircle2 size={17} /> Your {type} registration details have been recorded
                  for student verification.
                </p>
              )}
              <small>Verified university access only · Student ID validation required.</small>
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