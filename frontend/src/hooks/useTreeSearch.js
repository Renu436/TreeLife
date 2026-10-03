import { useState } from 'react'
import { searchTree } from '../api/treeApi'

export default function useTreeSearch() {
  const [status, setStatus] = useState('idle')
  const [tree, setTree] = useState(null)
  const [error, setError] = useState(null)

  async function search(query) {
    setStatus('searching')
    setError(null)
    try {
      const result = await searchTree(query)
      setTree(result)
      setStatus('growing')
      setTimeout(() => setStatus('done'), 3000)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  function reset() {
    setStatus('idle')
    setTree(null)
    setError(null)
  }

  return { status, tree, error, search, reset }
}
