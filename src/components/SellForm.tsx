'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: '디지털기기',    emoji: '📱' },
  { value: '생활가전',      emoji: '🔌' },
  { value: '가구/인테리어', emoji: '🪑' },
  { value: '생활/주방',     emoji: '🍳' },
  { value: '의류/잡화',     emoji: '👗' },
  { value: '도서/티켓/음반',emoji: '📚' },
  { value: '스포츠/레저',   emoji: '⚽' },
  { value: '취미/게임',     emoji: '🎮' },
  { value: '반려동물용품',  emoji: '🐾' },
  { value: '식물',          emoji: '🌿' },
  { value: '기타',          emoji: '📦' },
]

const CONDITIONS = [
  { value: 'new',           label: '새상품 (미사용)',  desc: '사용한 적 없어요' },
  { value: 'like_new',      label: '거의 새것',        desc: '사용감이 거의 없어요' },
  { value: 'used',          label: '사용감 있음',      desc: '사용했지만 상태 양호' },
  { value: 'heavily_used',  label: '많이 사용함',      desc: '사용감이 많이 있어요' },
]

const MAX_IMAGES = 5

export default function SellForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageFiles,    setImageFiles]    = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [title,         setTitle]         = useState('')
  const [category,      setCategory]      = useState('')
  const [condition,     setCondition]     = useState('')
  const [price,         setPrice]         = useState('')
  const [isFree,        setIsFree]        = useState(false)
  const [description,   setDescription]   = useState('')
  const [location,      setLocation]      = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - imageFiles.length
    const toAdd = files.slice(0, remaining)
    setImageFiles(prev => [...prev, ...toAdd])
    toAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setImagePreviews(prev => [...prev, ev.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setPrice(raw)
  }

  const displayPrice = price ? parseInt(price).toLocaleString('ko-KR') : ''

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
    if (!category) { setError('카테고리를 선택해주세요'); return }
    if (!condition) { setError('상품 상태를 선택해주세요'); return }
    if (!isFree && !price) { setError('가격을 입력해주세요'); return }

    setLoading(true)

    // 1. 상품 등록 (ID를 받아오기 위해 select 포함)
    const { data: inserted, error: dbError } = await supabase
      .from('products')
      .insert({
        user_id:     userId,
        title:       title.trim(),
        description: description.trim(),
        price:       isFree ? 0 : parseInt(price),
        category,
        condition,
        location:    location.trim() || null,
      })
      .select('id')
      .single()

    if (dbError || !inserted) {
      setError('등록에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
      return
    }

    // 2. 이미지 업로드
    if (imageFiles.length > 0) {
      const urls: string[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const ext  = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${inserted.id}/${i}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(path, file)
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(path)
          urls.push(publicUrl)
        }
      }
      if (urls.length > 0) {
        await supabase.from('products').update({ image_urls: urls }).eq('id', inserted.id)
      }
    }

    router.push('/market')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">

      {/* ── 사진 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-gray-700">
            사진
            <span className="text-gray-400 font-normal text-xs ml-1">(선택, 최대 {MAX_IMAGES}장)</span>
          </label>
          <span className="text-xs text-violet-400 font-medium">{imageFiles.length} / {MAX_IMAGES}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* 업로드 버튼 */}
          {imageFiles.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-violet-200 flex flex-col items-center justify-center gap-1 text-violet-400 hover:border-violet-400 hover:bg-violet-50 transition-all shrink-0"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs">사진 추가</span>
            </button>
          )}

          {/* 미리보기 */}
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-violet-100 shrink-0">
              <Image src={src} alt={`미리보기 ${i + 1}`} fill className="object-cover" sizes="80px" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold bg-violet-600/80 text-white py-0.5">
                  대표
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs leading-none transition-all"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-2">
          첫 번째 사진이 대표 이미지로 사용돼요. JPG, PNG, WEBP (최대 5MB)
        </p>
      </section>

      {/* ── 제목 ── */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          제목 <span className="text-violet-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex) 애플 에어팟 프로 2세대 판매합니다"
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
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`상품에 대해 자세히 설명해주세요.\n\n구매 시기, 사용 기간, 하자 여부 등을 알려주시면 더 빠르게 거래할 수 있어요 🍠`}
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
          거래 희망 지역 <span className="text-gray-400 font-normal text-xs ml-1">(선택)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="ex) 서울 강남구, 판교역 근처"
          maxLength={30}
          className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm"
        />
      </section>

      {/* ── 에러 ── */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      {/* ── 버튼 ── */}
      <div className="flex gap-3">
        <Link
          href="/market"
          className="flex-1 py-4 text-center text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={loading || !title || !category || !condition || (!isFree && !price) || !description}
          className="flex-2 w-full py-4 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-violet-300 rounded-2xl shadow-lg shadow-violet-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? '등록 중...' : '판매글 올리기 🍠'}
        </button>
      </div>
    </form>
  )
}
