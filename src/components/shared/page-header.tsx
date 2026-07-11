import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface BreadcrumbEntry {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs: BreadcrumbEntry[]
  children?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur',
        className,
      )}
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        {/* Left: breadcrumb + title */}
        <div className="min-w-0 flex-1">
          {breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-1">
              <BreadcrumbList>
                {breadcrumbs.map((item, idx) => {
                  const isLast = idx === breadcrumbs.length - 1
                  // Separator is a sibling of the item, not a child (both <li>).
                  return (
                    <Fragment key={idx}>
                      <BreadcrumbItem>
                        {isLast || !item.href ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={item.href}>{item.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <h1 className="truncate text-xl font-semibold leading-tight">
            {title}
          </h1>
        </div>

        {/* Right: action slot */}
        {children && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {children}
          </div>
        )}
      </div>
    </header>
  )
}
