import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';
import Spinner from '../Spinner/Spinner';

/**
 * A flexible, polymorphic button component.
 *
 * @param {object} props
 * @param {'button' | 'a' | React.ElementType} [props.as='button'] - The element to render. Use 'a' for external links or pass the React Router `Link` component.
 * @param {'primary' | 'secondary' | 'destructive' | 'ghost' | 'link'} [props.variant='primary'] - The visual style of the button.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the button.
 * @param {React.ReactNode} [props.leftIcon] - Icon to display on the left.
 * @param {React.ReactNode} [props.rightIcon] - Icon to display on the right.
 * @param {boolean} [props.isLoading=false] - If true, shows a spinner and disables the button.
 * @param {boolean} [props.fullWidth=false] - If true, the button takes up the full width of its container.
 * @param {React.ReactNode} props.children - The content of the button.
 */
const Button = React.forwardRef(
  (
    {
      as: Component = 'button',
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if the component is a React Router Link
    const isLink = Component === Link;

    const classNames = [
      styles.btn,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      isLoading ? styles.loading : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {isLoading ? (
          <Spinner size={size === 'sm' ? 16 : 20} />
        ) : (
          <>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            <span className={styles.text}>{children}</span>
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
          </>
        )}
      </>
    );

    const commonProps = {
      className: classNames,
      disabled: isLoading || disabled,
      ref,
      ...props,
    };

    if (isLink) {
      // If it's a Link, don't pass the 'disabled' attribute, as it's not valid on <a> tags.
      const { disabled: _disabled, ...linkProps } = commonProps;
      return (
        <Component {...linkProps}>
          {content}
        </Component>
      );
    }

    return (
      <Component {...commonProps}>
        {content}
      </Component>
    );
  }
);

Button.displayName = 'Button';
export default Button;