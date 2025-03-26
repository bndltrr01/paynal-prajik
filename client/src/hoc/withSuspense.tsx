import { ComponentType, Suspense } from 'react';
import ContentLoader from '../motions/loaders/ContentLoader';

interface WithSuspenseProps {
    loaderType?: "card" | "table" | "list" | "text";
    count?: number;
}

/**
 * Higher-order component that wraps a component with Suspense and ContentLoader
 * @param Component - The component to wrap
 * @param options - Options for the loader
 * @returns The wrapped component
 */
const withSuspense = <P extends object>(
    Component: ComponentType<P>,
    { loaderType = "card", count = 3 }: WithSuspenseProps = {}
) => {
    const WithSuspenseComponent = (props: P) => {
        return (
            <Suspense fallback={<ContentLoader type={loaderType} count={count} />}>
                <Component {...props} />
            </Suspense>
        );
    };

    // Set display name for debugging
    const displayName = Component.displayName || Component.name || 'Component';
    WithSuspenseComponent.displayName = `withSuspense(${displayName})`;

    return WithSuspenseComponent;
};

export default withSuspense; 