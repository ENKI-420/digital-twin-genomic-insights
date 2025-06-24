import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'btn',
          {
            'btn-primary': variant === 'primary',
            'bg-secondary text-white hover:bg-secondary-dark': variant === 'secondary',
            'border border-gray-300 hover:bg-gray-100': variant === 'outline',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';