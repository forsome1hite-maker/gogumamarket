'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  nickname?: string | null
}

export default function Header({ user, nickname }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = nickname ?? user?.email?.split('@')[0] ?? '고구마'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="text-2xl">🍠</span>
          <span className="font-black text-xl text-violet-700 tracking-tight group-hover:text-violet-500 transition-colors">
            고구마마켓
          </span>
          {/* 말풍선 */}
          <div className="relative flex items-center ml-0.5 pointer-events-none select-none animate-[headerBubble_2.5s_ease-in-out_infinite]">
            {/* 꼬리 - 왼쪽을 향함 */}
            <span
              className="block w-0 h-0 shrink-0"
              style={{
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: '6px solid #fb923c',
              }}
            />
            <div className="-rotate-3 bg-orange-400 text-white text-[10px] font-black px-2 py-0.5 rounded-xl whitespace-nowrap shadow-md">
              당근 아님! 🥕❌
            </div>
          </div>
        </Link>

        <style>{`
          @keyframes headerBubble {
            0%, 100% { transform: translateY(0px);   }
            50%       { transform: translateY(-2px);  }
          }
        `}</style>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/market"
                className="px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
              >
                중고거래
              </Link>
              <span className="text-sm text-gray-400 hidden sm:block">
                {displayName}님
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-1.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
