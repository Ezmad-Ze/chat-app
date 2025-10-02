import React from 'react';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 rounded border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className || ''}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';