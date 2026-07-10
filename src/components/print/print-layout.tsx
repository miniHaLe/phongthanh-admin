/**
 * PrintLayout — base printable document layout that per-document print layouts
 * (P3+ phiếu prints) compose. Because it is a React component, every
 * interpolated field (company header, doc title, customer name, Ghi chú) is
 * escaped by construction — no untrusted value reaches raw HTML (F7).
 */
import type { ReactNode } from 'react'

export interface PrintLayoutProps {
  title: string
  companyHeader?: string
  /** Signature-line captions rendered across the footer. */
  signatures?: string[]
  children: ReactNode
}

export function PrintLayout({
  title,
  companyHeader = 'PHONG THÀNH — Sửa chữa điện tử điện lạnh',
  signatures,
  children,
}: PrintLayoutProps) {
  return (
    <div className="print-doc">
      <header style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700 }}>{companyHeader}</div>
        <h1 style={{ fontSize: 18, marginTop: 8 }}>{title}</h1>
      </header>

      <main>{children}</main>

      {signatures && signatures.length > 0 && (
        <div className="print-signatures">
          {signatures.map((caption) => (
            <div key={caption} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>{caption}</div>
              <div style={{ marginTop: 48, fontStyle: 'italic' }}>
                (Ký, ghi rõ họ tên)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
