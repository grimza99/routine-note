import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { workoutApi } from '../api/workoutApi';
import { Button, DefaultContainer } from '../../../shared/ui';
import { isSameDay } from '../../../shared/libs';
import { useMonth } from '../../../shared/hooks';

type CalendarCell = {
  key: string;
  dateText: string;
  date: Date;
  dayLabel: string;
  isCurrentMonth: boolean;
};

type WorkoutCalendarProps = {
  currentDate?: Date;
  onSelectDate: (selectedDate: Date) => void;
  recordDates?: string[];
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const createCalendarCells = (visibleMonth: Date): CalendarCell[] => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    const day = prevMonthDays - index;
    const date = new Date(year, month - 1, day);
    const dateText = workoutApi.toDate(date);
    cells.push({
      key: `prev-${dateText}`,
      dateText,
      date,
      dayLabel: String(day),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateText = workoutApi.toDate(date);
    cells.push({
      key: `curr-${dateText}`,
      dateText,
      date,
      dayLabel: String(day),
      isCurrentMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextDay);
    const dateText = workoutApi.toDate(date);
    cells.push({
      key: `next-${dateText}`,
      dateText,
      date,
      dayLabel: String(nextDay),
      isCurrentMonth: false,
    });
    nextDay += 1;
  }

  return cells;
};

export const WorkoutCalendar = ({ currentDate = new Date(), onSelectDate, recordDates }: WorkoutCalendarProps) => {
  const { currentMonth, handleChangeToday, monthLabel, handlePrevMonth, handleNextMonth } = useMonth(currentDate);
  const calendarCells = useMemo(() => createCalendarCells(currentMonth), [currentMonth]);

  const handleTodayPress = () => {
    handleChangeToday();
    onSelectDate(new Date());
  };
  return (
    <DefaultContainer variant="primary" style={{ gap: 12 }}>
      <View style={styles.calendarHeader}>
        <View style={styles.monthHeader}>
          <MaterialCommunityIcons name="arrow-left-drop-circle" size={24} color="#E60023" onPress={handlePrevMonth} />
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <MaterialCommunityIcons
            name="arrow-right-drop-circle"
            size={24}
            color="#E60023"
            onPress={() => handleNextMonth()}
          />
        </View>
        <Button label="오늘" onPress={handleTodayPress} variant="primary" style={styles.todayButton} />
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAY_LABELS.map((weekday) => (
          <Text key={weekday} style={styles.weekdayText}>
            {weekday}
          </Text>
        ))}
      </View>

      <FlatList
        data={calendarCells}
        keyExtractor={(item) => item.key}
        numColumns={7}
        scrollEnabled={false}
        columnWrapperStyle={styles.calendarRow}
        contentContainerStyle={styles.calendarGrid}
        renderItem={({ item }) => {
          const isSelected = isSameDay(currentDate, item.date);
          return (
            <View style={styles.dayCellItem}>
              <Pressable
                style={[
                  styles.dayCell,
                  !item.isCurrentMonth && styles.dayCellMuted,
                  isSelected && styles.selectedDayCell,
                ]}
                onPress={() => onSelectDate(item.date)}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    !item.isCurrentMonth && styles.dayCellTextMuted,
                    isSelected && styles.dayCellTextSelected,
                  ]}
                >
                  {/* {recordDates?.includes(item.dateText) && <Dot />} */}
                  {item.dayLabel}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </DefaultContainer>
  );
};

const styles = StyleSheet.create({
  calendarHeader: {
    position: 'relative',
    marginBottom: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E60023',
  },
  todayButton: {
    position: 'absolute',
    right: 0,
    top: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  weekdaysRow: {
    flexDirection: 'row',
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: '#E60023',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    gap: 6,
  },
  calendarRow: {
    gap: 6,
  },
  dayCellItem: {
    flex: 1,
  },
  dayCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  dayCellMuted: {
    borderColor: '#E6E6E6',
    opacity: 0.7,
  },
  selectedDayCell: {
    backgroundColor: '#E60023',
    borderRadius: 4,
  },
  dayCellText: {
    color: '#E60023',
    fontSize: 14,
  },
  dayCellTextMuted: {
    color: '#999999',
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
  },
});
