'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { STATUS_OPTIONS } from '@/lib/constants'

interface Props {
  productId:     string
  currentStatus: string
}

export default function StatusChanger({ productId, currentStatus }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = async (status: string) => {
    if (status === currentStatus) { setOpen(false); return }
    setLoading(true)
    await supabase.from('products').update({ status }).eq('id', productId)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  const current = STATUS_OPTIONS.find(s => s.value === currentStatus)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-violet-200"
      >
        {current?.emoji} 상태 변경
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center">
          {/* 딤 처리 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* 바텀 시트 */}
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-[slideUp_0.25s_ease-out]">
            {/* 핸들 바 */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

            <h3 className="text-lg font-black text-gray-800 mb-1">판매 상태 변경</h3>
            <p className="text-sm text-gray-400 mb-5">현재: <strong className="text-violet-600">{current?.label}</strong></p>

            <div className="space-y-2">
              {STATUS_OPTIONS.map(({ value, label, emoji, desc }) => {
                const isActive = currentStatus === value
                return (
                  <button
                    key={value}
                    onClick={() => handleChange(value)}
                    disabled={loading}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all text-left disabled:opacity-60 ${
                      isActive
                        ? 'border-violet-400 bg-violet-50 shadow-sm'
                        : 'border-gray-100 hover:border-violet-200 hover:bg-violet-50/50'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{emoji}</span>
                    <div className="min-w-0">
                      <p className={`font-bold text-sm ${isActive ? 'text-violet-700' : 'text-gray-800'}`}>
                        {label}
                        {isActive && (
                          <span className="ml-2 text-[10px] font-medium bg-violet-100 text-violet-500 px-1.5 py-0.5 rounded-full">
                            현재
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
