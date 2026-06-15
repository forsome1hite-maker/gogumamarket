'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, CONDITIONS } from '@/lib/constants'

interface Product {
  id:          string
  title:       string
  category:    string
  condition:   string
  price:       number
  description: string
  location:    string | null
}

export default function EditForm({ product }: { product: Product }) {
  const router   = useRouter()
  const supabase = createClient()

  const [title,       setTitle]       = useState(product.title)
  const [category,    setCategory]    = useState(product.category)
  const [condition,   setCondition]   = useState(product.condition)
  const [price,       setPrice]       = useState(product.price > 0 ? String(product.price) : '')
  const [isFree,      setIsFree]      = useState(product.price === 0)
  const [description, setDescription] = useState(product.description)
  const [location,    setLocation]    = useState(product.location ?? '')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const displayPrice = price ? parseInt(price).toLocaleString('ko-KR') : ''

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value.replace(/[^0-9]/g, ''))
  }

  const handleFreeToggle = () => {
    setIsFree(prev => {
      if (!prev) setPrice('0')
      else setPrice('')
      return !prev
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!category)        { setError('카테고리를 선택해주세요'); return }
    if (!condition)       { setError('상품 상태를 선택해주세요'); return }
    if (!isFree && !price){ setError('가격을 입력해주세요'); return }

    setLoading(true)

    const { error: dbError } = await supabase
      .from('products')
      .update({
        title:       title.trim(),
        description: description.trim(),
        price:       isFree ? 0 : parseInt(price),
        category,
        condition,
        location:    location.trim() || null,
      })
      .eq('id', product.id)

    if (dbError) {
      setError('수정에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    router.push(`/products/${product.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">

      {/* ── 제목 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          제목 <span className="text-violet-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          maxLength={40}
          className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm"
        />
        <p className="text-right text-xs text-gray-400 mt-1">{title.length}/40</p>
      </section>

      {/* ── 카테고리 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          카테고리 <span className="text-violet-500">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CATEGORIES.map(({ value, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${
                category === value
                  ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200'
                  : 'border-violet-100 text-gray-600 hover:border-violet-300 hover:bg-violet-50'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="leading-tight text-center">{value}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 상품 상태 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          상품 상태 <span className="text-violet-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCondition(value)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                condition === value
                  ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200'
                  : 'border-violet-100 hover:border-violet-300 hover:bg-violet-50'
              }`}
            >
              <p className={`text-sm font-bold ${condition === value ? 'text-white' : 'text-gray-800'}`}>{label}</p>
              <p className={`text-xs mt-0.5 ${condition === value ? 'text-violet-200' : 'text-gray-400'}`}>{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── 가격 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700">
            가격 <span className="text-violet-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleFreeToggle}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isFree
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-violet-200 text-violet-600 hover:bg-violet-50'
            }`}
          >
            🎁 무료나눔
          </button>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₩</span>
          <input
            type="text"
            value={isFree ? '무료나눔' : displayPrice}
            onChange={handlePriceChange}
            placeholder="가격을 입력하세요"
            disabled={isFree}
            inputMode="numeric"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        {price && !isFree && (
          <p className="text-xs text-violet-500 mt-1.5 font-medium">
            {parseInt(price).toLocaleString('ko-KR')}원
          </p>
        )}
      </section>

      {/* ── 설명 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          설명 <span className="text-violet-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          maxLength={2000}
          rows={7}
          className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-1">{description.length}/2000</p>
      </section>

      {/* ── 거래 희망 지역 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          거래 희망 지역
          <span className="text-gray-400 font-normal text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="ex) 서울 강남구, 판교역 근처"
          maxLength={30}
          className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm"
        />
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      {/* ── 버튼 ── */}
      <div className="flex gap-3">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 py-4 text-center text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={loading || !title || !category || !condition || (!isFree && !price) || !description}
          className="flex-[2] py-4 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-violet-300 rounded-2xl shadow-lg shadow-violet-200 transition-all"
        >
          {loading ? '저장 중...' : '수정 완료 ✓'}
        </button>
      </div>
    </form>
  )
}
