import { motion } from 'framer-motion'

function getEmoji(treeType) {
  if (!treeType) return '🌳'
  const lower = treeType.toLowerCase()
  if (lower.includes('palm')) return '🌴'
  if (lower.includes('conifer') || lower.includes('pine')) return '🌲'
  if (lower.includes('shrub') || lower.includes('mangrove')) return '🌿'
  return '🌳'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

export default function TreeCard({ tree, onSelect }) {
  return (
    <motion.div
      className="p-4 bg-forest-mid rounded-xl border border-forest-light cursor-pointer hover:border-leaf-green transition-colors"
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(74,222,128,0.15)' }}
      onClick={() => onSelect && onSelect(tree)}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{getEmoji(tree.tree_type)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{tree.common_name}</p>
          {tree.scientific_name && (
            <p className="text-xs text-gray-400 italic truncate">{tree.scientific_name}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs bg-leaf-dark bg-opacity-30 text-leaf-light px-2 py-1 rounded-full">
          🍃 {tree.total_leaves || 0} leaves
        </span>
        {tree.created_at && (
          <span className="text-xs text-gray-500">{formatDate(tree.created_at)}</span>
        )}
      </div>
    </motion.div>
  )
}
