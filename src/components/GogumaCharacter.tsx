'use client'

interface Props {
  size?: number
  className?: string
  animate?: boolean
}

export default function GogumaCharacter({ size = 180, className = '', animate = true }: Props) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.25)}
      viewBox="0 0 200 250"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={animate ? { animation: 'goguma-float 3s ease-in-out infinite' } : undefined}
    >
      <defs>
        {/* 익은 고구마 속살 그라디언트 */}
        <radialGradient id="fleshGrad" cx="40%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#FFFBEB" />
          <stop offset="35%"  stopColor="#FDE68A" />
          <stop offset="75%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        {/* 껍질 갈라진 그림자 */}
        <radialGradient id="crackShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1E0A3C" />
          <stop offset="100%" stopColor="#2E1065" />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes goguma-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95%            { transform: scaleY(0.1); }
        }
        @keyframes steam-rise {
          0%   { opacity: 0;    transform: translateY(0px)   scaleX(1); }
          18%  { opacity: 0.78; }
          100% { opacity: 0;    transform: translateY(-52px) scaleX(0.5); }
        }
      `}</style>

      {/* ── 그림자 ── */}
      <ellipse cx="100" cy="242" rx="48" ry="8" fill="rgba(109,40,217,0.18)" />

      {/* ── 모락모락 김 ── */}
      {/* 왼쪽 */}
      <path
        d="M 82 65 Q 76 52 82 41 Q 88 30 82 19"
        stroke="rgba(220,220,255,0.75)" strokeWidth="3.8" fill="none" strokeLinecap="round"
        style={{ animation: 'steam-rise 2.6s ease-out infinite' }}
      />
      {/* 가운데 */}
      <path
        d="M 100 61 Q 106 48 100 37 Q 94 26 100 15"
        stroke="rgba(220,220,255,0.75)" strokeWidth="3.8" fill="none" strokeLinecap="round"
        style={{ animation: 'steam-rise 2.6s ease-out infinite', animationDelay: '0.85s' }}
      />
      {/* 오른쪽 */}
      <path
        d="M 118 65 Q 124 52 118 41 Q 112 30 118 19"
        stroke="rgba(220,220,255,0.75)" strokeWidth="3.8" fill="none" strokeLinecap="round"
        style={{ animation: 'steam-rise 2.6s ease-out infinite', animationDelay: '1.7s' }}
      />

      {/* ── 몸통 ── */}
      <ellipse cx="100" cy="155" rx="70" ry="88" fill="#5B21B6" />
      <ellipse cx="100" cy="152" rx="58" ry="74" fill="#7C3AED" />
      {/* 몸통 하이라이트 */}
      <ellipse cx="82" cy="110" rx="22" ry="14" fill="rgba(255,255,255,0.20)" />

      {/* ── 익은 고구마 껍질 갈라진 부분 ── */}
      {/* 갈라진 틈 그림자 (깊이감) */}
      <ellipse cx="100" cy="83" rx="40" ry="20" fill="url(#crackShadow)" />

      {/* 속살 (노랗고 달콤한 고구마 속) */}
      <ellipse cx="100" cy="82" rx="32" ry="15" fill="url(#fleshGrad)" />

      {/* 속살 표면 밝은 하이라이트 */}
      <ellipse cx="95" cy="78" rx="17" ry="7" fill="#FFFBEB" opacity="0.5" />

      {/* 속살 결무늬 */}
      <path d="M 76 84 Q 100 80 124 84" stroke="#F59E0B" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 82 88 Q 100 85 118 88" stroke="#D97706" strokeWidth="1.2" fill="none" opacity="0.35" />

      {/* 왼쪽 껍질 벗겨진 부분 */}
      <path d="M 60 83 Q 54 71 62 63 Q 70 57 77 67 Q 70 73 60 83 Z"
            fill="#6D28D9" />
      <path d="M 60 83 Q 54 71 62 63 Q 65 60 68 64 Q 63 71 60 83 Z"
            fill="#4C1D95" />
      {/* 왼쪽 껍질 끝부분 말린 느낌 */}
      <ellipse cx="66" cy="64" rx="6" ry="4" fill="#5B21B6" transform="rotate(-20,66,64)" />

      {/* 오른쪽 껍질 벗겨진 부분 */}
      <path d="M 140 83 Q 146 71 138 63 Q 130 57 123 67 Q 130 73 140 83 Z"
            fill="#6D28D9" />
      <path d="M 140 83 Q 146 71 138 63 Q 135 60 132 64 Q 137 71 140 83 Z"
            fill="#4C1D95" />
      {/* 오른쪽 껍질 끝부분 말린 느낌 */}
      <ellipse cx="134" cy="64" rx="6" ry="4" fill="#5B21B6" transform="rotate(20,134,64)" />

      {/* ── 눈 흰자 ── */}
      <g style={{ animation: 'blink 4s ease-in-out infinite', transformOrigin: '78px 130px' }}>
        <ellipse cx="78" cy="130" rx="18" ry="20" fill="white" />
      </g>
      <g style={{ animation: 'blink 4s ease-in-out infinite', transformOrigin: '122px 130px' }}>
        <ellipse cx="122" cy="130" rx="18" ry="20" fill="white" />
      </g>
      {/* 눈동자 */}
      <ellipse cx="80" cy="132" rx="11" ry="13" fill="#1E1B4B" />
      <ellipse cx="124" cy="132" rx="11" ry="13" fill="#1E1B4B" />
      {/* 눈 하이라이트 */}
      <circle cx="85" cy="126" r="5"   fill="white" />
      <circle cx="129" cy="126" r="5"  fill="white" />
      <circle cx="76"  cy="135" r="2.5" fill="rgba(255,255,255,0.55)" />
      <circle cx="120" cy="135" r="2.5" fill="rgba(255,255,255,0.55)" />

      {/* ── 볼터치 ── */}
      <ellipse cx="57"  cy="150" rx="15" ry="9" fill="#FDA4AF" opacity="0.6" />
      <ellipse cx="143" cy="150" rx="15" ry="9" fill="#FDA4AF" opacity="0.6" />

      {/* ── 입 ── */}
      <path d="M 80 169 Q 100 188 120 169"
            stroke="#1E1B4B" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* ── 팔 ── */}
      <ellipse cx="22"  cy="149" rx="22" ry="11" fill="#5B21B6" transform="rotate(-18,22,149)"  />
      <ellipse cx="178" cy="149" rx="22" ry="11" fill="#5B21B6" transform="rotate(18,178,149)" />

      {/* 몸통 결무늬 */}
      <path d="M 70 187 Q 100 192 130 187" stroke="rgba(255,255,255,0.13)" strokeWidth="2.5" fill="none" />
      <path d="M 62 202 Q 100 209 138 202" stroke="rgba(255,255,255,0.10)" strokeWidth="2"   fill="none" />
    </svg>
  )
}
