import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/users', label: 'Users' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white">
        <div className="px-5 py-5 border-b border-zinc-200">
          <span className="text-sm font-semibold tracking-wide text-zinc-900">Admin</span>
        </div>
        <nav className="flex flex-col p-3 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}