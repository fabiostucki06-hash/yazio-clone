import type { ComponentProps } from 'react';
import { Text, TextInput, View } from 'react-native';

interface TextFieldProps extends ComponentProps<typeof TextInput> {
  label?: string;
  suffix?: string;
}

export function TextField({ label, suffix, className = '', ...inputProps }: TextFieldProps) {
  return (
    <View className="gap-1.5">
      {label && <Text className="text-xs font-medium tracking-tight text-slate-500 dark:text-slate-400">{label}</Text>}
      <View className="flex-row items-center gap-2 rounded-2xl border border-slate-200/50 bg-slate-100/60 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <TextInput
          className={`flex-1 text-base text-slate-900 dark:text-white ${className}`}
          placeholderTextColor="#94a3b8"
          {...inputProps}
        />
        {suffix && <Text className="text-sm text-slate-400">{suffix}</Text>}
      </View>
    </View>
  );
}
