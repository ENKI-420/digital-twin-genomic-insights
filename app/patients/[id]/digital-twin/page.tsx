import DigitalTwinDashboard from "@/components/patient/digital-twin-dashboard"

export default function PatientDigitalTwinPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <DigitalTwinDashboard patientId={params.id} />
    </div>
  )
}