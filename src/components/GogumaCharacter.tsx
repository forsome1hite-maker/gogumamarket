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
      <style>{`
        @keyframes goguma-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
      `}</style>

      {/* 그림자 */}
      <ellipse cx="100" cy="242" rx="48" ry="8" fill="rgba(109,40,217,0.18)" />

      {/* 잎 */}
      <ellipse cx="83" cy="37" rx="9" ry="24" fill="#4ADE80" transform="rotate(-28,83,37)" />
      <ellipse cx="100" cy="28" rx="9" ry="26" fill="#22C55E" />
      <ellipse cx="117" cy="37" rx="9" ry="24" fill="#4ADE80" transform="rotate(28,117,37)" />
      <rect x="97" y="28" width="6" height="20" rx="3" fill="#15803D" />

      {/* 몸통 외곽 */}
      <ellipse cx="100" cy="155" rx="70" ry="88" fill="#5B21B6" />
      {/* 몸통 메인 */}
      <ellipse cx="100" cy="152" rx="58" ry="74" fill="#7C3AED" />
      {/* 몸통 하이라이트 */}
      <ellipse cx="82" cy="108" rx="22" ry="14" fill="rgba(255,255,255,0.22)" />

      {/* 눈 흰자 */}
      <g style={{ animation: 'blink 4s ease-in-out infinite', transformOrigin: '78px 128px' }}>
        <ellipse cx="78" cy="128" rx="18" ry="20" fill="white" />
      </g>
      <g style={{ animation: 'blink 4s ease-in-out infinite', transformOrigin: '122px 128px' }}>
        <ellipse cx="122" cy="128" rx="18" ry="20" fill="white" />
      </g>
      {/* 눈동자 */}
      <ellipse cx="80" cy="130" rx="11" ry="13" fill="#1E1B4B" />
      <ellipse cx="124" cy="130" rx="11" ry="13" fill="#1E1B4B" />
      {/* 눈 하이라이트 */}
      <circle cx="85" cy="124" r="5" fill="white" />
      <circle cx="129" cy="124" r="5" fill="white" />
      <circle cx="76" cy="133" r="2.5" fill="rgba(255,255,255,0.55)" />
      <circle cx="120" cy="133" r="2.5" fill="rgba(255,255,255,0.55)" />

      {/* 볼터치 */}
      <ellipse cx="57" cy="148" rx="15" ry="9" fill="#FDA4AF" opacity="0.6" />
      <ellipse cx="143" cy="148" rx="15" ry="9" fill="#FDA4AF" opacity="0.6" />

      {/* 입 */}
      <path
        d="M 80 167 Q 100 186 120 167"
        stroke="#1E1B4B"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 팔 */}
      <ellipse cx="22" cy="147" rx="22" ry="11" fill="#5B21B6" transform="rotate(-18,22,147)" />
      <ellipse cx="178" cy="147" rx="22" ry="11" fill="#5B21B6" transform="rotate(18,178,147)" />

      {/* 무늬 (고구마 결) */}
      <path d="M 70 185 Q 100 190 130 185" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" fill="none" />
      <path d="M 62 200 Q 100 207 138 200" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
    </svg>
  )
}
