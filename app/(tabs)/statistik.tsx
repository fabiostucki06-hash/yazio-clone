import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAILY_CALORIE_GOAL = 2200;
const IN_GOAL_COLOR = '#22c55e';
const OVER_GOAL_COLOR = '#f59e0b';
const CHART_HEIGHT = 120;

interface DayStat {
  label: string;
  calories: number;
}

const weekStats: DayStat[] = [
  { label: 'Mo', calories: 1950 },
  { label: 'Di', calories: 2100 },
  { label: 'Mi', calories: 1800 },
  { label: 'Do', calories: 2340 },
  { label: 'Fr', calories: 2000 },
  { label: 'Sa', calories: 2410 },
  { label: 'So', calories: 1700 },
];

const maxCalories = Math.max(...weekStats.map((day) => day.calories), DAILY_CALORIE_GOAL);
const averageCalories = Math.round(
  weekStats.reduce((sum, day) => sum + day.calories, 0) / weekStats.length,
);
const daysInGoal = weekStats.filter((day) => day.calories <= DAILY_CALORIE_GOAL).length;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1 rounded-2xl bg-white p-4 dark:bg-slate-800">
      <Text className="text-xs text-slate-500 dark:text-slate-400">{label}</Text>
      <Text className="text-xl font-bold text-slate-900 dark:text-white">{value}</Text>
    </View>
  );
}

export default function StatistikScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 gap-6 px-6 pt-4">
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">Statistik</Text>

        <View className="flex-row gap-4">
          <StatTile label="Ø Kalorien / Tag" value={`${averageCalories} kcal`} />
          <StatTile label="Tage im Ziel" value={`${daysInGoal} von ${weekStats.length}`} />
        </View>

        <View className="gap-4 rounded-2xl bg-white p-5 dark:bg-slate-800">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Kalorien letzte 7 Tage
          </Text>

          <View style={{ height: CHART_HEIGHT }} className="flex-row items-end justify-between">
            {weekStats.map((day) => {
              const barHeight = Math.max((day.calories / maxCalories) * CHART_HEIGHT, 4);
              const isOverGoal = day.calories > DAILY_CALORIE_GOAL;

              return (
                <View key={day.label} className="items-center gap-2">
                  <View
                    className="w-4 rounded-t"
                    style={{
                      height: barHeight,
                      backgroundColor: isOverGoal ? OVER_GOAL_COLOR : IN_GOAL_COLOR,
                    }}
                  />
                  <Text className="text-xs text-slate-400">{day.label}</Text>
                </View>
              );
            })}
          </View>

          <View className="flex-row items-center gap-4 pt-1">
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: IN_GOAL_COLOR }} />
              <Text className="text-xs text-slate-500 dark:text-slate-400">Im Ziel</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: OVER_GOAL_COLOR }} />
              <Text className="text-xs text-slate-500 dark:text-slate-400">Über Ziel</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
