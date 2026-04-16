import type { ReactNode } from "react";

type DataCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function DataCard({ title, subtitle, action, children }: DataCardProps) {
  return (
    <article className="data-card">
      <header className="data-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      {children ? <div className="data-card-content">{children}</div> : null}
    </article>
  );
}
