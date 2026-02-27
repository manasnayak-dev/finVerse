import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] glass rounded-2xl p-8 text-center m-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-400 mb-6 bg-red-400/10 p-4 rounded-full">
            <AlertCircle className="w-12 h-12" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong rendering this component.</h2>
          <p className="text-slate-400 max-w-md mb-8">
            An unexpected error occurred. This is usually caused by invalid data formatting from the server or a UI glitch.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-xl text-left text-sm text-red-300 font-mono w-full max-w-2xl overflow-auto mb-6 border border-slate-700">
            {this.state.error && this.state.error.toString()}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl font-medium border border-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
