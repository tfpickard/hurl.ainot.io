'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/stories', label: 'Stories' },
    { href: '/recommended', label: 'Recommended' },
    { href: '/stats', label: 'Stats' },
    { href: '/config', label: 'Config' },
  ];

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <h1>HURL</h1>
          <span>AI-Generated Stories</span>
        </Link>
        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/tfpickard/hurl.ainot.io"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
