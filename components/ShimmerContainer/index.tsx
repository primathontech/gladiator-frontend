/**
 * @file ShimmerUI component
 */
import React, { memo } from 'react';
import { Skeleton, SkeletonProps } from '@mui/material';

type VairantType = 'circular' | 'rectangular' | 'rounded' | 'text';

type AnimationType = 'wave' | 'pulse';

type ShimmerContainerProps = SkeletonProps & {
    /**
     * className for passing styling to skeleton.
     */
    className: string;

    /**
     * variant is for which type variant you want such as circular , text etc.
     */
    variant?: VairantType;

    /**
     * animation for which type of animation you want like => wave , pulse etc.
     */
    animation?: AnimationType;
};

const ShimmerUiContainer = (props: ShimmerContainerProps) => {
    const { className, variant = 'rectangular', animation = 'wave' } = props;

    return <Skeleton variant={variant} className={className} animation={animation} />;
};

/**
 * This component provides a way to render Radio with various styling options
 * @example
 * <ShimmerUiContainer className={styles['skel-ui']} variant='rectangular' animation={false} />
 */
export default memo(ShimmerUiContainer);
