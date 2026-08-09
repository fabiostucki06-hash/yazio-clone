import { useState, type ComponentProps } from 'react';
import { Text, TextInput, View } from 'react-native';

interface TextFieldProps extends ComponentProps<typeof TextInput> {
  label?: string;
  suffix?: string;
}

export function TextField({ label, suffix, className = '', onFocus, onBlur, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-1.5">
      {label && <Text className="text-xs font-medium tracking-tight text-slate-500 dark:text-slate-400">{label}</Text>}
      <View
        className={`flex-row items-center gap-2 rounded-[20px] border bg-[#EDF2F7] px-5 py-3.5 dark:bg-white/5 ${
          isFocused
            ? 'border-[#2ECC71] shadow-md shadow-emerald-500/15 dark:border-emerald-400/70'
            : 'border-[#D1D5DB] shadow-none dark:border-white/10'
        }`}
      >
        <TextInput
          className={`flex-1 text-base text-slate-900 dark:text-white ${className}`}
          placeholderTextColor="#94a3b8"
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {suffix && <Text className="text-sm text-slate-400">{suffix}</Text>}
      </View>
    </View>
  );
}
