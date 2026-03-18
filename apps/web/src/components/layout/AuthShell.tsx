import { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

const highlights = [
  'Material-inspired forms with strong focus cues',
  'Clean account workflows with clear messaging',
  'Lightweight surface design tuned for desktop and mobile',
];

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero" aria-label="Product introduction">
        <div className="auth-hero__eyebrow">Google-style account workspace</div>
        <h1 className="auth-hero__title">{title}</h1>
        <p className="auth-hero__text">{description}</p>
        <ul className="auth-hero__highlights">
          {highlights.map((item) => (
            <li key={item}>
              <span className="auth-hero__dot" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </aside>
      <section className="surface-card auth-card">{children}</section>
    </div>
  );
}
