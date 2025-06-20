import { Button } from "@/components/ui/button"

interface PatientHeaderProps {
  patient: {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string
    gender: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
  }
}

export const PatientHeader = ({ patient }: PatientHeaderProps) => {
  return (
    <div className="bg-gray-100 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-600">
            DOB: {new Date(patient.date_of_birth).toLocaleDateString()} | Gender: {patient.gender}
          </p>
        </div>
        <Button variant="outline">Edit Patient</Button>
      </div>
    </div>
  )
}
