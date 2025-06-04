import { MedicalChat } from "@/components/medical-chat"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <MedicalChat />
      </div>
    </main>
  )
}
