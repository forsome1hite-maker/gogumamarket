'use client'

import { useEffect, useRef, useState } from 'react'

// ── 설정 ───────────────────────────────────────────────
const SPOTS = [
  { id: 0, x: 10 },
  { id: 1, x: 25 },
  { id: 2, x: 43 },
  { id: 3, x: 61 },
  { id: 4, x: 78 },
]
const WALK_SPEED = 0.055   // %/frame (≈60fps → ~18초에 한 바퀴)
const DIG_RANGE  = 3.2

// ── 땅속 미니 고구마 SVG ──────────────────────────────
function MiniGoguma() {
  return (
    <svg width="38" height="50" viewBox="0 0 95 125" fill="none">
      {/* 줄기 잎 */}
      <path d="M44 18 Q37 4 27 8 Q33 16 44 22" fill="#15803d" />
      <path d="M47 18 Q56 3 65 8 Q58 15 47 22" fill="#16a34a" />
      {/* 몸통 외곽 */}
      <ellipse cx="45" cy="76" rx="34" ry="42" fill="#4C1D95" />
      {/* 몸통 */}
      <ellipse cx="45" cy="73" rx="27" ry="34" fill="#7C3AED" />
      {/* 하이라이트 */}
      <ellipse cx="35" cy="54" rx="11" ry="8" fill="rgba(255,255,255,0.18)" />
      {/* 쪼개진 윗부분(속살) */}
      <ellipse cx="45" cy="47" rx="19" ry="10" fill="#FDE68A" />
      <ellipse cx="43" cy="44" rx="11" ry="6"  fill="#FFFBEB" opacity="0.55" />
      {/* 눈 흰자 */}
      <circle cx="33" cy="65" r="9" fill="white" />
      <circle cx="57" cy="65" r="9" fill="white" />
      {/* 눈동자 */}
      <circle cx="34" cy="66" r="5.5" fill="#1E1B4B" />
      <circle cx="58" cy="66" r="5.5" fill="#1E1B4B" />
      {/* 눈 반짝 */}
      <circle cx="36" cy="63" r="2.5" fill="white" />
      <circle cx="60" cy="63" r="2.5" fill="white" />
      {/* 볼터치 */}
      <ellipse cx="20" cy="75" rx="9" ry="5.5" fill="#FDA4AF" opacity="0.65" />
      <ellipse cx="70" cy="75" rx="9" ry="5.5" fill="#FDA4AF" opacity="0.65" />
      {/* 입 */}
      <path d="M30 84 Q45 96 60 84" stroke="#1E1B4B" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* 팔 */}
      <ellipse cx="12"  cy="74" rx="13" ry="7" fill="#5B21B6" transform="rotate(-20 12 74)" />
      <ellipse cx="78" cy="74" rx="13" ry="7" fill="#5B21B6" transform="rotate(20 78 74)" />
    </svg>
  )
}

