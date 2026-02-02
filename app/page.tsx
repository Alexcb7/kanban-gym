import Header from "@/app/components/layout/header"
import AppTabs from "@/app/components/layout/app-tabbs"

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <Header />
        <AppTabs />
        <footer className="pt-6 text-center text-xs text-muted-foreground">
          Drag & Drop real · Auditoría con diff · Búsqueda avanzada · Modo Dios
        </footer>
      </div>
    </main>
  )
}
