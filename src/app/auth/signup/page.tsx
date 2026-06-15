'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GogumaCharacter from '@/components/GogumaCharacter'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요 🍠')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요')
      return
    }
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일이에요. 로그인해주세요!')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-violet-50">
        <div className="w-full max-w-sm text-center">
          <GogumaCharacter size={120} className="mx-auto mb-6" />
          <div className="bg-white rounded-3xl shadow-lg border border-violet-100 p-8">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-black text-violet-800 mb-2">이메일을 확인해주세요!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              <strong className="text-violet-600">{email}</strong>로<br />
              인증 링크를 보내드렸어요.<br />
              메일함을 확인하고 인증을 완료해주세요 🍠
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              로그인하러 가기
            </Link>
          </div>
        </div>
      </div>
    )
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
          <p className="text-sm text-violet-400 mt-1">함께해요, 고구마 이웃!</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-3xl shadow-lg shadow-violet-100 border border-violet-100 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">회원가입</h2>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="고구마 판매왕"
                required
                maxLength={12}
                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-violet-50/50 text-gray-800 placeholder-gray-400 text-sm transition"
              />
            </div>

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
                placeholder="6자 이상 입력하세요"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-violet-50/50 text-gray-800 placeholder-gray-400 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
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
              {loading ? '가입 중...' : '가입하기 🍠'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/signin" className="text-violet-600 font-bold hover:text-violet-500">
                로그인
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
