'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
}

export default function Header({ user }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🍠</span>
          <span className="font-black text-xl text-violet-700 tracking-tight group-hover:text-violet-500 transition-colors">
            고구마마켓
          </span>
        </Link>

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
                {user.email?.split('@')[0]}님
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
