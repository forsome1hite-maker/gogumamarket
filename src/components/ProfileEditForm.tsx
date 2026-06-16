'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId:    string
  nickname:  string
  bio:       string
  avatarUrl: string | null
}

const MAX_AVATAR_MB = 5

// 공개 URL에서 저장소 경로 추출 (.../avatars/<경로>?... → <경로>)
function storagePathFromUrl(url: string): string | null {
  const marker = '/avatars/'
  const i = url.indexOf(marker)
  if (i === -1) return null
  return url.slice(i + marker.length).split('?')[0]
}

export default function ProfileEditForm({ userId, nickname: initNick, bio: initBio, avatarUrl: initAvatar }: Props) {
  const router   = useRouter()
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [nickname, setNickname]     = useState(initNick)
  const [bio,      setBio]          = useState(initBio)
  const [file,     setFile]         = useState<File | null>(null)
  const [preview,  setPreview]      = useState<string | null>(null)
  const [removed,  setRemoved]      = useState(false)
  const [loading,  setLoading]      = useState(false)
  const [error,    setError]        = useState('')

  // 화면에 보여줄 현재 아바타: 새 미리보기 > 삭제됨(없음) > 기존
  const shownAvatar = preview ?? (removed ? null : initAvatar)

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > MAX_AVATAR_MB * 1024 * 1024) {
      setError(`사진은 최대 ${MAX_AVATAR_MB}MB까지 올릴 수 있어요.`)
      return
    }
    setError('')
    setFile(f)
    setRemoved(false)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target!.result as string)
    reader.readAsDataURL(f)
  }

  const handleRemovePhoto = () => {
    setFile(null)
    setPreview(null)
    setRemoved(true)
  }

  const handleSave = async () => {
    if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    setLoading(true)
    setError('')

    try {
      let newAvatarUrl: string | null = initAvatar

      // 1) 사진 삭제 요청 처리
      if (removed && initAvatar) {
        const p = storagePathFromUrl(initAvatar)
        if (p) await supabase.storage.from('avatars').remove([p])
        newAvatarUrl = null
      }

      // 2) 새 사진 업로드 (기존 사진은 제거)
      if (file) {
        if (initAvatar) {
          const p = storagePathFromUrl(initAvatar)
          if (p) await supabase.storage.from('avatars').remove([p])
        }
        const ext  = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, file)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        newAvatarUrl = publicUrl
      }

      // 3) 프로필 저장
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({
          nickname:   nickname.trim(),
          bio:        bio.trim() || null,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
      if (dbErr) throw dbErr

      router.push(`/users/${userId}`)
      router.refresh()
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 프로필 사진 */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-4">프로필 사진</label>
        <div className="flex items-center gap-5">
          {/* 미리보기 */}
          <div className="w-24 h-24 rounded-full bg-violet-100 border-2 border-violet-100 overflow-hidden flex items-center justify-center shrink-0">
            {shownAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownAvatar} alt="프로필 사진" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-violet-500">
                {nickname.trim().slice(0, 1) || '🍠'}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2 text-sm font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 rounded-xl transition-all"
            >
              사진 {shownAvatar ? '변경' : '올리기'}
            </button>
            {shownAvatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                사진 삭제
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handlePick}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-3">JPG, PNG, WEBP, GIF (최대 {MAX_AVATAR_MB}MB)</p>
      </section>

      {/* 닉네임 */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          닉네임 <span className="text-violet-500">*</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          placeholder="닉네임을 입력하세요"
          className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm"
        />
        <p className="text-right text-xs text-gray-400 mt-1">{nickname.length}/20</p>
      </section>

      {/* 자기소개 */}
      <section className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          자기소개 <span className="text-gray-400 font-normal text-xs ml-1">(선택)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="이웃에게 나를 소개해보세요 🍠&#10;ex) 안녕하세요! 안 쓰는 물건 정리 중입니다. 친절 거래해요~"
          className="w-full resize-none px-4 py-3 rounded-xl border border-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-violet-50/40 text-gray-800 placeholder-gray-400 text-sm leading-relaxed"
        />
        <p className="text-right text-xs text-gray-400 mt-1">{bio.length}/500</p>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <Link
          href={`/users/${userId}`}
          className="flex-1 py-3.5 text-center text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
        >
          취소
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !nickname.trim()}
          className="flex-1 py-3.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:bg-violet-300 rounded-2xl shadow-lg shadow-violet-200 transition-all"
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
