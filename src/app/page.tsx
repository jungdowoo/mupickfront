"use client"

import { useState, useRef, useEffect } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  track?: {
    title: string
    artist: string
    videoId: string
  }
}

export default function Home() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [enteredChat, setEnteredChat] = useState(false)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]

    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // const cleanedMessages = newMessages.map((msg) =>
      //   msg.role === 'gpt' ? { ...msg, role: 'assistant' } : msg
      // )
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()

      if (data.track?.title && data.track?.artist && data.track?.videoId) {
        const gptMessage: ChatMessage = {
          role: 'assistant',
          content: `${data.reply}🎵 ${data.track.title} - ${data.track.artist}`,
          track: data.track,
        }
        setMessages((prev) => [...prev, gptMessage])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '😢 추천할 곡을 찾지 못했어요.' },
        ])
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ 오류가 발생했습니다.' }])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {!enteredChat ? (
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 text-center min-h-[200px]">
          <h1 className="text-2xl font-bold mb-2">뮤픽</h1>
          <p className="text-gray-600 text-sm mb-4">
            오늘도 뮤픽을 찾아주셔서 감사해요. <br />
            상황에 맞는 노래를 추천해드릴게요 
          </p>
          <button
            onClick={() => setEnteredChat(true)}
            className="bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600"
          >
            추천받기
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col flex-1 bg-white shadow-md rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4 p-2 border-b">
            <button onClick={() => setEnteredChat(false)}>
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <img src="/logo.png" alt="logo" className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">뮤픽</p>
              </div>
            </div>
          </div>
          <h1 className="text-xl font-bold text-center mb-4">뮤픽</h1>

          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-black rounded-lg px-4 py-2 max-w-sm">
                  <p className="mb-1 font-medium">안녕하세요! 👋</p>
                  <p className="text-sm leading-relaxed">
                    예: <span className="italic">새벽에 혼자 있을 때 듣기 좋은 잔잔한 노래</span><br />
                    이런 식으로 상황이나 기분을 말씀해주시면 곡을 추천해드릴게요!
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  <p>{msg.content}</p>
                  {msg.track?.videoId && (
                    <div className="mt-2">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${msg.track.videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 혼자 걷는 밤에 듣기 좋은 노래"
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? '추천 중...' : '전송'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
