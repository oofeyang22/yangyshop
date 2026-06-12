import Link from 'next/link';

export default function AdminOverviewPage() {
  const sections = [
    { href: '/admin/products', label: 'Products', desc: 'Add, edit, and remove catalog items.' },
    { href: '/admin/orders', label: 'Orders', desc: 'Review orders and update fulfillment status.' },
    { href: '/admin/users', label: 'Users', desc: 'Manage roles and account status.' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">Overview</h1>
      <div className="grid grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 transition-colors"
          >
            <h2 className="text-sm font-semibold text-zinc-900 mb-1">{s.label}</h2>
            <p className="text-sm text-zinc-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}