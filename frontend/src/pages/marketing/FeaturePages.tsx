import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Cpu, DollarSign, Users, ArrowRight } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";
import { PageIntro, Section, Card } from "../../components/ui/MarketingUI";

export function HowItWorksPage() {
  usePageMeta(
    "How It Works — UniSwap",
    "Discover how UniSwap provides a secure, AI-enhanced student-only campus marketplace for buying and selling textbooks, electronics, and hostel items."
  );

  return (
    <>
      <PageIntro
        eyebrow="HOW UNISWAP WORKS"
        title="Built exclusively for verified university students."
        description="Buy and sell textbooks, electronics, and hostel essentials in a closed, fraud-protected campus network—powered by student ID verification, smart pricing, and AI trust scoring."
      />

      <Section className="cc-section">
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0B1F3A", marginBottom: "1rem" }}>
            Four Simple Steps to Safe Campus Trading
          </h2>
          <p style={{ color: "#6b7280", fontSize: "1.05rem" }}>
            UniSwap divides the platform into clear, secure functional components ensuring absolute transparency from registration to completed transaction[cite: 2, 3, 4].
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {/* Step 1 */}
          <Card style={{ padding: "2rem", borderRadius: "1.5rem", border: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#0B1F3A", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              01
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "0.75rem" }}>
              Verify Student Identity
            </h3>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Sign up exclusively using your official university email (<code style={{ color: "#F97316" }}>@uni.edu</code> / <code style={{ color: "#F97316" }}>@my.sliit.lk</code>) and Student ID[cite: 2, 3]. Accounts are secured with encrypted passwords and role-based access (<code style={{ fontWeight: 600 }}>Student</code>, <code style={{ fontWeight: 600 }}>Seller</code>, <code style={{ fontWeight: 600 }}>Admin</code>) to keep outsiders out[cite: 2, 3].
            </p>
          </Card>

          {/* Step 2 */}
          <Card style={{ padding: "2rem", borderRadius: "1.5rem", border: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#0B1F3A", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              02
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "0.75rem" }}>
              List or Discover Items
            </h3>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Sellers post pre-owned items across structured categories (<code style={{ fontWeight: 600 }}>Books</code>, <code style={{ fontWeight: 600 }}>Electronics</code>, <code style={{ fontWeight: 600 }}>Hostel Items</code>, <code style={{ fontWeight: 600 }}>Other</code>) with image uploads and availability tracking (<code style={{ fontWeight: 600 }}>Available</code>, <code style={{ fontWeight: 600 }}>Pending</code>, <code style={{ fontWeight: 600 }}>Sold</code>)[cite: 2, 3]. Buyers filter by price range and category instantly[cite: 2].
            </p>
          </Card>

          {/* Step 3 */}
          <Card style={{ padding: "2rem", borderRadius: "1.5rem", border: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#0B1F3A", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              03
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "0.75rem" }}>
              Smart Pricing & Payments
            </h3>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Add two or more items to automatically trigger <strong style={{ color: "#0B1F3A" }}>bulk purchase discounts</strong>[cite: 2, 3]. Upload your bank payment slip during checkout for admin verification (<code style={{ fontWeight: 600 }}>Pending</code> / <code style={{ fontWeight: 600 }}>Approved</code>) to receive official <strong style={{ color: "#0B1F3A" }}>digital receipts</strong>[cite: 2, 3].
            </p>
          </Card>

          {/* Step 4 */}
          <Card style={{ padding: "2rem", borderRadius: "1.5rem", border: "1px solid #e5e7eb", background: "#ffffff" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F97316", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1.5rem" }}>
              04
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0B1F3A", marginBottom: "0.75rem" }}>
              AI Trust & Security
            </h3>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: 1.6 }}>
              UniSwap’s intelligence engine detects abnormal pricing and suspicious listings[cite: 2, 4]. Buyer ratings and NLP review sentiment analysis continuously calculate each <strong style={{ color: "#0B1F3A" }}>Seller Trust Score</strong> while ranking <strong style={{ color: "#0B1F3A" }}>Best Sellers</strong>[cite: 2, 4].
            </p>
          </Card>
        </div>
      </Section>

      {/* Comparison Table Section */}
      <Section className="cc-tint-section" style={{ background: "#f8fafc", padding: "4rem 2rem", borderRadius: "2rem", margin: "2rem auto" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ color: "#F97316", fontWeight: 700, textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
            Why UniSwap
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0B1F3A", marginTop: "0.5rem" }}>
            UniSwap vs. Public Classifieds
          </h2>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <thead>
              <tr style={{ background: "#0B1F3A", color: "#ffffff", textAlign: "left" }}>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 700 }}>Feature</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#94a3b8" }}>Public Classifieds</th>
                <th style={{ padding: "1rem 1.5rem", fontWeight: 700, color: "#F97316" }}>UniSwap Marketplace</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.95rem", color: "#1e293b" }}>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Access Control</td>
                <td style={{ padding: "1rem 1.5rem", color: "#64748b" }}>Open to anonymous outsiders[cite: 2]</td>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#0B1F3A" }}>Restricted to verified university emails & Student IDs[cite: 2, 3]</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Pricing & Discounts</td>
                <td style={{ padding: "1rem 1.5rem", color: "#64748b" }}>Manual negotiation only</td>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#0B1F3A" }}>Automatic totals + built-in bulk discounts (2+ items)[cite: 2, 3]</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Payment Security</td>
                <td style={{ padding: "1rem 1.5rem", color: "#64748b" }}>Unverified cash or screenshots</td>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#0B1F3A" }}>Admin-verified payment slips & digital receipts[cite: 2, 3]</td>
              </tr>
              <tr>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600 }}>Fraud Prevention</td>
                <td style={{ padding: "1rem 1.5rem", color: "#64748b" }}>High risk of scams[cite: 2]</td>
                <td style={{ padding: "1rem 1.5rem", fontWeight: 600, color: "#0B1F3A" }}>AI anomaly detection, sentiment analysis & Seller Trust Scores[cite: 2, 4]</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Final CTA Banner */}
      <Section style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", background: "#0B1F3A", padding: "3rem", borderRadius: "2rem", color: "#ffffff", boxShadow: "0 20px 25px -5px rgba(11, 31, 58, 0.2)" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to trade smarter on campus?
          </h2>
          <p style={{ color: "#cbd5e1", marginBottom: "2rem", fontSize: "1.05rem" }}>
            Join verified students buying and selling university essentials securely with UniSwap[cite: 2, 3].
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{ background: "#F97316", color: "#ffffff", padding: "0.75rem 1.75rem", borderRadius: "1rem", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              Create Student Account <ArrowRight size={18} />
            </Link>
            <Link
              to="/items"
              style={{ background: "transparent", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.4)", padding: "0.75rem 1.75rem", borderRadius: "1rem", fontWeight: 700, textDecoration: "none" }}
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

// Placeholder exports for other feature pages imported in App.jsx
export function CustomersPage() {
  usePageMeta("Students & Community — UniSwap", "Designed by students, for students.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>Students & Community</h2></div>;
}

export function MarketPage() {
  usePageMeta("Campus Market — UniSwap", "University commerce landscape.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>Campus Market Analysis</h2></div>;
}

export function SwotPage() {
  usePageMeta("SWOT Analysis — UniSwap", "Strategic overview of UniSwap.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>SWOT Analysis</h2></div>;
}

export function GrowthPage() {
  usePageMeta("Growth & Rollout — UniSwap", "Campus expansion plan.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>Growth Strategy</h2></div>;
}

export function OperationsPage() {
  usePageMeta("Operations — UniSwap", "Operational framework.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>Operations & Component Architecture</h2></div>;
}

export function RoadmapPage() {
  usePageMeta("Roadmap — UniSwap", "Project development milestones.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>Project Roadmap</h2></div>;
}

export function AboutPage() {
  usePageMeta("About Us — UniSwap", "Meet the UniSwap team.");
  return <div style={{ padding: "4rem", textAlign: "center" }}><h2>About UniSwap Team</h2></div>;
}