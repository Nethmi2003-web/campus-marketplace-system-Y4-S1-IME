import { useState, type HTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="cc-page-intro">
      <div className="cc-container">
        <span className="cc-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

export function Section({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`cc-section ${className}`}>
      <div className="cc-container">
        {(eyebrow || title || description) && (
          <div className="cc-section-heading">
            {eyebrow && <span className="cc-eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Card({
  children,
  className = "",
  ...attributes
}: HTMLAttributes<HTMLElement> & { children: ReactNode; className?: string }) {
  return (
    <article className={`cc-card ${className}`} {...attributes}>
      {children}
    </article>
  );
}

export function StatCard({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail?: string;
}) {
  return (
    <Card className="cc-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
      {detail && <small>{detail}</small>}
    </Card>
  );
}

export function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <Card className="cc-chart-card">
      <div className="cc-chart-heading">
        <div>
          <h3>{title}</h3>
          {caption && <p>{caption}</p>}
        </div>
      </div>
      <div className="cc-chart-body">{children}</div>
    </Card>
  );
}

export interface TableColumn<Row> {
  key: keyof Row | string;
  heading: string;
  cell?: (row: Row) => ReactNode;
}

export function DataTable<Row extends object>({
  columns,
  rows,
  rowKey,
  caption,
}: {
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  caption: string;
}) {
  return (
    <div className="cc-table-wrap">
      <table className="cc-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} scope="col">
                {column.heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {columns.map((column, columnIndex) => (
                <td key={String(column.key)} data-label={column.heading}>
                  {column.cell ? column.cell(row) : String(row[column.key as keyof Row] ?? "")}
                  {columnIndex === 0 && <span className="cc-sr-only">, row {index + 1}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Accordion({
  items,
  className = "",
}: {
  items: { question: string; answer: string }[];
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(0);
  return (
    <div className={`cc-accordion ${className}`}>
      {items.map((item, index) => (
        <div className="cc-accordion-item" key={item.question}>
          <h3>
            <button
              aria-controls={`cc-answer-${index}`}
              aria-expanded={active === index}
              id={`cc-question-${index}`}
              onClick={() => setActive(active === index ? null : index)}
              type="button"
            >
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className={active === index ? "is-rotated" : ""}
                size={19}
              />
            </button>
          </h3>
          <div
            aria-labelledby={`cc-question-${index}`}
            className="cc-accordion-panel"
            hidden={active !== index}
            id={`cc-answer-${index}`}
          >
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Tabs({
  items,
  selected,
  onChange,
  label,
}: {
  items: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div aria-label={label} className="cc-tabs" role="tablist">
      {items.map((item) => (
        <button
          aria-controls={`cc-panel-${item.id}`}
          aria-selected={selected === item.id}
          className={selected === item.id ? "is-active" : ""}
          id={`cc-tab-${item.id}`}
          key={item.id}
          onClick={() => onChange(item.id)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function FormField({
  id,
  label,
  type = "text",
  required = false,
  placeholder,
  value,
  onChange,
  min,
  max,
  step,
  as = "input",
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  as?: "input" | "textarea";
}) {
  return (
    <label className="cc-field" htmlFor={id}>
      <span>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {as === "textarea" ? (
        <textarea
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          value={value}
        />
      ) : (
        <input
          id={id}
          max={max}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          step={step}
          type={type}
          value={value}
        />
      )}
    </label>
  );
}

export function CtaBand({ title, description }: { title: string; description: string }) {
  return (
    <section className="cc-cta-band">
      <div className="cc-container cc-cta-content">
        <div>
          <span className="cc-eyebrow">Good things happen close to home</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <a className="cc-button cc-button-light" href="/join">
          Join the launch <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
