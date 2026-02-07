import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ModeToggle } from "@/components/ui/mode-toggle"

type BreadcrumbItemData = {
  label: string
  href?: string
}

type PageHeaderProps = {
  breadcrumbs?: BreadcrumbItemData[]
}

const defaultBreadcrumbs: BreadcrumbItemData[] = [
  { label: "Home", href: "#" },
  { label: "Dashboard", href: "#" },
  { label: "Overview" },
]

export function PageHeader({ breadcrumbs = defaultBreadcrumbs }: PageHeaderProps) {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md border border-border bg-muted" />
          <span className="text-lg font-semibold">BasisScope</span>
        </div>
        <ModeToggle />
      </div>
      <div className="pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <div key={`${item.label}-${index}`} className="flex items-center">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href ?? "#"}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
