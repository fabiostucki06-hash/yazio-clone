import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`rounded-3xl bg-white p-4 shadow-md dark:bg-slate-800 ${className}`}>{children}</View>
  );
}
