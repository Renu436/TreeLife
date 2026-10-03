import { useState } from 'react'
import { motion } from 'framer-motion'

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h += str.charCodeAt(i)
  }
  return h
}

const TREE_EMOJIS = {
  palm: '🌴',
  conifer: '🌲',
  shrub: '🌿',
  deciduous: '🌳'
}

function getEmoji(treeType) {
  if (!treeType) return '🌳'
  const lower = treeType.toLowerCase()
  if (lower.includes('palm')) return '🌴'
  if (lower.includes('conifer') || lower.includes('pine')) return '🌲'
  if (lower.includes('shrub') || lower.includes('mangrove')) return '🌿'
  return '🌳'
}

export default function ForestView({ trees = [], onTreeSelect }) {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  function handleWheel(e) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.min(3, Math.max(0.3, z * delta)))
  }

  function handleMouseDown(e) {
    setDragging(true)
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  function handleMouseMove(e) {
    if (!dragging) return
    setPanX(x => x + e.clientX - lastPos.x)
    setPanY(y => y + e.clientY - lastPos.y)
    setLastPos({ x: e.clientX, y: e.clientY })
  }

  function handleMouseUp() {
    setDragging(false)
  }

  return (
    <div className="w-full rounded-xl overflow-hidden bg-forest-mid border border-forest-light" style={{ position: 'relative' }}>
      <svg
        width="100%"
        height="400"
        viewBox="0 0 800 600"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab', display: 'block' }}
      >
        {/* Radial gradient background */}
        <defs>
          <radialGradient id="forestBg" cx="50%" cy="80%" r="70%">
            <stop offset="0%" stopColor="#1a3a2a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0d1f17" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill="url(#forestBg)" />

        {/* Ground line */}
        <line x1="0" y1="530" x2="800" y2="530" stroke="#2d5a40" strokeWidth="2" opacity="0.5" />

        <motion.g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          {trees.length === 0 ? (
            <text
              x="400"
              y="300"
              textAnchor="middle"
              fill="#4ade80"
              fontSize="18"
              fontFamily="system-ui"
              opacity="0.7"
            >
              🌱 Your forest is empty — search for a tree to begin
            </text>
          ) : (
            trees.map((tree, i) => {
              const name = tree.common_name || ''
              const h = hashStr(name)
              const x = Math.sin(h * Math.PI) * 280 + 400
              const y = Math.cos(h * 2 * Math.PI) * 180 + 300
              const emoji = getEmoji(tree.tree_type)
              return (
                <g
                  key={tree.id || i}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onTreeSelect && onTreeSelect(tree)}
                >
                  <motion.text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="32"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    whileHover={{ scale: 1.3 }}
                  >
                    {emoji}
                  </motion.text>
                  <motion.text
                    x={x}
                    y={y + 22}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#86efac"
                    fontFamily="system-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    {name}
                  </motion.text>
                </g>
              )
            })
          )}
        </motion.g>

        {/* Forest label */}
        <text x="400" y="570" textAnchor="middle" fill="#4ade80" fontSize="13" fontFamily="system-ui" opacity="0.6">
          ── MY KNOWLEDGE FOREST ──
        </text>
      </svg>
    </div>
  )
}
