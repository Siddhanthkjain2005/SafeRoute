export function Page({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-[1560px] px-5 py-6 lg:px-7">{children}</main>;
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
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-bold tracking-tight text-content-strong bg-gradient-to-r from-content-strong to-accent/70 bg-clip-text text-transparent">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-content-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
