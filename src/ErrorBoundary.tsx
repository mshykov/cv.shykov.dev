import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

// We run with no telemetry by design, so an uncaught render error would just be
// a blank screen. This turns it into a recoverable, friendly message.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h2 className="text-lg font-semibold text-stone-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-stone-500">
            This stays on your device — nothing was sent anywhere. Reloading usually fixes it.
          </p>
          <button
            onClick={() => { this.setState({ error: null }); location.reload() }}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
