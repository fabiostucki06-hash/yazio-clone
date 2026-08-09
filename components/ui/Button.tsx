import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-emerald-500 active:bg-emerald-600',
  secondary: 'bg-slate-100 active:bg-slate-200 dark:bg-slate-700 dark:active:bg-slate-600',
  ghost: 'bg-transparent active:bg-slate-100 dark:active:bg-slate-800',
  danger: 'bg-red-500 active:bg-red-600',
};

const VARIANT_TEXT_CLASSES: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900 dark:text-white',
  ghost: 'text-emerald-600 dark:text-emerald-400',
  danger: 'text-white',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 ${VARIANT_CLASSES[variant]} ${
        disabled || loading ? 'opacity-50' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#ffffff' : '#10b981'} />
      ) : (
        <>
          {icon}
          <Text className={`text-base font-semibold ${VARIANT_TEXT_CLASSES[variant]}`}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
