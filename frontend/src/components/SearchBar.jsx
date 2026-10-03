import { useState } from 'react'

const SUGGESTIONS = ['Neem', 'Banyan', 'Mango', 'Teak', 'Coconut']

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim())
      setQuery('')
    }
  }

  function handleButton() {
    if (query.trim()) {
      onSearch(query.trim())
      setQuery('')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a tree species..."
          className="flex-1 px-4 py-3 rounded-lg bg-forest-mid border border-forest-light text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-leaf-green transition-all"
        />
        <button
          onClick={handleButton}
          className="px-6 py-3 bg-leaf-dark hover:bg-leaf-green text-white font-semibold rounded-lg transition-colors"
        >
          🔍 Search
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(chip => (
          <button
            key={chip}
            onClick={() => onSearch(chip)}
            className="px-3 py-1 text-sm bg-forest-light hover:bg-leaf-dark text-leaf-light rounded-full border border-forest-light hover:border-leaf-green transition-colors"
          >
            🌿 {chip}
          </button>
        ))}
      </div>
    </div>
  )
}
