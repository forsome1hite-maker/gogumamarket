'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ productId }: { productId: string }) {
  const router   = useRouter()
  const supabase = createClient()
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      alert('삭제에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }
    router.push('/market')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-500 font-bold text-sm rounded-xl transition-all border border-red-100"
      >
        삭제
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 딤 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* 확인 다이얼로그 */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm">
            <div className="text-4xl text-center mb-4">🗑️</div>
            <h3 className="text-lg font-black text-gray-800 text-center mb-2">
              판매글을 삭제할까요?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-7 leading-relaxed">
              삭제된 글은 복구할 수 없어요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-3.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-md shadow-red-100 disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
