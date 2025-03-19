import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonHydrate = () => {
  return (
    <SkeletonTheme baseColor="#0a0a0a" highlightColor="#0e0e0e" duration={2} >
      <Skeleton count={3} />
    </SkeletonTheme>
  )
}

export default SkeletonHydrate