'use client';


export function Header({ title }) {

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 md:px-6 md:py-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl text-center font-semibold text-[var(--color-text-secondary)] tracking-tight truncate">{title}</h1>
          <p className="text-xs text-center md:text-xs text-[var(--color-text-muted)] hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </header>
  );
}