'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  productId:      string
  userId:         string | null
  isOwner:        boolean
  initialCount:   number
  initiallyLiked: boolean
}

export default function LikeButton({
  productId,
  userId,
  isOwner,
  initialCount,
  initiallyLiked,
}: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [liked,   setLiked]   = useState(initiallyLiked)
  const [count,   setCount]   = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    // 내 글에는 좋아요를 누를 수 없음
    if (isOwner) return
    // 로그인 안 한 사람은 로그인 페이지로
    if (!userId) {
      router.push('/auth/signin')
      return
    }
    if (loading) return

    setLoading(true)

    if (liked) {
      // 이미 눌렀으면 -> 취소(삭제), 카운트 1 감소
      setLiked(false)
      setCount((c) => Math.max(0, c - 1))
      const { error } = await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId)
      if (error) {
        // 실패하면 원래대로 되돌리기
        setLiked(true)
        setCount((c) => c + 1)
        alert('잠시 후 다시 시도해주세요.')
      }
    } else {
      // 아직 안 눌렀으면 -> 추가, 카운트 1 증가
      setLiked(true)
      setCount((c) => c + 1)
      const { error } = await supabase
        .from('product_likes')
        .insert({ product_id: productId, user_id: userId })
      if (error) {
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
        alert('잠시 후 다시 시도해주세요.')
      }
    }

    setLoading(false)
    router.refresh()
  }

  // 내 글이면 누를 수 없는 안내 표시
  if (isOwner) {
    return (
      <div className="bg-white rounded-2xl border border-violet-100 px-5 py-4 shadow-sm flex items-center justify-center gap-2 text-gray-400">
        <span className="text-xl">🤍</span>
        <span className="text-sm font-bold">{count}</span>
        <span className="text-xs text-gray-300 ml-1">내 글에는 좋아요를 누를 수 없어요</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-2xl border px-5 py-4 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${
        liked
          ? 'bg-pink-50 border-pink-200 text-pink-600'
          : 'bg-white border-violet-100 text-gray-500 hover:border-pink-200 hover:text-pink-500'
      }`}
    >
      <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
      <span className="text-sm font-bold">{count}</span>
      <span className="text-xs ml-1">{liked ? '좋아요 취소' : '좋아요'}</span>
    </button>
  )
}
