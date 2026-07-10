import { Icon, IconProps } from '@iconify/react';

// Wrapper component for iconify icons
// Usage: <Iconify icon="lucide:home" className="text-white" />
export default function Iconify({ icon, className, ...props }: IconProps) {
  return <Icon icon={icon} className={className} {...props} />;
}
