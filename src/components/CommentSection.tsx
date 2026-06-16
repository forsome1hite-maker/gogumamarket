'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export interface CommentRow {
  id:         string
  user_id:    string
  parent_id:  string | null
  content:    string
  created_at: string
  updated_at: string
  nickname:   string | null
}

interface Props {
  productId: string
  userId:    string | null
  comments:  CommentRow[]
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)     return '방금 전'
  if (diff < 3600)   return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function CommentSection({ productId, userId, comments }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  // 새 댓글 작성
  const [newText, setNewText] = useState('')
  const [posting, setPosting] = useState(false)

  // 답글 작성 (어느 댓글에 다는지 + 내용)
  const [replyingTo,   setReplyingTo]   = useState<string | null>(null)
  const [replyText,    setReplyText]    = useState('')
  const [postingReply, setPostingReply] = useState(false)

  // 수정 중인 댓글
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editText,   setEditText]   = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // 삭제 확인 중인 댓글
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 부모 댓글(일반 댓글) / 답글 분리
  const topComments = comments.filter((c) => !c.parent_id)
  const repliesOf = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId)

  // ---------- 댓글 작성 (Create) ----------
  const handleCreate = async () => {
    const text = newText.trim()
    if (!text || !userId) return
    setPosting(true)
    const { error } = await supabase
      .from('product_comments')
      .insert({ product_id: productId, user_id: userId, content: text })
    setPosting(false)
    if (error) {
      alert('댓글 등록에 실패했어요. 다시 시도해주세요.')
      return
    }
    setNewText('')
    router.refresh()
  }

  // ---------- 답글 작성 (Create + parent_id) ----------
  const handleCreateReply = async (parentId: string) => {
    const text = replyText.trim()
    if (!text || !userId) return
    setPostingReply(true)
    const { error } = await supabase
      .from('product_comments')
      .insert({ product_id: productId, user_id: userId, content: text, parent_id: parentId })
    setPostingReply(false)
    if (error) {
      alert('답글 등록에 실패했어요. 다시 시도해주세요.')
      return
    }
    setReplyText('')
    setReplyingTo(null)
    router.refresh()
  }

  // ---------- 수정 (Update) ----------
  const startEdit = (c: CommentRow) => {
    setEditingId(c.id)
    setEditText(c.content)
  }

  const handleUpdate = async (id: string) => {
    const text = editText.trim()
    if (!text) return
    setSavingEdit(true)
    const { error } = await supabase
      .from('product_comments')
      .update({ content: text, updated_at: new Date().toISOString() })
      .eq('id', id)
    setSavingEdit(false)
    if (error) {
      alert('댓글 수정에 실패했어요. 다시 시도해주세요.')
      return
    }
    setEditingId(null)
    setEditText('')
    router.refresh()
  }

  // ---------- 삭제 (Delete) ----------
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('product_comments')
      .delete()
      .eq('id', id)
    if (error) {
      alert('댓글 삭제에 실패했어요. 다시 시도해주세요.')
      return
    }
    setDeletingId(null)
    router.refresh()
  }

  // ---------- 댓글 1개 렌더링 (일반 댓글 + 답글 공용) ----------
  const renderComment = (c: CommentRow, isReply: boolean) => {
    const mine       = c.user_id === userId
    const isEditing  = editingId === c.id
    const isDeleting = deletingId === c.id
    const edited     = c.updated_at !== c.created_at

    return (
      <div className="flex gap-3">
        {/* 프로필 동그라미 (답글은 조금 작게) */}
        <div
          className={`rounded-full bg-violet-100 flex items-center justify-center font-black text-violet-600 shrink-0 ${
            isReply ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
          }`}
        >
          {c.nickname?.slice(0, 1) ?? '?'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-gray-800">
              {c.nickname ?? '알 수 없음'}
            </span>
            <span className="text-xs text-gray-300">
              {timeAgo(c.created_at)}{edited && ' (수정됨)'}
            </span>
          </div>

          {isEditing ? (
            /* 수정 모드 */
            <div className="mt-1.5">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <div className="flex gap-2 justify-end mt-1.5">
                <button
                  onClick={() => setEditingId(null)}
                  disabled={savingEdit}
                  className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => handleUpdate(c.id)}
                  disabled={savingEdit || !editText.trim()}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-all disabled:opacity-50"
                >
                  {savingEdit ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            /* 일반 표시 */
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words mt-0.5">
              {c.content}
            </p>
          )}

          {/* 액션 버튼 줄: 답글(일반 댓글만) + 내 댓글이면 수정/삭제 */}
          {!isEditing && (
            <div className="flex gap-3 mt-1.5 items-center">
              {/* 답글 버튼: 일반 댓글에만, 로그인 상태에서 */}
              {!isReply && userId && (
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === c.id ? null : c.id)
                    setReplyText('')
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-violet-600 transition-colors"
                >
                  답글
                </button>
              )}

              {mine && (
                isDeleting ? (
                  <>
                    <span className="text-xs text-gray-400">삭제할까요?</span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(c)}
                      className="text-xs font-bold text-gray-400 hover:text-violet-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
      <h3 className="font-black text-gray-800 mb-4 flex items-center gap-1.5">
        💬 댓글
        <span className="text-violet-500">{comments.length}</span>
      </h3>

      {/* 댓글 작성 폼 */}
      {userId ? (
        <div className="mb-5">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="따뜻한 댓글을 남겨주세요 🍠"
            rows={2}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-violet-100 bg-violet-50/40 px-3.5 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleCreate}
              disabled={posting || !newText.trim()}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {posting ? '등록 중...' : '댓글 등록'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-5 text-sm text-gray-400 text-center bg-violet-50/50 rounded-xl py-3">
          댓글을 남기려면 로그인이 필요해요.
        </p>
      )}

      {/* 댓글 목록 */}
      {topComments.length === 0 ? (
        <p className="text-sm text-gray-300 text-center py-6">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요!
        </p>
      ) : (
        <ul className="space-y-5">
          {topComments.map((c) => {
            const replies = repliesOf(c.id)
            return (
              <li key={c.id}>
                {/* 일반 댓글 */}
                {renderComment(c, false)}

                {/* 답글 작성 폼 */}
                {replyingTo === c.id && userId && (
                  <div className="mt-2 ml-12">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답글을 입력해주세요"
                      rows={2}
                      maxLength={1000}
                      className="w-full resize-none rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <div className="flex gap-2 justify-end mt-1.5">
                      <button
                        onClick={() => setReplyingTo(null)}
                        disabled={postingReply}
                        className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleCreateReply(c.id)}
                        disabled={postingReply || !replyText.trim()}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-all disabled:opacity-50"
                      >
                        {postingReply ? '등록 중...' : '답글 등록'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 답글 목록 (들여쓰기 + 왼쪽 선) */}
                {replies.length > 0 && (
                  <ul className="mt-3 ml-5 pl-4 border-l-2 border-violet-50 space-y-4">
                    {replies.map((r) => (
                      <li key={r.id}>{renderComment(r, true)}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
