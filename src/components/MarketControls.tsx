'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'

const SORTS = [
  { value: 'latest',     label: '최신순' },
  { value: 'price_asc',  label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
]

interface Props {
  sort:     string
  category: string | null
}

export default function MarketControls({ sort, category }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // 현재 URL 파라미터를 유지하면서 하나만 바꿔 이동
  const go = (key: 'sort' | 'category', value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    router.push(qs ? `/market?${qs}` : '/market', { scroll: false })
  }

  const chipBase =
    'px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap'
  const active   = 'bg-violet-600 text-white border-violet-600 shadow-sm'
  const inactive = 'bg-white text-gray-500 border-violet-100 hover:border-violet-300'

  return (
    <div className="bg-white rounded-2xl border border-violet-100 p-4 mb-4 shadow-sm space-y-3">
      {/* 정렬 */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400 shrink-0 w-10">정렬</span>
        <div className="flex gap-1.5 flex-wrap">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => go('sort', s.value === 'latest' ? null : s.value)}
              className={`${chipBase} ${sort === s.value ? active : inactive}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="flex items-start gap-2">
        <span className="text-xs font-bold text-gray-400 shrink-0 w-10 mt-1.5">분류</span>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => go('category', null)}
            className={`${chipBase} ${!category ? active : inactive}`}
          >
            전체
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => go('category', c.value)}
              className={`${chipBase} ${category === c.value ? active : inactive}`}
            >
              {c.emoji} {c.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
