'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  status?: string
  statusLabel?: string
  statusColor?: string
}

export default function ImageGallery({ images, status, statusLabel, statusColor }: Props) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="relative bg-white rounded-3xl border border-violet-100 h-72 flex flex-col items-center justify-center shadow-sm mb-4 overflow-hidden">
        <span className="text-8xl">🍠</span>
        <p className="text-xs text-violet-300 mt-3">사진 준비 중</p>
        {status && status !== 'selling' && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-3xl">
            <span className={`text-2xl font-black px-6 py-2 rounded-2xl ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        )}
      </div>
    )
  }

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <div className="relative bg-white rounded-3xl border border-violet-100 h-72 shadow-sm mb-4 overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={images[current]}
          alt={`상품 이미지 ${current + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 672px) 100vw, 672px"
          priority={current === 0}
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center text-xl transition-all"
            aria-label="이전 이미지"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center text-xl transition-all"
            aria-label="다음 이미지"
          >
            ›
          </button>

          <span className="absolute top-3 right-3 text-xs bg-black/40 text-white px-2.5 py-0.5 rounded-full font-medium">
            {current + 1} / {images.length}
          </span>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-white scale-110' : 'bg-white/50'
                }`}
                aria-label={`이미지 ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {status && status !== 'selling' && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-3xl">
          <span className={`text-2xl font-black px-6 py-2 rounded-2xl ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  )
}
