import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export const dynamic = 'force-dynamic'

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new:          { label: '새상품 (미사용)',  color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  like_new:     { label: '거의 새것',        color: 'bg-sky-50 text-sky-600 border border-sky-100' },
  used:         { label: '사용감 있음',      color: 'bg-amber-50 text-amber-600 border border-amber-100' },
  heavily_used: { label: '많이 사용함',      color: 'bg-orange-50 text-orange-500 border border-orange-100' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  selling:  { label: '판매중',   color: 'bg-violet-600 text-white' },
  reserved: { label: '예약중',   color: 'bg-yellow-400 text-white' },
  sold:     { label: '판매완료', color: 'bg-gray-400 text-white' },
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)     return '방금 전'
  if (diff < 3600)   return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 조회수 먼저 증가 (SECURITY DEFINER 함수로 RLS 우회)
  await supabase.rpc('increment_product_views', { product_id: id })

  // 상품 + 로그인 유저 병렬 조회
  const [
    { data: product, error },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (error || !product) notFound()

  // 판매자 + 내 프로필 병렬 조회
  const [{ data: seller }, { data: myProfile }] = await Promise.all([
    supabase.from('profiles').select('nickname, created_at').eq('id', product.user_id).single(),
    user
      ? supabase.from('profiles').select('nickname').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  const nickname   = myProfile?.nickname ?? null
  const isOwner    = user?.id === product.user_id
  const statusInfo = STATUS_LABELS[product.status] ?? STATUS_LABELS.selling
  const condInfo   = CONDITION_LABELS[product.condition]

  return (
    <div className="min-h-screen flex flex-col bg-violet-50 pb-28">
      <Header user={user} nickname={nickname} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">

        {/* 뒤로 가기 */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/market"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-violet-100 text-violet-600 hover:bg-violet-50 transition-colors shadow-sm text-lg"
          >
            ←
          </Link>
          <h1 className="text-lg font-black text-violet-800">상품 상세</h1>
          {/* 판매 상태 뱃지 */}
          <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* 이미지 영역 */}
        <div className="relative bg-white rounded-3xl border border-violet-100 h-72 flex flex-col items-center justify-center shadow-sm mb-4 overflow-hidden">
          <span className="text-8xl">🍠</span>
          <p className="text-xs text-violet-300 mt-3">사진 준비 중</p>
          {product.status !== 'selling' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-3xl">
              <span className={`text-2xl font-black px-6 py-2 rounded-2xl ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* 판매자 정보 */}
        <div className="bg-white rounded-2xl border border-violet-100 p-4 mb-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center font-black text-violet-600 text-lg shrink-0">
            {seller?.nickname?.slice(0, 1) ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800">{seller?.nickname ?? '알 수 없음'}</p>
            <p className="text-xs text-gray-400">
              가입일 {seller?.created_at
                ? new Date(seller.created_at).toLocaleDateString('ko-KR')
                : '-'}
            </p>
          </div>
          {isOwner && (
            <span className="ml-auto shrink-0 text-xs px-2.5 py-1 bg-violet-100 text-violet-600 font-bold rounded-lg">
              내 상품
            </span>
          )}
        </div>

        {/* 상품 핵심 정보 */}
        <div className="bg-white rounded-2xl border border-violet-100 p-5 mb-4 shadow-sm">
          {/* 카테고리 + 상태 태그 */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 text-violet-600 font-medium">
              {product.category}
            </span>
            {condInfo && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${condInfo.color}`}>
                {condInfo.label}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h2 className="text-2xl font-black text-gray-900 leading-snug mb-3">
            {product.title}
          </h2>

          {/* 가격 */}
          <p className="text-3xl font-black text-violet-700 mb-5">
            {product.price === 0
              ? <span className="text-violet-500">무료나눔 🎁</span>
              : `${product.price.toLocaleString('ko-KR')}원`}
          </p>

          <hr className="border-violet-50 mb-5" />

          {/* 설명 */}
          <p className="text-gray-700 text-sm leading-7 whitespace-pre-wrap break-words">
            {product.description}
          </p>
        </div>

        {/* 부가 정보 */}
        <div className="bg-white rounded-2xl border border-violet-100 px-5 py-4 shadow-sm space-y-2.5">
          {product.location && (
            <div className="flex items-center gap-2.5 text-sm text-gray-500">
              <span className="text-base">📍</span>
              <span>{product.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm text-gray-400">
            <span className="text-base">🕐</span>
            <span>{timeAgo(product.created_at)}</span>
            <span className="text-gray-200">·</span>
            <span>조회 {product.views}</span>
          </div>
        </div>

      </main>

      {/* 하단 고정 CTA 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-violet-100 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">

          {isOwner ? (
            /* 내 상품: 수정 + 상태 변경 */
            <>
              <div className="flex-1">
                <p className="text-xs text-gray-400">내가 등록한 상품</p>
                <p className="font-black text-gray-900 text-lg leading-tight">
                  {product.price === 0 ? '무료나눔' : `${product.price.toLocaleString('ko-KR')}원`}
                </p>
              </div>
              <Link
                href={`/sell/edit/${product.id}`}
                className="px-5 py-3 bg-violet-100 text-violet-700 font-bold text-sm rounded-xl hover:bg-violet-200 transition-all"
              >
                수정하기
              </Link>
              <button className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-violet-200">
                상태 변경
              </button>
            </>
          ) : (
            /* 타인 상품: 채팅하기 */
            <>
              <div className="flex-1">
                <p className="font-black text-gray-900 text-xl leading-tight">
                  {product.price === 0 ? '무료나눔 🎁' : `${product.price.toLocaleString('ko-KR')}원`}
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-violet-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                💬 채팅하기
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
