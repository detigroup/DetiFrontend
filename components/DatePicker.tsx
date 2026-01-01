import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate = new Date(),
  placeholder = 'YYYY-MM-DD',
  error = false,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const parsed = new Date(value + 'T00:00:00');
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    // Default to 18 years ago for DOB picker
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 18);
    return defaultDate;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    
    // Check bounds
    if (minDate && selected < minDate) return;
    if (maxDate && selected > maxDate) return;

    const isoString = selected.toISOString().split('T')[0];
    onChange(isoString);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: (number | null)[] = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          const dayDate = new Date(year, month, day);
          const isDisabled = 
            (minDate && dayDate < minDate) || 
            (maxDate && dayDate > maxDate);
          
          const isSelected = 
            selectedDate &&
            dayDate.getFullYear() === selectedDate.getFullYear() &&
            dayDate.getMonth() === selectedDate.getMonth() &&
            dayDate.getDate() === selectedDate.getDate();

          return (
            <button
              key={day}
              type="button"
              onClick={() => !isDisabled && handleDayClick(day)}
              disabled={isDisabled}
              className={`
                h-8 text-sm rounded-lg transition-all
                ${isSelected 
                  ? 'bg-blue-500 text-white font-bold hover:bg-blue-600' 
                  : isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    );
  };

  const displayValue = value || '';

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        readOnly
        placeholder={placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`${className} cursor-pointer`}
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 w-80">
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous Year"
            >
              <ChevronsLeft size={18} className="text-gray-600" />
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            
            <div className="text-center min-w-[120px]">
              <span className="text-base font-bold text-gray-800">
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Year"
            >
              <ChevronsRight size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-bold text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {renderCalendar()}
        </div>
      )}
    </div>
  );
};
