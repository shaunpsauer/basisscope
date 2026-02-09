import { PageHeader } from "@/components/page-header";
import { ExcavationCalculator } from "./excavation-calculator";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools" },
  { label: "Excavation Calculator" },
];

export default function ExcavationCalculatorPage() {
  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <ExcavationCalculator />
    </>
  );
}
