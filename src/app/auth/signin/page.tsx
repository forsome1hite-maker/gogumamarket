'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GogumaCharacter from '@/components/GogumaCharacter'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요 🍠')
      setLoading(false)
      return
    }

    router.push('/market')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-violet-50">
      <div className="w-full max-w-sm">
        {/* 상단 로고/캐릭터 */}
        <div className="text-center mb-8">
          <Link href="/">
            <GogumaCharacter size={100} className="mx-auto mb-3" />
          </Link>
          <h1 className="text-2xl font-black text-violet-800">고구마마켓</h1>
          <p className="text-sm text-violet-400 mt-1">로그인하고 거래를 시작해요!</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-3xl shadow-lg shadow-violet-100 border border-violet-100 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">로그인</h2>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="goguma@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-violet-50/50 text-gray-800 placeholder-gray-400 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-violet-50/50 text-gray-800 placeholder-gray-400 text-sm transition"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-300 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-violet-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              아직 계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-violet-600 font-bold hover:text-violet-500">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-violet-300 mt-6">
          © 2025 고구마마켓 🍠
        </p>
      </div>
    </div>
  )
}
