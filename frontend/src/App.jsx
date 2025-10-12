import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { TriageProvider } from "@/contexts/TriageContext.jsx"

function App() {
  return (
    <>
      <TriageProvider>
        <Pages />
        <Toaster />
      </TriageProvider>
    </>
  )
}

export default App 