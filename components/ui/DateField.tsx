import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { todayKey } from '@/store/diaryStore';
import { buildMonthGrid, formatDateShort, monthYearOf, WEEKDAY_LABELS } from '@/utils/calendarDates';

interface DateFieldProps {
  label?: string;
  value: string;
  onChange: (dateKey: string) => void;
}

// Compact "tap to open a month grid" date picker, for forms that need to
// pick one arbitrary past/future date (e.g. logging a weight entry)
// rather than the always-visible day-strip DateSelector uses.
export function DateField({ label, value, onChange }: DateFieldProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(() => monthYearOf(value));

  function open() {
    setViewedMonth(monthYearOf(value));
    setExpanded((prev) => !prev);
  }

  function shiftMonth(delta: number) {
    setViewedMonth((prev) => {
      const total = prev.year * 12 + prev.month + delta;
      return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
    });
  }

  const monthLabel = new Date(Date.UTC(viewedMonth.year, viewedMonth.month, 1)).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View className="gap-1.5">
      {label && <Text className="text-xs font-medium tracking-tight text-slate-500 dark:text-slate-400">{label}</Text>}
      <Pressable
        onPress={open}
        className="flex-row items-center gap-2 rounded-2xl border border-slate-200/70 bg-[#EDF2F7] px-5 py-3.5 dark:border-slate-800/60 dark:bg-white/5"
      >
        <Calendar color="#10b981" size={16} />
        <Text className="text-base text-slate-900 dark:text-white">{formatDateShort(value)}</Text>
      </Pressable>

      {expanded && (
        <View className="gap-3 rounded-2xl border border-white/40 bg-white/60 p-3 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Vorheriger Monat"
              className="h-8 w-8 items-center justify-center rounded-full active:bg-slate-100/60 dark:active:bg-white/5"
              onPress={() => shiftMonth(-1)}
            >
              <ChevronLeft color="#64748b" size={16} />
            </Pressable>
            <Text className="text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">{monthLabel}</Text>
            <Pressable
              accessibilityLabel="Nächster Monat"
              className="h-8 w-8 items-center justify-center rounded-full active:bg-slate-100/60 dark:active:bg-white/5"
              onPress={() => shiftMonth(1)}
            >
              <ChevronRight color="#64748b" size={16} />
            </Pressable>
          </View>

          <View className="flex-row">
            {WEEKDAY_LABELS.map((day) => (
              <Text key={day} className="flex-1 text-center text-[10px] font-medium text-slate-400">
                {day}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {buildMonthGrid(viewedMonth.year, viewedMonth.month).map((cell) => {
              const isSelected = cell.key === value;
              const isCellToday = cell.key === todayKey();
              return (
                <Pressable
                  key={cell.key}
                  className="w-[14.28%] items-center py-1"
                  onPress={() => {
                    onChange(cell.key);
                    setExpanded(false);
                  }}
                >
                  <View
                    className={`h-8 w-8 items-center justify-center rounded-full ${
                      isSelected ? 'bg-emerald-500' : isCellToday ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? 'font-bold text-white'
                          : !cell.inMonth
                            ? 'text-slate-300 dark:text-slate-700'
                            : isCellToday
                              ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
