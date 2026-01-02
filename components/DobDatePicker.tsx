import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DobDatePickerProps {
  value: string; // ISO date format: YYYY-MM-DD
  onChange: (date: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const DobDatePicker: React.FC<DobDatePickerProps> = ({ value, onChange, onValidationChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() - 25); // Default to ~25 years ago
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipDate, setTooltipDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate age from DOB
  const calculateAge = (dateString: string): number => {
    const dob = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Validate age >= 18
  const validateAge = (dateString: string): boolean => {
    const age = calculateAge(dateString);
    if (age < 18) {
      setValidationError('You must be at least 18 years old.');
      onValidationChange?.(false);
      return false;
    }
    setValidationError(null);
    onValidationChange?.(true);
    return true;
  };

  // Handle day selection
  const handleSelectDay = (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    const dateString = selected.toISOString().split('T')[0];
    
    if (validateAge(dateString)) {
      onChange(dateString);
      setIsOpen(false);
      // Update navigation to selected date
      setCurrentMonth(selected.getMonth());
      setCurrentYear(selected.getFullYear());
    }
  };

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) {
      setCurrentYear((prev) => prev - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) {
      setCurrentYear((prev) => prev + 1);
    }
  };

  // Navigate to previous year
  const handlePrevYear = () => {
    setCurrentYear((prev) => prev - 1);
  };

  // Navigate to next year
  const handleNextYear = () => {
    setCurrentYear((prev) => prev + 1);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Set calendar to selected date when value changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [value]);

  // Handle day hover
  const handleDayHover = (day: number | null) => {
    setHoveredDay(day);
    if (day !== null) {
      const hoverDate = new Date(currentYear, currentMonth, day);
      setTooltipDate(hoverDate.toISOString().split('T')[0]);
    } else {
      setTooltipDate(null);
    }
  };

  // Format displayed date in YYYY-MM-DD
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return dateString;
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0-6)
  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days with info about previous/next month
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
    
    const days: Array<{ day: number; isCurrentMonth: boolean; year: number; month: number }> = [];

    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, year: prevYear, month: prevMonth });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, year: currentYear, month: currentMonth });
    }

    // Add next month's days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({ day: i, isCurrentMonth: false, year: nextYear, month: nextMonth });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' });
  const selectedDate = value ? new Date(value) : null;
  const isSelectedMonth = selectedDate && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-deti-subtext uppercase ml-1">
          Date of Birth <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          readOnly
          value={formatDate(value)}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="YYYY-MM-DD"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all cursor-pointer hover:border-deti-primary/50"
        />
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-2 text-xs text-red-400">{validationError}</div>
      )}

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-lg border border-gray-200 p-5 z-50 w-80">
          {/* Header with Month/Year Navigation */}
          <div className="flex items-center justify-between mb-5 gap-1">
            {/* Previous Year Button */}
            <button
              onClick={handlePrevYear}
              className="px-2 py-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900 font-semibold text-sm"
              title="Previous year"
            >
              ≪
            </button>

            {/* Previous Month Button */}
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month Year Display */}
            <div className="text-center flex-1 min-w-0">
              <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                {monthName} {currentYear}
              </span>
            </div>

            {/* Next Month Button */}
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Next Year Button */}
            <button
              onClick={handleNextYear}
              className="px-2 py-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900 font-semibold text-sm"
              title="Next year"
            >
              ≫
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, idx) => {
              const isSelected = isSelectedMonth && selectedDate?.getDate() === dayInfo.day;
              const isHovered = hoveredDay === dayInfo.day && dayInfo.isCurrentMonth;

              return (
                <div key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}-${idx}`} className="relative">
                  <button
                    onClick={() => dayInfo.isCurrentMonth && handleSelectDay(dayInfo.day)}
                    onMouseEnter={() => dayInfo.isCurrentMonth && handleDayHover(dayInfo.day)}
                    onMouseLeave={() => handleDayHover(null)}
                    disabled={!dayInfo.isCurrentMonth}
                    className={`w-full h-8 text-xs font-medium rounded transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-200 text-gray-900 font-bold border border-blue-300'
                        : isHovered
                        ? 'bg-blue-100 text-gray-900'
                        : dayInfo.isCurrentMonth
                        ? 'text-gray-700 hover:bg-blue-100 cursor-pointer'
                        : 'text-gray-300 cursor-default'
                    }`}
                  >
                    {dayInfo.day}
                  </button>

                  {/* Tooltip on Hover */}
                  {isHovered && tooltipDate && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-md z-10 pointer-events-none">
                      {tooltipDate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
