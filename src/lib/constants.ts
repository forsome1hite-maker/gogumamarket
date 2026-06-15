export const CATEGORIES = [
  { value: '디지털기기',    emoji: '📱' },
  { value: '생활가전',      emoji: '🔌' },
  { value: '가구/인테리어', emoji: '🪑' },
  { value: '생활/주방',     emoji: '🍳' },
  { value: '의류/잡화',     emoji: '👗' },
  { value: '도서/티켓/음반',emoji: '📚' },
  { value: '스포츠/레저',   emoji: '⚽' },
  { value: '취미/게임',     emoji: '🎮' },
  { value: '반려동물용품',  emoji: '🐾' },
  { value: '식물',          emoji: '🌿' },
  { value: '기타',          emoji: '📦' },
]

export const CONDITIONS = [
  { value: 'new',           label: '새상품 (미사용)',  desc: '사용한 적 없어요' },
  { value: 'like_new',      label: '거의 새것',        desc: '사용감이 거의 없어요' },
  { value: 'used',          label: '사용감 있음',      desc: '사용했지만 상태 양호' },
  { value: 'heavily_used',  label: '많이 사용함',      desc: '사용감이 많이 있어요' },
]

export const STATUS_OPTIONS = [
  { value: 'selling',  label: '판매중',   emoji: '🟢', desc: '아직 판매 중이에요' },
  { value: 'reserved', label: '거래중',   emoji: '🟡', desc: '거래 진행 중이에요 (예약)' },
  { value: 'sold',     label: '판매완료', emoji: '⚫', desc: '거래가 완료됐어요' },
]
