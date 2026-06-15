import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'

export default async function MarketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  // 프로필 + 상품 목록 + 판매자 닉네임 병렬 조회
  const [{ data: profile }, { data: products }] = await Promise.all([
    supabase
      .from('profiles')
      .select('nickname, email, avatar_url, created_at')
      .eq('id', user.id)
      .single(),
    supabase
      .from('products')
      .select('id, title, price, category, condition, location, created_at, status, views, user_id')
      .eq('status', 'selling')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const nickname = profile?.nickname ?? user.email?.split('@')[0] ?? '고구마'

  // 판매자 닉네임 조회
  const userIds = [...new Set((products ?? []).map(p => p.user_id))]
  const { data: sellers } = userIds.length
    ? await supabase.from('profiles').select('id, nickname').in('id', userIds)
    : { data: [] }

  const sellerMap = Object.fromEntries((sellers ?? []).map(s => [s.id, s.nickname]))

  return (
    <div className="min-h-screen flex flex-col bg-violet-50">
      <Header user={user} nickname={nickname} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* 환영 배너 */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-400 rounded-3xl p-6 mb-6 text-white shadow-lg shadow-violet-200">
          <p className="text-violet-200 text-sm mb-1">안녕하세요 👋</p>
          <h2 className="text-2xl font-black mb-3">{nickname}님!</h2>
          <Link
            href="/sell/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-sm rounded-xl border border-white/30 transition-all hover:scale-[1.02]"
          >
            🍠 판매글 올리기
          </Link>
        </div>

        {/* 프로필 요약 */}
        <div className="bg-white rounded-2xl border border-violet-100 p-5 mb-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-black text-violet-600 shrink-0">
            {nickname.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800">{nickname}</p>
            <p className="text-sm text-gray-400 truncate">{profile?.email ?? user.email}</p>
            <p className="text-xs text-violet-400 mt-0.5">
              가입일 {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                : '-'}
            </p>
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Link
            href="/sell/new"
            className="bg-violet-600 rounded-2xl p-5 text-center hover:bg-violet-500 transition-all hover:shadow-md"
          >
            <div className="text-3xl mb-2">🍠</div>
            <div className="font-bold text-white text-sm">판매하기</div>
            <div className="text-xs text-violet-200 mt-0.5">내 물건 올리기</div>
          </Link>
          {[
            { icon: '❤️', label: '관심목록', desc: '찜한 상품' },
            { icon: '💬', label: '채팅',     desc: '거래 채팅' },
            { icon: '📦', label: '내 상품',  desc: '판매 관리' },
          ].map(({ icon, label, desc }) => (
            <button key={label} className="bg-white rounded-2xl p-5 text-center border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-bold text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        {/* 상품 목록 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-violet-800">
              최근 올라온 물건 🍠
              {products && products.length > 0 && (
                <span className="ml-2 text-sm font-medium text-violet-400">
                  {products.length}개
                </span>
              )}
            </h2>
          </div>

          {products && products.length > 0 ? (
            <div className="flex flex-col gap-3">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  nickname={sellerMap[product.user_id] ?? '고구마'}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-violet-100 p-10 text-center">
              <div className="text-5xl mb-4">🍠</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">아직 등록된 상품이 없어요</h3>
              <p className="text-sm text-gray-400 mb-5">첫 번째 판매글을 올려보세요!</p>
              <Link
                href="/sell/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-violet-200"
              >
                🍠 판매글 작성하기
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
