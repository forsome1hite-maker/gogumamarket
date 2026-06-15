import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'

export default async function MarketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const nickname = user.user_metadata?.nickname ?? user.email?.split('@')[0] ?? '고구마'

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* 환영 배너 */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-400 rounded-3xl p-6 mb-8 text-white shadow-lg shadow-violet-200">
          <p className="text-violet-200 text-sm mb-1">안녕하세요 👋</p>
          <h2 className="text-2xl font-black mb-1">{nickname}님!</h2>
          <p className="text-violet-100 text-sm">오늘도 좋은 거래 하세요 🍠</p>
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🛍️', label: '중고거래', desc: '물건 사고팔기' },
            { icon: '❤️', label: '관심목록', desc: '찜한 상품' },
            { icon: '💬', label: '채팅', desc: '거래 채팅' },
            { icon: '📦', label: '내 상품', desc: '판매 관리' },
          ].map(({ icon, label, desc }) => (
            <button
              key={label}
              className="bg-white rounded-2xl p-5 text-center border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-bold text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* 상품 목록 (준비중) */}
        <div className="bg-white rounded-3xl border border-violet-100 p-8 text-center">
          <div className="text-5xl mb-4">🍠</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">상품 등록 기능 준비 중!</h3>
          <p className="text-sm text-gray-400">곧 다양한 중고 상품을 만날 수 있어요.</p>
        </div>
      </main>
    </div>
  )
}
