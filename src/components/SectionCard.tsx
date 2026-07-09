import type { PropsWithChildren, ReactNode } from "react";

interface SectionCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

function SectionCard({
  title,
  subtitle,
  rightSlot,
  className,
  bodyClassName,
  children,
}: SectionCardProps) {
  const sectionClassName = [
    "overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--bg-panel)]",
    className ?? "",
  ]
    .join(" ")
    .trim();
  const contentClassName = ["px-5 py-4", bodyClassName ?? ""].join(" ").trim();

  return (
    <section className={sectionClassName}>
      <header className="flex items-start justify-between gap-4 border-b border-[var(--line-soft)] bg-[var(--bg-panel-2)] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        {rightSlot}
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export default SectionCard;
