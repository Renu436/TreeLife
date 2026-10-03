import { motion } from 'framer-motion'

const CATEGORY_COLORS = {
  ecology: 'bg-green-700 text-green-100',
  uses: 'bg-yellow-700 text-yellow-100',
  research: 'bg-indigo-700 text-indigo-100',
  conservation: 'bg-red-700 text-red-100',
  geography: 'bg-sky-700 text-sky-100',
  news: 'bg-amber-700 text-amber-100'
}

export default function LeafPanel({ leaf, onClose }) {
  if (!leaf) return null

  const badgeClass = CATEGORY_COLORS[leaf.category] || 'bg-forest-light text-white'

  return (
    <motion.div
      className="fixed top-0 right-0 h-full w-96 max-w-full bg-forest-mid border-l border-forest-light shadow-2xl z-40 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-forest-light">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">🍃 {leaf.title}</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
            {leaf.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-white text-2xl leading-none transition-colors"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-gray-200 leading-relaxed mb-6">{leaf.content}</p>

        {leaf.sources && leaf.sources.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-leaf-light uppercase tracking-wide mb-3">
              Sources
            </h3>
            <ul className="space-y-2">
              {leaf.sources.map((src, i) => (
                <li key={i}>
                  {src.startsWith('http') ? (
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-leaf-green hover:text-leaf-light underline break-all transition-colors"
                    >
                      {src}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">• {src}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-forest-light text-xs text-gray-500">
        Retrieved: Current search
      </div>
    </motion.div>
  )
}
