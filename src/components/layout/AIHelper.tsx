'use client'

import { useState } from 'react'
import { MessageCircle, X, Sparkles, Send } from 'lucide-react'
import { clsx } from 'clsx'

interface AIHelperProps {
  context?: string
}

export default function AIHelper({ context = 'general' }: AIHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const contextualPrompts = {
    products: [
      'Create product from image',
      'Generate SEO description',
      'Suggest pricing strategy',
      'Create social media posts'
    ],
    platforms: [
      'Check Etsy optimization',
      'Sync with Shopify',
      'Update Printful products',
      'Compare platform fees'
    ],
    files: [
      'Enhance image with Topaz',
      'Remove background',
      'Create mockups',
      'Optimize for web'
    ],
    content: [
      'Generate Instagram caption',
      'Create TikTok script',
      'Schedule posts',
      'Analyze engagement'
    ],
    general: [
      'How can I help?',
      'Create product listing',
      'Optimize content',
      'Check analytics'
    ]
  }

  const handleSend = () => {
    if (!message.trim()) return
    
    setMessages([...messages, { role: 'user', content: message }])
    // Here you would integrate with your actual AI service
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I'll help you with: "${message}". This feature will be connected to your AI service.` 
      }])
    }, 500)
    setMessage('')
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50',
          isOpen && 'scale-0'
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat window */}
      <div className={clsx(
        'fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl transition-all z-50',
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Hey! I can help you with:
              </p>
              <div className="space-y-2">
                {contextualPrompts[context as keyof typeof contextualPrompts]?.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(prompt)}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[80%] px-4 py-2 rounded-lg',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex space-x-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}