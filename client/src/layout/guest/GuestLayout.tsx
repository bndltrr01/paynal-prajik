import { Component, Suspense, lazy, memo } from "react";
import { Outlet } from "react-router-dom";

// Lazy load components
const GuestSidebar = lazy(() => import("./GuestSidebar"));
const LoadingHydrate = lazy(() => import("../../motions/loaders/LoadingHydrate"));

// Custom ErrorBoundary component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error in component:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="p-6 bg-white rounded-lg shadow-md text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <p className="mb-4">There was an error loading the guest dashboard.</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const GuestLayout = memo(() => {
    return (
        <ErrorBoundary>
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
                <Suspense fallback={<LoadingSidebar />}>
                    <GuestSidebar />
                </Suspense>
                <main className="flex-grow p-6 overflow-auto h-screen max-w-[calc(100vw-240px)]">
                    <ErrorBoundary>
                        <Suspense fallback={<LoadingContent />}>
                            <Outlet />
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>
        </ErrorBoundary>
    );
});

const LoadingSidebar = memo(() => (
    <div className="w-60 min-h-screen bg-white animate-pulse border-r border-gray-200"></div>
));

const LoadingContent = memo(() => (
    <div className="w-full min-h-[calc(100vh-48px)] flex items-center justify-center">
        <LoadingHydrate />
    </div>
));

LoadingSidebar.displayName = "LoadingSidebar";
LoadingContent.displayName = "LoadingContent";

GuestLayout.displayName = "GuestLayout";

export default GuestLayout;
