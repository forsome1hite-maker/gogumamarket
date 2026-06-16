import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GogumaCharacter from '@/components/GogumaCharacter'
import GogumaField from '@/components/GogumaField'
import Header from '@/components/Header'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let nickname: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()
    nickname = profile?.nickname ?? null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} nickname={nickname} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* 히어로 섹션 */}
        <div className="text-center max-w-xl">
          <GogumaCharacter size={200} className="mx-auto mb-6 drop-shadow-xl" />

          <div className="relative inline-flex items-center justify-center mb-3">
            <h1 className="text-4xl sm:text-5xl font-black text-violet-800 tracking-tight">
              고구마마켓
            </h1>
            {/* 말풍선: 당근 아님! */}
            <div className="absolute -right-2 -top-10 sm:-right-4 sm:-top-12">
              <div className="relative bg-orange-400 text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-2xl shadow-md whitespace-nowrap rotate-6">
                당근 아님! 🥕❌
                {/* 말풍선 꼬리 */}
                <div className="absolute -bottom-2 left-4 w-0 h-0"
                  style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '8px solid #fb923c',
                  }}
                />
              </div>
            </div>
          </div>
          <p className="text-lg text-violet-500 font-medium mb-2">
            🍠 우리 동네 중고거래
          </p>
          <p className="text-gray-500 text-base mb-10">
            가깝고 따뜻한 이웃과 안전하게 중고 물건을 사고 팔아요
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/market"
                className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-violet-200 transition-all hover:scale-105"
              >
                거래하러 가기 →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-violet-200 transition-all hover:scale-105"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3.5 bg-white hover:bg-violet-50 text-violet-700 font-bold rounded-2xl text-lg border-2 border-violet-200 transition-all hover:scale-105"
              >
                로그인
              </Link>
            </div>
          )}
        </div>

        {/* 고구마 밭 씬 */}
        <div className="w-full max-w-3xl mt-10">
          <GogumaField />
        </div>

        {/* 특징 카드 */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl w-full">
          {[
            { icon: '🔒', title: '안전한 거래', desc: '검증된 이웃과 신뢰 있는 중고 거래' },
            { icon: '📍', title: '동네 직거래', desc: '내 근처 물건만 쏙쏙 모아봐요' },
            { icon: '💬', title: '편한 채팅', desc: '1:1 채팅으로 간편하게 흥정해요' },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 text-center border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-300 transition-all"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-bold text-violet-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-violet-300">
        © 2025 고구마마켓 🍠
      </footer>
    </div>
  )
}
