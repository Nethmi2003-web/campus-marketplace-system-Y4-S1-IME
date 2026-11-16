import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUp, Menu, Moon, Sun, X } from "lucide-react";
import { aboutDetails } from "../../data/strategy";
import { brand, navigation, sitemap, socialLinks } from "../../data/site";
import { useTheme } from "../../hooks/useTheme";
import { BrandMark } from "./BrandMark";
import "../../styles/marketing.css";

function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="cc-header">
      <a className="cc-skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="cc-header-inner">
        <BrandMark />
        <nav aria-label="Main navigation" className={`cc-nav ${open ? "is-open" : ""}`}>
          {navigation.map((item) => (
            <NavLink key={item.href} onClick={() => setOpen(false)} to={item.href}>
              {item.label}
            </NavLink>
          ))}
          <Link className="cc-nav-mobile-cta" onClick={() => setOpen(false)} to="/join">
            Join the launch
          </Link>
        </nav>
        <div className="cc-header-actions">
          <button
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="cc-icon-button"
            onClick={toggleTheme}
            type="button"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link className="cc-button cc-button-small cc-header-cta" to="/join">
            Get early access <span aria-hidden="true">↗</span>
          </Link>
          <button
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="cc-icon-button cc-menu-button"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <span className="cc-sr-only" aria-live="polite">
        Current page: {location.pathname}
      </span>
    </header>
  );
}

function Footer() {
  return (
    <footer className="cc-footer">
      <div className="cc-footer-main">
        <div className="cc-footer-brand">
          <BrandMark />
          <p>Campus essentials, delivered by the people who know campus best.</p>
          <div className="cc-social-links">
            {socialLinks.map((social) => (
              <a href={social.href} key={social.name} rel="noreferrer" target="_blank">
                {social.name} {social.label} ↗
              </a>
            ))}
          </div>
        </div>
        <div className="cc-footer-links">
          <div>
            <h3>Explore</h3>
            {sitemap.explore.map(({ label, href }) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Our plan</h3>
            {sitemap.plan.map(({ label, href }) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Connect</h3>
            {sitemap.connect.map(({ label, href }) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </div>
        </div>
      </div>
      <div className="cc-footer-bottom">
        <span>
          © {aboutDetails.established} {brand.name} · Malabe, Sri Lanka
        </span>
        <span>
          Made for campus life{" "}
          <span aria-label="with love" role="img">
            ♥
          </span>
        </span>
      </div>
    </footer>
  );
}

export function MarketingLayout() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const listener = () => setShowTop(window.scrollY > 420);
    window.addEventListener("scroll", listener, { passive: true });
    return () => window.removeEventListener("scroll", listener);
  }, []);

  return (
    <div className="cc-site">
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      {showTop && (
        <button
          aria-label="Scroll to top"
          className="cc-scroll-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            })
          }
          type="button"
        >
          <ArrowUp size={19} />
        </button>
      )}
    </div>
  );
}