// ── 땅속 미니 당근 SVG (가끔 등장하는 라이벌!) ─────────
function MiniCarrot() {
  return (
    <svg width="32" height="50" viewBox="0 0 70 110" fill="none">
      {/* 잎 */}
      <path d="M35 32 Q29 8 18 6 Q25 20 32 32" fill="#16a34a" />
      <path d="M35 30 Q35 5 35 3 Q43 16 39 30" fill="#15803d" />
      <path d="M35 32 Q41 8 52 6 Q45 20 38 32" fill="#22c55e" />
      {/* 몸통 */}
      <path d="M21 35 Q35 30 49 35 L38 100 Q35 107 32 100 Z" fill="#fb923c" />
      <path d="M24 37 Q35 33 46 37 L39 78 Q35 82 31 78 Z" fill="#fdba74" opacity="0.5" />
      {/* 결무늬 */}
      <path d="M28 48 L43 52" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M27 62 L41 65" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <path d="M30 76 L39 78" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* 짓궂은 얼굴 */}
      <circle cx="30" cy="47" r="3.2" fill="#7c2d12" />
      <circle cx="41" cy="47" r="3.2" fill="#7c2d12" />
      <path d="M30 56 Q35 60 41 56" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ── 땅속에서 솟는 아이템 (고구마 또는 당근) ───────────
function BuriedItem({ visible, fresh, isCarrot }: { visible: boolean; fresh: boolean; isCarrot: boolean }) {
  return (
    <div className="relative flex flex-col items-center" style={{ height: 56 }}>
      {/* 반짝 효과 */}
      {fresh && (
        <>
          <span className="absolute text-yellow-300 text-lg font-bold pointer-events-none"
            style={{ top: -28, left: -10, animation: 'sparkle-fly 0.7s ease-out forwards' }}>✦</span>
          <span className="absolute text-violet-400 text-sm pointer-events-none"
            style={{ top: -22, right: -4, animation: 'sparkle-fly 0.7s ease-out 0.08s forwards' }}>★</span>
          <span className="absolute text-amber-300 text-xs pointer-events-none"
            style={{ top: -30, left: 8, animation: 'sparkle-fly 0.7s ease-out 0.18s forwards' }}>✦</span>
          <span className="absolute text-pink-400 text-xs pointer-events-none"
            style={{ top: -18, left: -14, animation: 'sparkle-fly 0.7s ease-out 0.12s forwards' }}>✸</span>
        </>
      )}

      {/* 솟아오르는 아이템 */}
      <div style={{
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(110%) scale(0.5)',
        opacity:   visible ? 1 : 0,
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
        transformOrigin: 'bottom center',
      }}>
        {isCarrot ? <MiniCarrot /> : <MiniGoguma />}
      </div>
    </div>
  )
}

// ── 흙 튀기는 파티클 ──────────────────────────────────
function DirtParticles() {
  const particles = [
    { tx: -22, ty: -28, delay: 0,   size: 8  },
    { tx:  18, ty: -34, delay: 40,  size: 6  },
    { tx: -14, ty: -40, delay: 80,  size: 5  },
    { tx:  28, ty: -22, delay: 20,  size: 7  },
    { tx:  -6, ty: -44, delay: 100, size: 5  },
    { tx:  12, ty: -38, delay: 60,  size: 4  },
    { tx: -30, ty: -18, delay: 30,  size: 6  },
    { tx:  22, ty: -42, delay: 90,  size: 4  },
  ]
  return (
    <div className="absolute pointer-events-none" style={{ bottom: 8, left: '50%' }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  p.size,
            height: p.size,
            background: i % 2 === 0 ? '#92400e' : '#a16207',
            left: -p.size / 2,
            top:  -p.size / 2,
            animation: `dirt-fly 0.55s ease-out ${p.delay}ms forwards`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ── 걷는 고구마 본체 ──────────────────────────────────
function WalkerGoguma({ digging, surprised }: { digging: boolean; surprised: boolean }) {
  return (
    <svg width="74" height="92" viewBox="0 0 158 200" fill="none">
      <defs>
        <radialGradient id="wFlesh" cx="40%" cy="38%" r="62%">
          <stop offset="0%"   stopColor="#FFFBEB" />
          <stop offset="50%"  stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
        <style>{`
          @keyframes wb  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-6px)} }
          @keyframes la  { 0%,100%{transform:rotate(28deg)}   50%{transform:rotate(-22deg)}  }
          @keyframes ra  { 0%,100%{transform:rotate(-18deg)}  50%{transform:rotate(26deg)}   }
          @keyframes rd  { 0%,50%{transform:rotate(-8deg)}    50%{transform:rotate(-52deg) translateY(-4px)} }
          @keyframes ll  { 0%,100%{transform:translateY(0)  scaleX(1)}    50%{transform:translateY(-8px) scaleX(0.88)} }
          @keyframes rl  { 0%,100%{transform:translateY(-8px) scaleX(0.88)} 50%{transform:translateY(0)  scaleX(1)}    }
          @keyframes blink2 { 0%,88%,100%{transform:scaleY(1)} 94%{transform:scaleY(0.08)} }
          @keyframes sparkle-fly {
            0%   { opacity: 1; transform: translate(0,0) scale(1); }
            100% { opacity: 0; transform: translate(var(--spx,0px), var(--spy,-30px)) scale(0.3); }
          }
          @keyframes dirt-fly {
            0%   { opacity: 0.85; transform: translate(0,0) scale(1); }
            60%  { opacity: 0.6; }
            100% { opacity: 0;   transform: translate(var(--tx,0px), var(--ty,-30px)) scale(0.2); }
          }
        `}</style>
      </defs>

      {/* 그림자 */}
      <ellipse cx="79" cy="194" rx="38" ry="7" fill="rgba(109,40,217,0.18)"
        style={{ animation: 'wb 0.48s ease-in-out infinite' }} />

      {/* ── 몸통 ── */}
      <g style={{ animation: 'wb 0.48s ease-in-out infinite', transformOrigin: '79px 120px' }}>
        {/* 외곽 */}
        <ellipse cx="79" cy="122" rx="54" ry="66" fill="#4C1D95" />
        {/* 몸통 */}
        <ellipse cx="79" cy="118" rx="44" ry="55" fill="#7C3AED" />
        {/* 하이라이트 */}
        <ellipse cx="64" cy="88" rx="19" ry="12" fill="rgba(255,255,255,0.17)" />
        {/* 속살 윗부분 */}
        <ellipse cx="79" cy="70" rx="31" ry="15" fill="url(#wFlesh)" />
        <ellipse cx="76" cy="66" rx="17" ry="7"  fill="#FFFBEB" opacity="0.48" />

        {/* ── 눈 ── */}
        <g style={{ animation: 'blink2 4s ease-in-out infinite', transformOrigin: '59px 106px' }}>
          <ellipse cx="59" cy="106" rx="15" ry="16" fill="white" />
        </g>
        <g style={{ animation: 'blink2 4s ease-in-out infinite', transformOrigin: '99px 106px' }}>
          <ellipse cx="99" cy="106" rx="15" ry="16" fill="white" />
        </g>
        <ellipse cx="61"  cy="108" rx="9"  ry="10" fill="#1E1B4B" />
        <ellipse cx="101" cy="108" rx="9"  ry="10" fill="#1E1B4B" />
        <circle  cx="65"  cy="102" r="4.5" fill="white" />
        <circle  cx="105" cy="102" r="4.5" fill="white" />
        <circle  cx="58"  cy="111" r="2"   fill="rgba(255,255,255,0.55)" />
        <circle  cx="98"  cy="111" r="2"   fill="rgba(255,255,255,0.55)" />

        {/* 볼터치 */}
        <ellipse cx="41"  cy="120" rx="13" ry="8"  fill="#FDA4AF" opacity="0.6" />
        <ellipse cx="117" cy="120" rx="13" ry="8"  fill="#FDA4AF" opacity="0.6" />

        {/* 눈썹 - 놀랐을 때만 치켜올라감 */}
        {surprised && (
          <>
            <path d="M47 84 Q59 76 71 83" stroke="#1E1B4B" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M87 83 Q99 76 111 84" stroke="#1E1B4B" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* 입 - 놀라면 'O', 캐는 중엔 집중, 아닐 땐 활짝 */}
        {surprised
          ? <ellipse cx="79" cy="142" rx="8" ry="10" fill="#1E1B4B" />
          : digging
            ? <path d="M59 137 Q79 146 99 137" stroke="#1E1B4B" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            : <path d="M57 136 Q79 154 101 136" stroke="#1E1B4B" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        }

        {/* 몸통 결무늬 */}
        <path d="M56 162 Q79 168 102 162" stroke="rgba(255,255,255,0.12)" strokeWidth="2.2" fill="none" />
        <path d="M50 175 Q79 183 108 175" stroke="rgba(255,255,255,0.09)" strokeWidth="1.8" fill="none" />
      </g>

      {/* ── 왼팔 ── */}
      <g style={{ animation: 'la 0.48s ease-in-out infinite', transformOrigin: '22px 114px' }}>
        <ellipse cx="18" cy="114" rx="24" ry="11" fill="#5B21B6" transform="rotate(-20 18 114)" />
      </g>

      {/* ── 오른팔 + 삽 ── */}
      <g style={{
        animation: digging ? 'rd 0.48s ease-in-out infinite' : 'ra 0.48s ease-in-out infinite',
        transformOrigin: '138px 110px',
      }}>
        <ellipse cx="138" cy="110" rx="24" ry="11" fill="#5B21B6" transform="rotate(20 138 110)" />
        {/* 삽 자루 */}
        <rect x="145" y="88" width="7" height="42" rx="3.5" fill="#92400E" />
        {/* 삽날 */}
        <path d="M138 128 L154 128 L152 148 L140 148 Z" fill="#9CA3AF" />
        <ellipse cx="146" cy="147" rx="8" ry="4.5" fill="#6B7280" />
        {/* 삽날 반짝 */}
        <path d="M150 132 L146 137" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
        <path d="M153 138 L151 141" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* ── 다리 ── */}
      <g style={{ animation: 'll 0.42s ease-in-out infinite', transformOrigin: '62px 178px' }}>
        <ellipse cx="62" cy="178" rx="18" ry="10" fill="#4C1D95" />
        <ellipse cx="62" cy="184" rx="15" ry="6"  fill="#3B0764" />
      </g>
      <g style={{ animation: 'rl 0.42s ease-in-out infinite', transformOrigin: '96px 178px' }}>
        <ellipse cx="96" cy="178" rx="18" ry="10" fill="#4C1D95" />
        <ellipse cx="96" cy="184" rx="15" ry="6"  fill="#3B0764" />
      </g>
    </svg>
  )
}

// ── 떠다니는 구름 ─────────────────────────────────────
function Cloud({ style }: { style: React.CSSProperties }) {
  return (
    <svg width="90" height="40" viewBox="0 0 90 40" fill="none" style={style}>
      <ellipse cx="45" cy="28" rx="40" ry="18" fill="white" opacity="0.9" />
      <ellipse cx="30" cy="22" rx="22" ry="17" fill="white" opacity="0.9" />
      <ellipse cx="58" cy="20" rx="20" ry="16" fill="white" opacity="0.9" />
      <ellipse cx="45" cy="16" rx="16" ry="13" fill="white" opacity="0.9" />
    </svg>
  )
}

// ── 메인 씬 컴포넌트 ──────────────────────────────────
export default function GogumaField() {
  const charRef        = useRef<HTMLDivElement>(null)
  const posRef         = useRef(8)
  const dirRef         = useRef<1 | -1>(1)
  const rafRef         = useRef(0)
  const prevDigRef     = useRef(false)
  const dugCooldownRef = useRef<Set<number>>(new Set())

  const [dug,         setDug]         = useState<Set<number>>(new Set())
  const [fresh,       setFresh]       = useState<Set<number>>(new Set())
  const [carrots,     setCarrots]     = useState<Set<number>>(new Set())
  const [digging,     setDigging]     = useState(false)
  const [surprised,   setSurprised]   = useState(false)
  const [facingRight, setFacingRight] = useState(true)

  useEffect(() => {
    const frame = () => {
      posRef.current += WALK_SPEED * dirRef.current

      if (posRef.current >= 88) { dirRef.current = -1; setFacingRight(false) }
      if (posRef.current <=  5) { dirRef.current =  1; setFacingRight(true)  }

      // 캐릭터 위치를 DOM에 직접 적용 (리렌더링 없이)
      if (charRef.current) {
        const flip = dirRef.current === 1 ? 1 : -1
        charRef.current.style.left      = `${posRef.current}%`
        charRef.current.style.transform = `translateX(-50%) scaleX(${flip})`
      }

      // 고구마 구덩이 근접 체크
      let nowDigging = false
      for (const spot of SPOTS) {
        if (Math.abs(posRef.current - spot.x) < DIG_RANGE && !dugCooldownRef.current.has(spot.id)) {
          nowDigging = true
          dugCooldownRef.current.add(spot.id)

          // 가끔(약 30%) 당근이 나옴 → 고구마가 깜짝 놀람
          const isCarrot = Math.random() < 0.3

          setDug(prev   => new Set([...prev, spot.id]))
          setFresh(prev => new Set([...prev, spot.id]))

          if (isCarrot) {
            setCarrots(prev => new Set([...prev, spot.id]))
            setSurprised(true)
            setTimeout(() => setSurprised(false), 1300)
          }

          // 반짝 효과 제거
          setTimeout(() => {
            setFresh(prev => { const n = new Set(prev); n.delete(spot.id); return n })
          }, 750)
          // 아이템 다시 땅속으로
          setTimeout(() => {
            setDug(prev     => { const n = new Set(prev); n.delete(spot.id); return n })
            setCarrots(prev => { const n = new Set(prev); n.delete(spot.id); return n })
            // 쿨다운 해제 (한 바퀴 돌고 다시 캘 수 있게)
            setTimeout(() => dugCooldownRef.current.delete(spot.id), 3500)
          }, 3000)
          break
        }
      }

      if (nowDigging !== prevDigRef.current) {
        prevDigRef.current = nowDigging
        setDigging(nowDigging)
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl select-none"
      style={{ height: 240 }}
    >
      {/* 하늘 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-violet-50 to-violet-100" />

      {/* 구름들 */}
      <Cloud style={{ position:'absolute', top: 18, left: '8%',  animation: 'cloud-drift 22s linear infinite' }} />
      <Cloud style={{ position:'absolute', top: 30, left: '55%', animation: 'cloud-drift 30s linear infinite', opacity: 0.85, transform: 'scale(0.75)' }} />
      <Cloud style={{ position:'absolute', top: 10, left: '75%', animation: 'cloud-drift 26s linear infinite 8s', opacity: 0.7, transform: 'scale(0.6)' }} />

      {/* 풀밭 + 흙 */}
      <div className="absolute bottom-0 w-full" style={{ height: 90 }}>
        {/* 풀 웨이브 */}
        <svg
          className="absolute w-full"
          style={{ top: -18 }}
          height="24"
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
        >
          <path
            d="M0 16 Q12 2 24 14 Q36 2 48 14 Q60 4 72 14 Q84 0 96 14 Q108 3 120 14 Q132 1 144 14 Q156 3 168 14 Q180 0 192 14 Q204 4 216 14 Q228 1 240 16 Q252 2 264 14 Q276 4 288 14 Q300 0 312 14 Q324 3 336 14 Q348 1 360 14 Q372 4 384 16 Q396 2 408 14 Q420 3 432 14 Q444 0 456 14 Q468 4 480 14 Q492 1 504 14 Q516 3 528 16 Q540 2 552 14 Q564 4 576 14 Q588 0 600 14 Q612 3 624 14 Q636 1 648 14 Q660 4 672 16 Q684 2 696 14 Q708 3 720 14 Q732 0 744 14 Q756 4 768 14 Q780 1 792 14 Q804 3 816 16 Q828 2 840 14 Q852 4 864 14 Q876 0 888 14 Q900 3 912 14 Q924 1 936 14 Q948 4 960 16 Q972 2 984 14 Q996 3 1000 14 L1000 24 L0 24 Z"
            fill="#16a34a"
          />
        </svg>
        {/* 흙 */}
        <div
          className="absolute bottom-0 w-full rounded-b-3xl"
          style={{
            height: '100%',
            background: 'linear-gradient(to bottom, #92400e 0%, #78350f 100%)',
          }}
        />
        {/* 흙 질감 */}
        <div className="absolute inset-0 rounded-b-3xl" style={{
          backgroundImage: 'radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 75% 30%, rgba(0,0,0,0.08) 0%, transparent 40%)',
        }} />
        {/* 풀 위에 작은 꽃/잔디 장식 */}
        {[8, 20, 35, 52, 67, 83, 94].map((xp, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${xp}%`, top: -10, fontSize: i % 3 === 0 ? 12 : 10, opacity: 0.8 }}
          >
            {i % 4 === 0 ? '🌼' : i % 3 === 0 ? '🌿' : '🌱'}
          </div>
        ))}
      </div>

      {/* 고구마 구덩이들 */}
      {SPOTS.map(spot => (
        <div
          key={spot.id}
          className="absolute flex flex-col items-center"
          style={{ left: `${spot.x}%`, bottom: 72, transform: 'translateX(-50%)' }}
        >
          <div className="relative">
            <BuriedItem visible={dug.has(spot.id)} fresh={fresh.has(spot.id)} isCarrot={carrots.has(spot.id)} />
            {fresh.has(spot.id) && <DirtParticles />}
          </div>
          {/* 흙 봉우리 */}
          <div
            className="mt-0.5 rounded-full"
            style={{
              width: 52,
              height: 20,
              background: 'radial-gradient(ellipse at 40% 40%, #a16207 0%, #78350f 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      ))}

      {/* 걷는 캐릭터 */}
      <div
        ref={charRef}
        className="absolute"
        style={{ bottom: 64, left: '8%', transform: 'translateX(-50%)' }}
      >
        <div style={{ animation: surprised ? 'surprised-jump 0.5s ease-out' : undefined, position: 'relative' }}>
          {/* 놀랐을 때 '!' 말풍선 (좌우 반전 보정) */}
          {surprised && (
            <div
              className="absolute font-black"
              style={{
                top: -20,
                left: '50%',
                transform: `translateX(-50%) ${facingRight ? '' : 'scaleX(-1)'}`,
                fontSize: 24,
                color: '#ef4444',
                textShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }}
            >
              ❗
            </div>
          )}
          <WalkerGoguma digging={digging} surprised={surprised} />
        </div>
      </div>

      {/* CSS 키프레임 */}
      <style>{`
        @keyframes cloud-drift {
          0%   { transform: translateX(0)      scaleX(1); }
          100% { transform: translateX(110vw)  scaleX(1); }
        }
        @keyframes sparkle-fly {
          0%   { opacity: 1; transform: translate(0,0)     scale(1.2); }
          100% { opacity: 0; transform: translate(var(--spx,0px),var(--spy,-30px)) scale(0.2); }
        }
        @keyframes dirt-fly {
          0%   { opacity: 0.85; transform: translate(0,0) scale(1); }
          60%  { opacity: 0.5; }
          100% { opacity: 0;   transform: translate(var(--tx,0px),var(--ty,-30px)) scale(0.15); }
        }
        @keyframes surprised-jump {
          0%   { transform: translateY(0); }
          25%  { transform: translateY(-16px); }
          45%  { transform: translateY(-4px); }
          65%  { transform: translateY(-11px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
