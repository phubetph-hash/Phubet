'use client';

export default function InAppToast({ toast, onDismiss }) {
  const toneClasses = {
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    info: 'border-indigo-200 bg-white text-gray-900',
  };

  const accentClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-indigo-500',
  };

  const tone = toneClasses[toast.type] || toneClasses.info;
  const accent = accentClasses[toast.type] || accentClasses.info;

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    onDismiss(toast.id);
  };

  return (
    <div className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-lg ${tone}`}>
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold">{toast.title}</p>
          )}
          <p className="mt-1 text-sm leading-5">{toast.message}</p>
          {toast.actions && toast.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {toast.actions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAction(action)}
                  className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="ปิดการแจ้งเตือน"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
