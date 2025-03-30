import { ComponentType, Suspense } from 'react';
import ContentLoader from '../motions/loaders/ContentLoader';

interface WithSuspenseProps {
    height?: string;
}

/**
 * Higher-order component that wraps a component with Suspense and ContentLoader
 * @param Component - The component to wrap
 * @param options - Options for the loader
 * @returns The wrapped component
 */
const withSuspense = <P extends object>(
    Component: ComponentType<P>,
    { height = "200px" }: WithSuspenseProps = {}
) => {
    const WithSuspenseComponent = (props: P) => {
        return (
            <Suspense fallback={<ContentLoader height={height} />}>
                <Component {...props} />
            </Suspense>
        );
    };

    const displayName = Component.displayName || Component.name || 'Component';
    WithSuspenseComponent.displayName = `withSuspense(${displayName})`;

    return WithSuspenseComponent;
};

export default withSuspense; 