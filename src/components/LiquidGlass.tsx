import { type ReactNode, type CSSProperties, createElement } from 'react';

interface LiquidGlassProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: React.ElementType;
}

export default function LiquidGlass({
  children,
  style,
  className = '',
  as: Tag = 'div',
}: LiquidGlassProps) {
  return createElement(
    Tag,
    {
      className: `liquid-glass ${className}`,
      style: {
        borderRadius: 24,
        ...style,
      },
    },
    children
  );
}
