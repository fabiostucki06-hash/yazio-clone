import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { todayKey } from '@/store/diaryStore';
import { useUiStore } from '@/store/uiStore';

const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const ACCENT = '#10b981';

interface MonthCell {
  key: string;
  day: number;
  inMonth: boolean;
}

function addDays(dateKey: string, delta: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function dateKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(dateKey: string): string {
  const today = todayKey();
  const diffDays = Math.round(
    (new Date(`${dateKey}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return 'Heute';
  if (diffDays === -1) return 'Gestern';
  if (diffDays === 1) return 'Morgen';
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
  });
}

function buildMonthGrid(year: number, month: number): MonthCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: MonthCell[] = [];
  for (let i = startWeekday; i > 0; i -= 1) {
    const date = new Date(Date.UTC(year, month, 1 - i));
    cells.push({ key: dateKeyOf(date), day: date.getUTCDate(), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ key: dateKeyOf(new Date(Date.UTC(year, month, day))), day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const date = addDays(last.key, 1);
    cells.push({ key: date, day: new Date(`${date}T00:00:00Z`).getUTCDate(), inMonth: false });
  }
  return cells;
}

export function DateSelector() {
  const selectedDate = useUiStore((state) => state.selectedDate);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const [expanded, setExpanded] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date(`${selectedDate}T00:00:00Z`);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });

  const isToday = selectedDate === todayKey();

  function jumpToMonthOf(dateKey: string) {
    const d = new Date(`${dateKey}T00:00:00Z`);
    setViewedMonth({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
  }

  function selectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setExpanded(false);
  }

  function goToToday() {
    const key = todayKey();
    setSelectedDate(key);
    jumpToMonthOf(key);
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
    <View className="gap-3 rounded-[28px] border border-white/40 bg-white/60 p-4 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="Vorheriger Tag"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100/60 dark:active:bg-white/5"
          onPress={() => setSelectedDate(addDays(selectedDate, -1))}
        >
          <ChevronLeft color="#64748b" size={20} />
        </Pressable>

        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 px-2"
          onPress={() => {
            jumpToMonthOf(selectedDate);
            setExpanded((prev) => !prev);
          }}
        >
          <Calendar color={ACCENT} size={16} />
          <Text className="text-sm font-semibold text-slate-900 dark:text-white">{formatDayLabel(selectedDate)}</Text>
          {!isToday && (
            <Text className="text-xs text-slate-400">
              {new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          )}
        </Pressable>

        <Pressable
          accessibilityLabel="Nächster Tag"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100/60 dark:active:bg-white/5"
          onPress={() => setSelectedDate(addDays(selectedDate, 1))}
        >
          <ChevronRight color="#64748b" size={20} />
        </Pressable>
      </View>

      {!isToday && (
        <Pressable
          className="self-center rounded-full bg-emerald-500/10 px-4 py-1.5 active:bg-emerald-500/20"
          onPress={goToToday}
        >
          <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Zu Heute springen</Text>
        </Pressable>
      )}

      {expanded && (
        <View className="gap-3 border-t border-slate-200/50 pt-3 dark:border-slate-800/60">
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
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} className="flex-1 text-center text-[10px] font-medium text-slate-400">
                {label}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {buildMonthGrid(viewedMonth.year, viewedMonth.month).map((cell) => {
              const isSelected = cell.key === selectedDate;
              const isCellToday = cell.key === todayKey();
              return (
                <Pressable
                  key={cell.key}
                  className="w-[14.28%] items-center py-1"
                  onPress={() => selectDate(cell.key)}
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
