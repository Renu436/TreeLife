export default function LoadingGrowth({ query }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-dark bg-opacity-95">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Trunk */}
        <path
          d="M100,180 C95,150 105,120 100,90"
          stroke="#92400e"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="grow-path"
          style={{ animationDelay: '0s' }}
        />
        {/* Left branch */}
        <path
          d="M100,110 Q70,90 55,70"
          stroke="#4ade80"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="grow-path"
          style={{ animationDelay: '0.3s' }}
        />
        {/* Right branch */}
        <path
          d="M100,110 Q130,90 145,70"
          stroke="#4ade80"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="grow-path"
          style={{ animationDelay: '0.6s' }}
        />
        {/* Center branch */}
        <path
          d="M100,100 Q100,75 100,55"
          stroke="#4ade80"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="grow-path"
          style={{ animationDelay: '0.9s' }}
        />
        {/* Leaves */}
        <circle cx="55" cy="65" r="10" fill="#16a34a" opacity="0.8" />
        <circle cx="145" cy="65" r="10" fill="#16a34a" opacity="0.8" />
        <circle cx="100" cy="50" r="12" fill="#16a34a" opacity="0.8" />
        {/* Root left */}
        <path
          d="M100,180 Q80,190 65,195"
          stroke="#92400e"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="grow-path"
          style={{ animationDelay: '0.15s' }}
        />
        {/* Root right */}
        <path
          d="M100,180 Q120,190 135,195"
          stroke="#92400e"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="grow-path"
          style={{ animationDelay: '0.25s' }}
        />
      </svg>
      <p className="mt-6 text-xl text-leaf-light font-semibold">
        Researching <span className="text-leaf-green">{query}</span>
        <span className="loading-ellipsis" />
      </p>
      <p className="mt-2 text-sm text-gray-400">Gathering knowledge from the forest</p>
    </div>
  )
}
