import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { brand, faq } from "../../data/site";
import { aboutDetails } from "../../data/strategy";
import { usePageMeta } from "../../hooks/usePageMeta";
import { Accordion, Card, FormField, PageIntro, Section } from "../../components/ui/MarketingUI";

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}
const contactSubmissions: ContactSubmission[] = [];

export default function ContactPage() {
  usePageMeta("Contact", "Get in touch with the UniSwap CampusCart team in Malabe, Sri Lanka.");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    contactSubmissions.push({ name, email, subject, message });
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <>
      <PageIntro
        eyebrow="Say hello"
        title="We're always up for a campus conversation."
        description="Have a question, a vendor idea or a thought about how campus could work better? Drop the team a line."
      />
      <Section className="cc-contact-section">
        <div className="cc-contact-grid">
          <div className="cc-contact-info">
            <span className="cc-eyebrow">Find the team</span>
            <h2>From Malabe, for campus.</h2>
            <Card>
              <MapPin size={19} />
              <div>
                <strong>Visit</strong>
                <p>{brand.address}</p>
              </div>
            </Card>
            <Card>
              <Phone size={19} />
              <div>
                <strong>Call</strong>
                <a href={`tel:${brand.phoneLink}`}>{brand.phone}</a>
              </div>
            </Card>
            <Card>
              <Mail size={19} />
              <div>
                <strong>Email</strong>
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </div>
            </Card>
            <p className="cc-contact-web">
              {brand.website} · Registration {aboutDetails.registration}
            </p>
          </div>
          <Card className="cc-form-card">
            <form className="cc-form" onSubmit={handleSubmit}>
              <div>
                <h2>Send us a note.</h2>
                <p>We’ll get back to you through the contact details you provide.</p>
              </div>
              <FormField
                id="cc-contact-name"
                label="Your name"
                onChange={setName}
                required
                value={name}
              />
              <FormField
                id="cc-contact-email"
                label="Email address"
                onChange={setEmail}
                required
                type="email"
                value={email}
              />
              <FormField
                id="cc-contact-subject"
                label="Subject"
                onChange={setSubject}
                required
                value={subject}
              />
              <FormField
                as="textarea"
                id="cc-contact-message"
                label="Message"
                onChange={setMessage}
                required
                value={message}
              />
              <button className="cc-button cc-form-submit" type="submit">
                Send message <span aria-hidden="true">↗</span>
              </button>
              {submitted && (
                <p aria-live="polite" className="cc-form-success">
                  <CheckCircle2 size={17} /> Thanks for reaching out. Your message is saved for this
                  session only.
                </p>
              )}
              <small>Client-side form · no backend · submissions are kept in memory only.</small>
            </form>
          </Card>
        </div>
      </Section>
      <Section
        className="cc-tint-section"
        eyebrow="The useful details"
        title="A few quick answers."
      >
        <Accordion items={faq} />
      </Section>
    </>
  );
}
