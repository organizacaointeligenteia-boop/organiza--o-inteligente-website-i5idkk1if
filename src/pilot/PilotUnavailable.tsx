import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export function PilotUnavailablePage() {
  return (
    <main
      id="main-content"
      role="main"
      className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 antialiased"
    >
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ambiente Indisponível
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Esta demonstração técnica está restrita ao ambiente autorizado de visualização prévia.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  )
}
