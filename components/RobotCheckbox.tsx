import React from 'react';

interface RobotCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RobotCheckbox: React.FC<RobotCheckboxProps> = ({ checked, onChange }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-[#1a1a2e] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 accent-deti-primary cursor-pointer flex-shrink-0"
      />

      {/* Label */}
      <div className="flex-grow min-w-0">
        <label className="text-sm font-medium text-gray-800 dark:text-gray-100 cursor-pointer select-none">
          I'm not a robot
        </label>
      </div>

      {/* reCAPTCHA branding */}
      <div className="flex flex-col items-end text-right flex-shrink-0">
        <div className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">reCAPTCHA</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy</a>
          {' - '}
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );
};
