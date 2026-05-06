interface Props {
  secondsLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const SessionWarningBanner = ({ secondsLeft, onStayLoggedIn, onLogout }: Props) => {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Session expiring soon</h2>
        </div>

        <p className="text-gray-600 mb-2">
          You've been inactive. Your session will expire in
        </p>
        <p className="text-4xl font-bold text-amber-600 mb-6 tabular-nums">{timeStr}</p>

        <div className="flex gap-3">
          <button
            onClick={onStayLoggedIn}
            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Stay logged in
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Log out
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionWarningBanner;
