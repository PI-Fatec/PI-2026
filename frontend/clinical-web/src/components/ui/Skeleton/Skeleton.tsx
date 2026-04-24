import React from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  type?: 'text' | 'circle' | 'rect';
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1em',
  type = 'text',
  className = '',
}) => {
  const classes = [styles.skeleton, styles[type], className].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export default Skeleton;