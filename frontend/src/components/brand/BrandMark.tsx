import { Link } from "react-router-dom";

export function BrandMark() {
  return (
    <Link aria-label="UniSwap home" className="cc-brand" to="/">
      <svg aria-hidden="true" className="cc-brand-mark" viewBox="0 0 42 42" fill="none">
        <rect width="42" height="42" rx="14" fill="currentColor" />
        <path
          d="M10 12h4l3.2 15h13.6l3.2-11H16"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="32" r="1.8" fill="white" />
        <circle cx="29" cy="32" r="1.8" fill="white" />
        <path
          d="M23 18h6m-2.5-2.5L29 18l-2.5 2.5"
          stroke="#F97316"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <span className="cc-brand-accent">UniSwap</span>
      </span>
    </Link>
  );
}
