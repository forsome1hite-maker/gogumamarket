import Link from 'next/link'

const CONDITION_LABELS: Record<string, string> = {
  new:           '새상품',
  like_new:      '거의새것',
  used:          '사용감있음',
  heavily_used:  '많이사용함',
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)     return '방금 전'
  if (diff < 3600)   return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

interface Product {
  id:          string
  title:       string
  price:       number
  category:    string
  condition:   string
  location:    string | null
  created_at:  string
  status:      string
  views:       number
  user_id:     string
}

interface Props {
  product:  Product
  nickname: string
}

export default function ProductCard({ product, nickname }: Props) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-2xl border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all flex gap-4 p-4 group"
    >
      {/* 이미지 자리 */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-4xl shrink-0 group-hover:bg-violet-100 transition-colors">
        🍠
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-1.5">
            {product.title}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">
              {product.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-100">
              {CONDITION_LABELS[product.condition] ?? product.condition}
            </span>
          </div>
        </div>

        <div>
          <p className="font-black text-gray-900 text-base">
            {product.price === 0 ? (
              <span className="text-violet-600">무료나눔</span>
            ) : (
              `${product.price.toLocaleString('ko-KR')}원`
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{nickname}</span>
            {product.location && (
              <>
                <span>·</span>
                <span>{product.location}</span>
              </>
            )}
            <span>·</span>
            <span>{timeAgo(product.created_at)}</span>
            <span>·</span>
            <span>조회 {product.views}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
