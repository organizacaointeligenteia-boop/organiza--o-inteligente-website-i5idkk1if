import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Ops! Algo deu errado.</h1>
          <p className="text-muted-foreground mb-8">Tente novamente mais tarde.</p>
          <Button onClick={() => window.location.reload()}>Recarregar</Button>
        </div>
      )
    }
    return this.props.children
  }
}
