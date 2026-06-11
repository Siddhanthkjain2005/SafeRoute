export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">{children}</div>;
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-content-strong">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
