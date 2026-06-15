import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import EditForm from '@/components/EditForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const [{ data: product }, { data: profile }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('profiles').select('nickname').eq('id', user.id).single(),
  ])

  if (!product) notFound()

  // 본인 상품이 아니면 상세 페이지로 돌려보냄
  if (product.user_id !== user.id) redirect(`/products/${id}`)

  const nickname = profile?.nickname ?? null

  return (
    <div className="min-h-screen flex flex-col bg-violet-50 pb-10">
      <Header user={user} nickname={nickname} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/products/${id}`}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-violet-100 text-violet-600 hover:bg-violet-50 transition-colors shadow-sm text-lg"
          >
            ←
          </Link>
          <h1 className="text-xl font-black text-violet-800">판매글 수정</h1>
          <span className="ml-auto text-2xl">✏️</span>
        </div>

        <EditForm product={product} />
      </main>
    </div>
  )
}
