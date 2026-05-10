function ServerWakingUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="text-center max-w-md">
        {/* Animated Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-6 animate-pulse">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Server is waking up
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 text-lg">
          Our server is starting up. This may take up to 50 seconds. Please wait while we prepare everything for you.
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white rounded-full h-2 mb-4 overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full animate-[width_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
        </div>

        <p className="text-sm text-gray-500">
          Powered by Render
        </p>
      </div>
    </div>
  );
}

export default ServerWakingUp;
