import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            Algo deu errado
                        </h1>
                        <p className="text-gray-500 mb-6 text-sm">
                            Pedimos desculpas, mas encontramos um erro inesperado.
                            Isso pode ser um problema de configuração.
                        </p>

                        {this.state.error && (
                            <div className="bg-gray-100 rounded-lg p-3 mb-6 text-left overflow-auto max-h-32">
                                <p className="text-xs font-mono text-gray-700 break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Recarregar Página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
