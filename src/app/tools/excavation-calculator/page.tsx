import { PageHeader } from "@/components/page-header"

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools" },
  { label: "Excavation Calculator" },
]

export default function ExcavationCalculatorPage() {
  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <main className="px-6 py-6">
        <h1 className="text-2xl font-bold">Excavation Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate excavation volumes, material quantities, and costs.
        </p>
      </main>
    </>
  )
}
