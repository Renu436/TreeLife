import { motion } from 'framer-motion'

const BRANCH_ANGLES = {
  3: [-65, 0, 65],
  4: [-65, -20, 20, 65],
  5: [-70, -35, 0, 35, 70],
  6: [-70, -42, -14, 14, 42, 70]
}

const LEAF_COLORS = {
  ecology: '#16a34a',
  uses: '#d97706',
  research: '#6366f1',
  conservation: '#ef4444',
  geography: '#0ea5e9',
  news: '#f59e0b'
}

function degToRad(deg) {
  return (deg * Math.PI) / 180
}

// Compute endpoint of a branch given start, angle (from vertical up), length
function branchEndpoint(startX, startY, angleDeg, length) {
  const rad = degToRad(angleDeg)
  return {
    x: startX + Math.sin(rad) * length,
    y: startY - Math.cos(rad) * length
  }
}

// Point along the trunk at a given t (0=base, 1=top)
function trunkPoint(t) {
  // Cubic bezier: M400,650 C380,550 410,450 400,350
  const p0 = { x: 400, y: 650 }
  const p1 = { x: 380, y: 550 }
  const p2 = { x: 410, y: 450 }
  const p3 = { x: 400, y: 350 }
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
  }
}

export default function TreeVisualization({ treeData, onLeafClick }) {
  if (!treeData) return null

  // Flatten all leaves from branches
  const allLeaves = []
  const branches = treeData.branches || {}
  Object.entries(branches).forEach(([category, leaves]) => {
    if (Array.isArray(leaves)) {
      leaves.forEach(leaf => allLeaves.push({ ...leaf, category }))
    }
  })

  const branchCount = Math.min(6, Math.max(3, Math.floor(allLeaves.length / 6)))
  const angles = BRANCH_ANGLES[branchCount] || BRANCH_ANGLES[3]

  // Roots: 5 paths from trunk base spreading outward
  const rootPaths = [
    'M400,650 Q360,670 330,680',
    'M400,650 Q380,680 360,700',
    'M400,650 Q400,680 400,700',
    'M400,650 Q420,680 440,700',
    'M400,650 Q440,670 470,680'
  ]

  // Build branch data with endpoints
  const branchData = angles.map((angleDeg, i) => {
    const attachT = 0.25 + (i / (branchCount - 1 || 1)) * 0.55
    const attach = trunkPoint(attachT)
    const length = 60 + (i * 37) % 40 + 30
    const end = branchEndpoint(attach.x, attach.y, angleDeg, length)
    return { angleDeg, attach, end, length }
  })

  // Sub-branches: 2 per major branch
  const subBranchData = branchData.flatMap((branch, bi) => {
    return [0, 1].map(si => {
      const t = 0.4 + si * 0.3
      const midX = branch.attach.x + (branch.end.x - branch.attach.x) * t
      const midY = branch.attach.y + (branch.end.y - branch.attach.y) * t
      const subAngle = branch.angleDeg + (si === 0 ? -35 : 35)
      const subLength = branch.length * 0.45
      const subEnd = branchEndpoint(midX, midY, subAngle, subLength)
      return { branchIndex: bi, subIndex: si, start: { x: midX, y: midY }, end: subEnd }
    })
  })

  // Distribute leaves across sub-branch endpoints
  const leafElements = allLeaves.map((leaf, li) => {
    const subIdx = li % subBranchData.length
    const sub = subBranchData[subIdx]
    const offsetAngle = (li / subBranchData.length) * Math.PI * 2
    const spreadRadius = 20 + (li % 3) * 12
    const cx = sub.end.x + Math.cos(offsetAngle) * spreadRadius * 0.6
    const cy = sub.end.y + Math.sin(offsetAngle) * spreadRadius * 0.6
    const color = LEAF_COLORS[leaf.category] || '#16a34a'
    return { leaf, cx, cy, color, index: li }
  })

  return (
    <svg
      viewBox="0 0 800 700"
      className="w-full h-full"
      style={{ maxHeight: '700px' }}
    >
      {/* Background radial glow */}
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="75%" r="60%">
          <stop offset="0%" stopColor="#1a3a2a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0d1f17" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="700" fill="url(#bgGlow)" />

      {/* Seed */}
      <motion.circle
        cx={400}
        cy={650}
        r={8}
        fill="#92400e"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0 }}
      />

      {/* Roots */}
      {rootPaths.map((d, i) => (
        <motion.path
          key={`root-${i}`}
          d={d}
          stroke="#92400e"
          strokeWidth={3 - i * 0.2}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
        />
      ))}

      {/* Trunk */}
      <motion.path
        d="M400,650 C380,550 410,450 400,350"
        stroke="#92400e"
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 1.1, ease: 'easeOut' }}
      />

      {/* Major branches */}
      {branchData.map((branch, i) => (
        <motion.path
          key={`branch-${i}`}
          d={`M${branch.attach.x},${branch.attach.y} Q${(branch.attach.x + branch.end.x) / 2},${branch.attach.y - 20} ${branch.end.x},${branch.end.y}`}
          stroke="#4ade80"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.3 + i * 0.15, ease: 'easeOut' }}
        />
      ))}

      {/* Sub-branches */}
      {subBranchData.map((sub, i) => (
        <motion.path
          key={`sub-${i}`}
          d={`M${sub.start.x},${sub.start.y} Q${(sub.start.x + sub.end.x) / 2},${sub.start.y - 10} ${sub.end.x},${sub.end.y}`}
          stroke="#86efac"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 0.5, delay: 3.5 + i * 0.08, ease: 'easeOut' }}
        />
      ))}

      {/* Leaves */}
      {leafElements.map(({ leaf, cx, cy, color, index }) => (
        <motion.ellipse
          key={`leaf-${index}`}
          cx={cx}
          cy={cy}
          rx={12}
          ry={18}
          fill={color}
          opacity={0.85}
          style={{ cursor: 'pointer' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 4.5 + index * 0.08
          }}
          whileHover={{ scale: 1.4, opacity: 1 }}
          onClick={() => onLeafClick && onLeafClick(leaf)}
        />
      ))}

      {/* Category legend */}
      {Object.entries(LEAF_COLORS).map(([cat, color], i) => (
        <g key={cat} transform={`translate(15, ${20 + i * 22})`}>
          <circle r={6} cx={6} cy={6} fill={color} opacity={0.85} />
          <text x={16} y={10} fill="#94a3b8" fontSize={11} fontFamily="system-ui">
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </text>
        </g>
      ))}
    </svg>
  )
}
