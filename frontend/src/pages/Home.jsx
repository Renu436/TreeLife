import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useTreeSearch from '../hooks/useTreeSearch'
import { getForest } from '../api/treeApi'
import SearchBar from '../components/SearchBar'
import ForestView from '../components/ForestView'
import ForestStats from '../components/ForestStats'
import TreeCard from '../components/TreeCard'
import LoadingGrowth from '../components/LoadingGrowth'

export default function Home() {
  const navigate = useNavigate()
  const { status, tree, error, search } = useTreeSearch()
  const [trees, setTrees] = useState([])
  const [currentQuery, setCurrentQuery] = useState('')

  useEffect(() => {
    getForest()
      .then(data => setTrees(data.trees || []))
      .catch(() => setTrees([]))
  }, [])

  // Navigate to tree page once grown
  useEffect(() => {
    if (status === 'growing' && tree) {
      // Refresh forest list
      getForest()
        .then(data => setTrees(data.trees || []))
        .catch(() => {})
      navigate('/tree/' + tree.id)
    }
  }, [status, tree, navigate])

  function handleSearch(query) {
    setCurrentQuery(query)
    search(query)
  }

  return (
    <div className="min-h-screen bg-forest-dark">
      {status === 'searching' && <LoadingGrowth query={currentQuery} />}

      <div className="flex h-screen overflow-hidden">
        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6">
          {/* Top bar */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-leaf-green mb-1">🌳 TreeLife AI</h1>
            <p className="text-gray-400 text-sm italic">Search doesn't return a page. Search grows a tree.</p>
          </div>

          {/* Search */}
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto w-full px-4 py-3 bg-red-900 bg-opacity-40 border border-red-700 rounded-lg text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Forest stats */}
          {trees.length > 0 && <ForestStats trees={trees} />}

          {/* Forest view */}
          <ForestView
            trees={trees}
            onTreeSelect={t => navigate('/tree/' + t.id)}
          />
        </div>

        {/* Right sidebar — tree list */}
        {trees.length > 0 && (
          <div className="w-72 flex-shrink-0 border-l border-forest-light bg-forest-mid overflow-y-auto p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide px-1">
              🌲 My Forest
            </h2>
            {trees.map(t => (
              <TreeCard
                key={t.id}
                tree={t}
                onSelect={() => navigate('/tree/' + t.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
