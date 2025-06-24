import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('rounded-lg border border-gray-200 shadow-sm p-4 bg-white', className)}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';