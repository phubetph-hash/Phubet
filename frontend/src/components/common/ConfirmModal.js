'use client';

export default function ConfirmModal({ modal, onDismiss }) {
  if (!modal) return null;

  const toneClasses = {
    info: 'border-indigo-200',
    warning: 'border-red-200',
    success: 'border-green-200',
    error: 'border-red-200',
  };

  const accentClasses = {
    info: 'bg-indigo-500',
    warning: 'bg-red-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const buttonClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
  };

  const tone = toneClasses[modal.type] || toneClasses.info;
  const accent = accentClasses[modal.type] || accentClasses.info;

  const handleAction = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    onDismiss();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onDismiss}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-xl border-2 ${tone} bg-white shadow-xl`}>
          <div className={`flex items-center gap-3 border-b px-6 py-4`}>
            <div className={`h-3 w-3 rounded-full ${accent}`} />
            {modal.title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {modal.title}
              </h2>
            )}
          </div>

          <div className="px-6 py-4">
            <p className="text-gray-700">{modal.message}</p>
          </div>

          <div className="flex gap-3 border-t bg-gray-50 px-6 py-4">
            {modal.actions &&
              modal.actions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAction(action)}
                  className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    buttonClasses[action.variant] || buttonClasses.secondary
                  }`}
                >
                  {action.label}
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
