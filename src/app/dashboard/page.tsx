import { PageHeader } from "@/components/page-header"

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Dashboard" },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <main className="px-6 py-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your account.
        </p>
      </main>
    </>
  )
}
