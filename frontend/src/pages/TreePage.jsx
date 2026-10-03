import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTree } from '../api/treeApi'
import TreeVisualization from '../components/TreeVisualization'
import LeafPanel from '../components/LeafPanel'
import TreeMind from '../components/TreeMind'
import { AnimatePresence } from 'framer-motion'

const CATEGORY_ICONS = {
  ecology: '🌿',
  uses: '🔧',
  research: '🔬',
  conservation: '🛡️',
  geography: '🗺️',
  news: '📰'
}

const CATEGORY_COLORS = {
  ecology: 'border-green-700 bg-green-900',
  uses: 'border-yellow-700 bg-yellow-900',
  research: 'border-indigo-700 bg-indigo-900',
  conservation: 'border-red-700 bg-red-900',
  geography: 'border-sky-700 bg-sky-900',
  news: 'border-amber-700 bg-amber-900'
}

export default function TreePage() {
  const { id } = useParams()
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLeaf, setSelectedLeaf] = useState(null)
  const [openCategory, setOpenCategory] = useState(null)
  const leafRefs = useRef({})

  useEffect(() => {
    setLoading(true)
    getTree(id)
      .then(data => {
        setTree(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function handleLeafClick(leaf) {
    setSelectedLeaf(leaf)
    // Also open the category accordion and scroll to it
    setOpenCategory(leaf.category)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-leaf-light text-lg animate-pulse">Loading tree knowledge...</p>
        </div>
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Tree not found</p>
          <Link to="/" className="text-leaf-green hover:text-leaf-light underline">← Back to Forest</Link>
        </div>
      </div>
    )
  }

  const branches = tree.knowledge_data?.branches || {}

  return (
    <div className="min-h-screen bg-forest-dark flex flex-col">
      {/* Top nav */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-forest-light bg-forest-mid">
        <Link to="/" className="text-leaf-green hover:text-leaf-light transition-colors text-sm">
          ← Back to Forest
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            🌳 {tree.common_name}
          </h1>
          {tree.scientific_name && (
            <p className="text-sm text-gray-400 italic">{tree.scientific_name}</p>
          )}
        </div>
        <span className="text-sm bg-leaf-dark bg-opacity-30 text-leaf-light px-3 py-1 rounded-full">
          🍃 {tree.total_leaves} leaves
        </span>
      </div>

      {/* Main content — 2 col */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden">
        {/* Left — Tree visualization (60%) */}
        <div className="lg:col-span-3 p-4 flex items-start justify-center overflow-y-auto">
          <div className="w-full" style={{ maxWidth: '800px' }}>
            <TreeVisualization
              treeData={tree.knowledge_data}
              onLeafClick={handleLeafClick}
            />
          </div>
        </div>

        {/* Right — Knowledge accordion (40%) */}
        <div className="lg:col-span-2 border-l border-forest-light flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Roots info */}
            {tree.knowledge_data?.roots && (
              <div className="bg-forest-mid rounded-xl p-4 border border-forest-light">
                <h3 className="font-bold text-leaf-light mb-2">🌿 Roots — Foundational</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  {Object.entries(tree.knowledge_data.roots).map(([k, v]) => (
                    <p key={k}><span className="text-gray-500 capitalize">{k}:</span> {v}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Trunk info */}
            {tree.knowledge_data?.trunk && (
              <div className="bg-forest-mid rounded-xl p-4 border border-forest-light">
                <h3 className="font-bold text-leaf-light mb-2">🌳 Trunk — Characteristics</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  {Object.entries(tree.knowledge_data.trunk).map(([k, v]) => (
                    <p key={k}><span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}:</span> {v}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Branch categories accordion */}
            {Object.entries(branches).map(([category, leaves]) => {
              if (!Array.isArray(leaves) || leaves.length === 0) return null
              const isOpen = openCategory === category
              const icon = CATEGORY_ICONS[category] || '🍃'
              const colorClass = CATEGORY_COLORS[category] || 'border-forest-light bg-forest-mid'
              return (
                <div key={category} className={`rounded-xl border ${colorClass} bg-opacity-20 overflow-hidden`}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setOpenCategory(isOpen ? null : category)}
                  >
                    <span className="font-semibold text-white capitalize">
                      {icon} {category} <span className="text-xs text-gray-400 ml-1">({leaves.length})</span>
                    </span>
                    <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-2">
                      {leaves.map((leaf, li) => (
                        <div
                          key={li}
                          ref={el => { leafRefs.current[`${category}-${li}`] = el }}
                          className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${
                            selectedLeaf === leaf
                              ? 'bg-white bg-opacity-10 ring-1 ring-leaf-green'
                              : 'bg-black bg-opacity-20 hover:bg-opacity-30'
                          }`}
                          onClick={() => setSelectedLeaf(leaf)}
                        >
                          <p className="font-medium text-white">🍃 {leaf.title}</p>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{leaf.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* TreeMind chat — collapsed by default */}
          <TreeMind tree={tree} />
        </div>
      </div>

      {/* Leaf detail panel */}
      <AnimatePresence>
        {selectedLeaf && (
          <LeafPanel
            leaf={selectedLeaf}
            onClose={() => setSelectedLeaf(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
