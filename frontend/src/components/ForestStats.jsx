export default function ForestStats({ trees = [] }) {
  const totalTrees = trees.length
  const totalLeaves = trees.reduce((s, t) => s + (t.total_leaves || 0), 0)
  const mostRecent = trees.length > 0
    ? [...trees].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].common_name
    : null

  return (
    <div className="flex flex-wrap gap-4 px-4 py-3 bg-forest-mid rounded-xl border border-forest-light text-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌳</span>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Trees Explored</p>
          <p className="text-leaf-green font-bold text-lg">{totalTrees}</p>
        </div>
      </div>
      <div className="w-px bg-forest-light" />
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍃</span>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Knowledge Leaves</p>
          <p className="text-leaf-green font-bold text-lg">{totalLeaves}</p>
        </div>
      </div>
      {mostRecent && (
        <>
          <div className="w-px bg-forest-light" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Most Recent</p>
              <p className="text-leaf-light font-semibold">{mostRecent}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
