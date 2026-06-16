import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 공개 프로필 + 이 사람의 모든 판매글 병렬 조회
  const [{ data: profileRows }, { data: products }] = await Promise.all([
    supabase.rpc('get_public_profile', { p_user_id: id }),
    supabase
      .from('products')
      .select('id, title, price, category, condition, location, created_at, status, views, user_id, image_urls')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileRows?.[0]
  if (!profile) notFound()

  const isMe        = user?.id === id
  const productList = products ?? []
  const productIds  = productList.map((p) => p.id)

  // 내 닉네임(헤더) + 글들의 좋아요/댓글 수
  const [{ data: myProfile }, { data: likeRows }, { data: commentRows }] = await Promise.all([
    user
      ? supabase.from('profiles').select('nickname').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
    productIds.length
      ? supabase.from('product_likes').select('product_id').in('product_id', productIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase.from('product_comments').select('product_id').in('product_id', productIds)
      : Promise.resolve({ data: [] }),
  ])

  const likeCountMap: Record<string, number> = {}
  for (const r of likeRows ?? []) likeCountMap[r.product_id] = (likeCountMap[r.product_id] ?? 0) + 1
  const commentCountMap: Record<string, number> = {}
  for (const r of commentRows ?? []) commentCountMap[r.product_id] = (commentCountMap[r.product_id] ?? 0) + 1

  const sellingCount = productList.filter((p) => p.status === 'selling').length

  return (
    <div className="min-h-screen flex flex-col bg-violet-50">
      <Header user={user} nickname={myProfile?.nickname} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* 뒤로 가기 */}
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/market"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-violet-100 text-violet-600 hover:bg-violet-50 transition-colors shadow-sm text-lg"
          >
            ←
          </Link>
          <h1 className="text-lg font-black text-violet-800">프로필</h1>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-violet-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-20 h-20 rounded-full bg-violet-100 border-2 border-violet-100 overflow-hidden flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.nickname} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-violet-500">
                  {profile.nickname?.slice(0, 1) ?? '🍠'}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-gray-900 truncate">{profile.nickname}</h2>
              <p className="text-xs text-gray-400 mt-1">
                가입일 {profile.created_at ? new Date(profile.created_at).toLocaleDateString('ko-KR') : '-'}
              </p>
              <p className="text-xs text-violet-500 font-medium mt-1">
                판매글 {productList.length}개 · 판매중 {sellingCount}개
              </p>
            </div>

            {isMe && (
              <Link
                href="/profile/edit"
                className="shrink-0 self-start px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-lg transition-all"
              >
                편집
              </Link>
            )}
          </div>

          {/* 자기소개 */}
          {profile.bio ? (
            <p className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words bg-violet-50/50 rounded-xl px-4 py-3">
              {profile.bio}
            </p>
          ) : isMe ? (
            <Link
              href="/profile/edit"
              className="mt-4 block text-sm text-gray-400 text-center bg-violet-50/50 rounded-xl px-4 py-3 hover:text-violet-500 transition-colors"
            >
              + 자기소개를 작성해보세요
            </Link>
          ) : null}
        </div>

        {/* 글 모음 */}
        <section>
          <h3 className="text-base font-black text-violet-800 mb-4">
            {isMe ? '내 판매글' : `${profile.nickname}님의 판매글`}
            <span className="ml-2 text-sm font-medium text-violet-400">{productList.length}개</span>
          </h3>

          {productList.length > 0 ? (
            <div className="flex flex-col gap-3">
              {productList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  nickname={profile.nickname ?? '고구마'}
                  likeCount={likeCountMap[product.id] ?? 0}
                  commentCount={commentCountMap[product.id] ?? 0}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-violet-100 p-10 text-center">
              <div className="text-4xl mb-3">🍠</div>
              <p className="text-sm text-gray-400">아직 올린 판매글이 없어요</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
