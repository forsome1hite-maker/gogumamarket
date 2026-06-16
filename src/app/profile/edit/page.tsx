import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ProfileEditForm from '@/components/ProfileEditForm'

export const dynamic = 'force-dynamic'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, bio, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col bg-violet-50">
      <Header user={user} nickname={profile?.nickname} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href={`/users/${user.id}`}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-violet-100 text-violet-600 hover:bg-violet-50 transition-colors shadow-sm text-lg"
          >
            ←
          </Link>
          <h1 className="text-lg font-black text-violet-800">프로필 편집</h1>
        </div>

        <ProfileEditForm
          userId={user.id}
          nickname={profile?.nickname ?? ''}
          bio={profile?.bio ?? ''}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </main>
    </div>
  )
}
