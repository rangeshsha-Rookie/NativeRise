// client/src/components/ui/QuantityStepper.jsx
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { normalizeDigits } from '../../i18n/digits';

export function QuantityStepper({
  value = 1,
  onChange,
  min = 1,
  max = 50,
  disabled = false,
  className = ''
}) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e) => {
    const normalized = normalizeDigits(e.target.value);
    const parsed = parseInt(normalized, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  return (
    <div
      className={`inline-flex items-center border border-line rounded-full bg-surface shadow-sm h-10 select-none ${className}`}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        aria-label="Decrease quantity"
        className="w-10 h-full flex items-center justify-center text-ink hover:bg-cream-2 rounded-l-full disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={value}
        onChange={handleInputChange}
        className="w-12 text-center bg-transparent text-sm font-semibold text-ink focus:outline-none"
        aria-label="Quantity"
      />

      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        aria-label="Increase quantity"
        className="w-10 h-full flex items-center justify-center text-ink hover:bg-cream-2 rounded-r-full disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

export default QuantityStepper;
