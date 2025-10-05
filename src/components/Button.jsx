import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable accessible button component.
 * Variants: primary (#b83c2c), secondary (#80563e), ghost.
 * Props: type, variant, size, loading, disabled, onClick, children, className, ariaLabel.
 */
const variantClasses = {
  primary: 'bg-space-primary text-space hover:opacity-90 focus-visible:ring-space-primary',
  secondary: 'bg-[#80563e] text-space hover:opacity-90 focus-visible:ring-[#80563e]',
  ghost: 'bg-transparent text-space-primary hover:bg-space-primary/10 focus-visible:ring-space-primary'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export default function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ariaLabel,
  children
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading ? 'true' : 'false'}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center rounded-md font-semibold tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-space/0 disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      ].join(' ')}
    >
      {loading && (
        <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-space border-t-transparent" aria-hidden="true" />
      )}
      <span>{children}</span>
    </button>
  );
}

Button.propTypes = {
  type: PropTypes.oneOf(['button','submit','reset']),
  variant: PropTypes.oneOf(['primary','secondary','ghost']),
  size: PropTypes.oneOf(['sm','md','lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  children: PropTypes.node.isRequired
};
