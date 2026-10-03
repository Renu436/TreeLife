import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { chatWithTree } from '../api/treeApi'

export default function TreeMind({ tree }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSend() {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const data = await chatWithTree(tree.id, msg)
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not get a response right now.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const recentMessages = messages.slice(-5)

  return (
    <div className="border-t border-forest-light bg-forest-mid">
      {/* Collapsed bar */}
      <button
        className="w-full flex items-center justify-between px-5 py-3 text-leaf-light hover:text-leaf-green transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold">🌿 Ask the Forest</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="px-4 pb-2 max-h-48 overflow-y-auto space-y-2">
              {recentMessages.length === 0 && (
                <p className="text-sm text-gray-500 py-2 text-center">
                  Ask anything about {tree?.common_name}...
                </p>
              )}
              {recentMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-forest-light text-white ml-8'
                      : 'bg-leaf-dark bg-opacity-20 text-leaf-light mr-8'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className="text-sm text-gray-400 mr-8 px-3 py-2">
                  <span className="loading-ellipsis">Thinking</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 px-4 pb-4">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this tree..."
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-forest-dark border border-forest-light text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-leaf-green"
              />
              <button
                onClick={onSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 text-sm bg-leaf-dark hover:bg-leaf-green disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
