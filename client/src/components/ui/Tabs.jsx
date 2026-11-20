// client/src/components/ui/Tabs.jsx
import React from 'react';
import clsx from 'clsx';

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={clsx(
        'inline-flex p-1 bg-cream-2 border border-line rounded-full overflow-x-auto max-w-full',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-150 flex items-center gap-2',
              isActive
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-2 hover:text-ink'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 text-xs rounded-full',
                  isActive ? 'bg-primary-soft text-ink' : 'bg-cream text-ink-2'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
