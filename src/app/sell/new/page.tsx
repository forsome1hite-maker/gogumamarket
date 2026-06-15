import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import SellForm from '@/components/SellForm'

export default async function SellNewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin?next=/sell/new')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single()

  const nickname = profile?.nickname ?? null

  return (
    <div className="min-h-screen flex flex-col bg-violet-50">
      <Header user={user} nickname={nickname} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* 페이지 제목 */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/market"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-violet-100 text-violet-600 hover:bg-violet-50 transition-colors shadow-sm"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-black text-violet-800">판매글 작성</h1>
            <p className="text-xs text-gray-400 mt-0.5">고구마마켓에 내 물건을 올려봐요 🍠</p>
          </div>
        </div>

        <SellForm userId={user.id} />
      </main>
    </div>
  )
}
