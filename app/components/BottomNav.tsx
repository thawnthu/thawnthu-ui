'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()
  const nav = [
    {href: '/', label: 'Home'},
    {href: '/category', label: 'Category'},
    {href: '/post', label: 'Post'},
    {href: '/notification', label: 'Notification'},
  ]
  return (
    <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 10}}>
      {nav.map(n => (
        <Link key={n.href} href={n.href} style={{color: pathname === n.href? 'black' : 'gray', textDecoration: 'none', fontSize: '14px', fontWeight: pathname === n.href? 'bold' : 'normal'}}>
          {n.label}
        </Link>
      ))}
    </div>
  )
}
