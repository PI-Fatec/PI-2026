'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import styles from './Datepicker.module.scss';

interface DatePickerProps {
  label: string;
  value?: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function toDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string) {
  const date = toDate(value);
  if (!date) return '';
  return date.toLocaleDateString('pt-BR');
}

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  label,
  value,
  onChangeValue,
  placeholder = 'Selecione uma data',
  disabled,
  error,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedDate = useMemo(() => toDate(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = selectedDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstWeekDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const leadingEmptyDays = Array.from({ length: firstWeekDay }, (_, idx) => idx);
  const monthDays = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);

  const monthLabel = currentMonth.toLocaleDateString('pt-BR', { month: 'long' });
  const yearLabel = String(currentMonth.getFullYear());
  const startYear = Math.floor(currentMonth.getFullYear() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, idx) => startYear + idx);
  const months = Array.from({ length: 12 }, (_, idx) =>
    new Date(2000, idx, 1).toLocaleDateString('pt-BR', { month: 'short' }),
  );

  const handleSelectDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChangeValue(toIso(date));
    setIsOpen(false);
  };

  const handlePrev = () => {
    if (view === 'years') {
      setCurrentMonth((prev) => new Date(prev.getFullYear() - 12, prev.getMonth(), 1));
      return;
    }

    if (view === 'months') {
      setCurrentMonth((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
      return;
    }

    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (view === 'years') {
      setCurrentMonth((prev) => new Date(prev.getFullYear() + 12, prev.getMonth(), 1));
      return;
    }

    if (view === 'months') {
      setCurrentMonth((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
      return;
    }

    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={styles.container} ref={rootRef}>
      <label className={styles.label}>{label}</label>
      <button
        type="button"
        className={`${styles.trigger} ${error ? styles.hasError : ''}`}
        disabled={disabled}
        onClick={() =>
          setIsOpen((prev) => {
            const next = !prev;
            if (next) setView('days');
            return next;
          })
        }
      >
        <span className={value ? styles.value : styles.placeholder}>{value ? formatDate(value) : placeholder}</span>
        <CalendarDays size={16} />
      </button>

      {isOpen && (
        <div className={styles.modal}>
          <div className={styles.header}>
            <button type="button" className={styles.navButton} onClick={handlePrev}>
              <ChevronLeft size={16} />
            </button>
            <div className={styles.headerCenter}>
              <button type="button" className={styles.switchButton} onClick={() => setView('months')}>
                {monthLabel}
              </button>
              <button type="button" className={styles.switchButton} onClick={() => setView('years')}>
                {yearLabel}
              </button>
            </div>
            <button type="button" className={styles.navButton} onClick={handleNext}>
              <ChevronRight size={16} />
            </button>
          </div>

          {view === 'days' && (
            <>
              <div className={styles.weekRow}>
                {weekDays.map((day) => (
                  <span key={day} className={styles.weekDay}>{day}</span>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {leadingEmptyDays.map((slot) => (
                  <span key={`empty-${slot}`} />
                ))}
                {monthDays.map((day) => {
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === currentMonth.getFullYear() &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      className={`${styles.dayButton} ${isSelected ? styles.daySelected : ''}`}
                      onClick={() => handleSelectDay(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === 'months' && (
            <div className={styles.pickerGrid}>
              {months.map((monthName, idx) => (
                <button
                  key={monthName}
                  type="button"
                  className={`${styles.pickerButton} ${currentMonth.getMonth() === idx ? styles.daySelected : ''}`}
                  onClick={() => {
                    setCurrentMonth((prev) => new Date(prev.getFullYear(), idx, 1));
                    setView('days');
                  }}
                >
                  {monthName}
                </button>
              ))}
            </div>
          )}

          {view === 'years' && (
            <div className={styles.pickerGrid}>
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`${styles.pickerButton} ${currentMonth.getFullYear() === year ? styles.daySelected : ''}`}
                  onClick={() => {
                    setCurrentMonth((prev) => new Date(year, prev.getMonth(), 1));
                    setView('months');
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
