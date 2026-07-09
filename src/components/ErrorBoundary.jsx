import { Component } from 'react'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

/**
 * Last-resort fallback for render errors React can't recover from on its
 * own. Class component because error boundaries have no hook equivalent.
 */
class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error(error, info)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-display text-2xl font-bold text-text">Algo salió mal</h1>
          <p className="max-w-sm text-sm text-text-secondary">
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
          <Button onClick={this.handleReload}>Recargar</Button>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
