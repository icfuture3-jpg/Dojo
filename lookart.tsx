// SVG art for the character creator: head shapes, hair, eyes and outfit patterns.
import type { ReactNode } from "react";

/** Head shapes: half width, half height, corner radius. Head centre is (100, 68). */
export const HEAD_SHAPES: { rx: number; ry: number; r: number }[] = [
  { rx: 38, ry: 38, r: 38 },
  { rx: 34, ry: 42, r: 34 },
  { rx: 43, ry: 35, r: 30 },
  { rx: 38, ry: 38, r: 10 },
  { rx: 32, ry: 45, r: 28 },
  { rx: 35, ry: 43, r: 35 },
  { rx: 44, ry: 40, r: 40 },
  { rx: 30, ry: 32, r: 30 },
  { rx: 40, ry: 40, r: 5 },
  { rx: 36, ry: 42, r: 18 },
];

/** Eye styles: half width, half height, brow tilt, lid droop (0..1). */
export const EYE_SHAPES: { rx: number; ry: number; tilt: number; lid: number }[] = [
  { rx: 5, ry: 5, tilt: 0, lid: 0 },
  { rx: 6, ry: 4, tilt: 5, lid: 0.2 },
  { rx: 7, ry: 7, tilt: -2, lid: 0 },
  { rx: 7, ry: 4, tilt: 2, lid: 0 },
  { rx: 6, ry: 5, tilt: -3, lid: 0.5 },
  { rx: 6, ry: 3, tilt: -4, lid: 0 },
  { rx: 7, ry: 3.5, tilt: 7, lid: 0.15 },
  { rx: 8, ry: 8, tilt: -3, lid: 0 },
  { rx: 3, ry: 3, tilt: 0, lid: 0 },
  { rx: 6, ry: 5, tilt: 6, lid: 0.1 },
  { rx: 6, ry: 5, tilt: -5, lid: 0.6 },
  { rx: 6, ry: 6, tilt: -2, lid: 0.1 },
];

export function Eyes({ i, color, panda }: { i: number; color: string; panda: boolean }) {
  const e = EYE_SHAPES[i % EYE_SHAPES.length]!;
  return (
    <>
      {[-1, 1].map((s) => {
        const cx = 100 + s * 14;
        const ir = Math.min(e.rx, e.ry * 1.15) * 0.85;
        return (
          <g key={s}>
            <ellipse cx={cx} cy={76} rx={e.rx} ry={e.ry} fill="#fff" stroke="#0006" strokeWidth="1" />
            <circle cx={cx} cy={76} r={ir} fill={color} />
            <circle cx={cx} cy={76} r={ir * 0.5} fill="#111" />
            <circle cx={cx - ir * 0.3} cy={76 - ir * 0.3} r={Math.max(1, ir * 0.25)} fill="#fff" />
            {e.lid > 0 && <path d={`M${cx - e.rx - 1} ${76 - e.ry - 1} H${cx + e.rx + 1} V${76 - e.ry + e.ry * 2 * e.lid} H${cx - e.rx - 1} Z`} fill={panda ? "#111" : "#0003"} />}
            <path d={`M${cx - s * 11} ${66 + (s * e.tilt * -0.5)} L${cx + s * 9} ${68 + s * e.tilt * 0.4}`} stroke="#222" strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      })}
    </>
  );
}

/** Hair drawn behind the head. */
export function HairBack({ i, c }: { i: number; c: string }): ReactNode {
  switch (i) {
    case 26: return <g fill={c}><circle cx="100" cy="13" r="24"/><circle cx="81" cy="17" r="12"/><circle cx="119" cy="17" r="12"/></g>;
    case 27: return <g fill={c}><circle cx="143" cy="53" r="15"/><circle cx="151" cy="79" r="14"/><circle cx="153" cy="104" r="12"/><path d="M140 65h20m-17 26h20" stroke="#cfad70" strokeWidth="3"/></g>;
    case 28: return <g><path d="M64 46Q42 82 61 126" fill="none" stroke={c} strokeWidth="17"/><path d="M56 68l12 8m-15 8l14 8m-13 8l13 8m-9 6l10 7" stroke="#ffffff44" strokeWidth="2"/></g>;
    case 29: return <g fill={c}><circle cx="62" cy="22" r="17"/><circle cx="138" cy="22" r="17"/><path d="M48 22q14-17 27 0m50 0q14-17 27 0" fill="none" stroke="#ffffff44" strokeWidth="2"/></g>;
    case 30: return <path d="M60 45Q43 66 52 88Q41 108 66 111Q82 114 83 97H120Q124 113 141 104Q158 92 146 75Q155 52 137 43Z" fill={c}/>;

    case 6: return <path d="M126 52 Q158 70 150 120 Q140 100 130 90 Z" fill={c} />;
    case 7: return <path d="M60 50 Q44 120 60 150 L140 150 Q156 120 140 50 Z" fill={c} />;
    case 8: return <path d="M58 55 Q50 100 66 102 L134 102 Q150 100 142 55 Z" fill={c} />;
    case 9: return <circle cx="100" cy="46" r="52" fill={c} />;
    case 10: return <><circle cx="58" cy="30" r="15" fill={c} /><circle cx="142" cy="30" r="15" fill={c} /></>;
    case 12: return <path d="M62 60 L56 130 M70 62 L66 140 M138 60 L144 130 M130 62 L134 140" stroke={c} strokeWidth="9" strokeLinecap="round" />;
    case 17: return <><path d="M62 52 Q40 80 46 128" stroke={c} strokeWidth="14" fill="none" strokeLinecap="round" /><path d="M138 52 Q160 80 154 128" stroke={c} strokeWidth="14" fill="none" strokeLinecap="round" /></>;
    case 19: return <path d="M54 56 Q30 110 52 140 L68 100 L100 150 L132 100 L148 140 Q170 110 146 56 Z" fill={c} />;
    case 21: return <path d="M60 50 L50 140 M68 54 L64 148 M76 56 L78 132 M140 50 L150 140 M132 54 L136 148 M124 56 L122 132" stroke={c} strokeWidth="8" strokeLinecap="round" />;
    case 5: return <circle cx="100" cy="14" r="14" fill={c} />;
    case 16: return <><path d="M92 28 L100 4 L108 28 Z" fill={c} /><rect x="94" y="14" width="12" height="6" fill="#0005" /></>;
    default: return null;
  }
}

/** Hair drawn over the head's top. */
export function HairFront({ i, c }: { i: number; c: string }): ReactNode {
  const cap = <path d="M62 56 Q62 24 100 24 Q138 24 138 56 Q120 40 100 40 Q80 40 62 56 Z" fill={c} />;
  switch (i) {
    case 24: return <g fill={c}><path d="M62 54Q58 17 100 18Q141 17 138 54L126 43Q101 30 74 43Z"/><path d="M63 44v19l10-10m64-9v19l-10-10" opacity=".5"/></g>;
    case 25: return <path d="M60 60Q55 20 100 20Q145 20 140 60L119 45L111 67L101 37L91 67L80 46Z" fill={c}/>;
    case 26: return <path d="M62 52Q64 26 100 28Q136 26 138 52Q100 37 62 52" fill={c}/>;
    case 27: return <path d="M61 55Q62 21 101 23Q132 20 141 53L122 39L82 43L69 61Z" fill={c}/>;
    case 28: return <path d="M60 59Q58 22 100 22Q140 21 139 51Q108 31 67 64Z" fill={c}/>;
    case 29: return <path d="M61 54Q65 23 100 25Q135 23 139 54L117 40L100 49L82 40Z" fill={c}/>;
    case 30: return <path d="M59 60Q48 32 80 25Q116 11 140 36L142 60Q130 37 112 48Q98 63 87 46Q75 43 59 60Z" fill={c}/>;
    case 31: return <path d="M68 52Q65 12 113 17L141 9L131 28L147 26L134 42Q101 35 68 60Z" fill={c}/>;

    case 0: return null;
    case 1: return <path d="M64 50 Q66 28 100 28 Q134 28 136 50 Q100 36 64 50 Z" fill={c} opacity="0.85" />;
    case 2: return cap;
    case 3: return <path d="M62 52 L58 22 L76 38 L84 10 L98 34 L112 8 L120 36 L138 20 L138 52 Q100 34 62 52 Z" fill={c} />;
    case 4: return <path d="M90 36 L92 6 L108 6 L110 36 Q100 30 90 36 Z" fill={c} />;
    case 5: return cap;
    case 6: return cap;
    case 7: return <path d="M60 56 Q58 22 100 22 Q142 22 140 56 L128 44 Q100 30 72 44 Z" fill={c} />;
    case 8: return <path d="M58 60 Q56 22 100 22 Q144 22 142 60 L130 44 Q100 36 70 44 Z" fill={c} />;
    case 9: return null;
    case 10: return cap;
    case 11: return <path d="M60 58 Q60 24 100 24 Q140 24 140 52 Q110 34 76 58 Z" fill={c} />;
    case 12: return cap;
    case 13: return <path d="M64 50 Q56 14 100 14 Q144 14 136 50 Q100 30 64 50 Z" fill={c} />;
    case 14: return <path d="M60 54 L48 28 L70 36 L66 6 L88 28 L100 0 L112 28 L134 6 L130 36 L152 28 L140 54 Q100 34 60 54 Z" fill={c} />;
    case 15: return <><circle cx="70" cy="38" r="12" fill={c} /><circle cx="88" cy="28" r="13" fill={c} /><circle cx="112" cy="28" r="13" fill={c} /><circle cx="130" cy="38" r="12" fill={c} /></>;
    case 16: return cap;
    case 17: return cap;
    case 18: return <path d="M100 26 Q134 26 138 56 Q120 40 100 40 Z" fill={c} />;
    case 19: return cap;
    case 20: return <path d="M62 58 Q62 24 100 24 Q138 24 138 58 Q122 42 100 52 Q78 42 62 58 Z" fill={c} />;
    case 21: return cap;
    case 22: return <path d="M62 56 Q62 24 100 24 Q138 24 138 56 L132 52 L124 60 L116 50 L106 60 L96 50 L86 60 L76 50 L68 58 Z" fill={c} />;
    case 23: return <path d="M62 54 Q60 30 76 30 Q72 12 88 4 Q90 22 100 14 Q112 24 118 8 Q126 28 124 30 Q142 32 138 54 Q100 34 62 54 Z" fill={c} />;
    default: return null;
  }
}

/** Overlay pattern on the torso (x 50..150, y 100..220), clipped by the caller. */
export function Pattern({ i }: { i: number }): ReactNode {
  const light = "#ffffffee";
  const dark = "#000000b0";
  switch (i) {
    case 1: return <>{[112, 132, 152, 172, 192, 212].map((y) => <rect key={y} x="50" y={y} width="100" height="11" fill={dark} />)}</>;
    case 2: return <>{[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3, 4].map((c) => (r + c) % 2 === 0 ? <rect key={`${r}${c}`} x={50 + c * 20} y={100 + r * 20} width="20" height="20" fill={dark} /> : null))}</>;
    case 3: return <path d="M50 120 L100 150 L150 120 M50 150 L100 180 L150 150 M50 180 L100 210 L150 180" stroke={light} strokeWidth="9" fill="none" />;
    case 4: return <>{[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => <circle key={`${r}${c}`} cx={60 + c * 20 + (r % 2) * 10} cy={112 + r * 22} r="6" fill={light} />))}</>;
    case 5: return <path d="M50 108 L150 200 L150 220 L50 130 Z" fill={dark} />;
    case 6: return <path d="M50 220 Q60 190 70 205 Q76 170 92 200 Q100 160 112 200 Q124 176 130 205 Q142 190 150 220 Z" fill="#ffb01f" />;
    case 7: return <path d="M50 120 Q62 112 75 120 T100 120 T125 120 T150 120 M50 145 Q62 137 75 145 T100 145 T125 145 T150 145 M50 170 Q62 162 75 170 T100 170 T125 170 T150 170" stroke={light} strokeWidth="7" fill="none" />;
    case 8: return <>{[[70, 125], [125, 120], [96, 150], [68, 180], [130, 178], [100, 205]].map(([x, y]) => <path key={`${x}${y}`} d={`M${x} ${y! - 8} L${x! + 3} ${y! - 2} L${x! + 9} ${y!} L${x! + 3} ${y! + 3} L${x} ${y! + 9} L${x! - 3} ${y! + 3} L${x! - 9} ${y!} L${x! - 3} ${y! - 2} Z`} fill="#ffe14a" stroke="#00000066" strokeWidth="1.5" />)}</>;
    case 9: return <path d="M100 104 L128 140 L100 176 L72 140 Z M100 150 L124 180 L100 210 L76 180 Z" fill="none" stroke={light} strokeWidth="7" />;
    case 10: return <text x="100" y="170" textAnchor="middle" fontSize="70" fill={dark} fontFamily="serif">道</text>;
    case 11: return <rect x="50" y="160" width="100" height="60" fill={dark} />;
    case 12: return <>{[118, 146, 174, 202].map((y) => <rect key={y} x="50" y={y} width="100" height="14" fill={y % 56 === 6 ? light : dark} />)}</>;
    case 13: return <>{[[64, 120, 18], [112, 130, 22], [80, 170, 20], [124, 184, 18], [60, 205, 14]].map(([x, y, r]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx={r} ry={r! * 0.7} fill="#2f5a1fdd" />)}</>;
    case 14: return <>{[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => <path key={`${r}${c}`} d={`M${52 + c * 20 + (r % 2) * 10} ${120 + r * 20} q10 -14 20 0`} stroke={dark} strokeWidth="5" fill="none" />))}</>;
    case 15: return <path d="M112 104 L84 150 L102 150 L88 210 L124 140 L104 140 Z" fill="#fff23a" />;
    case 16: return <g stroke="#ffd97b" strokeWidth="5" fill="none"><circle cx="100" cy="150" r="22"/>{Array.from({length:12},(_,n)=><path key={n} d="M100 119V105" transform={`rotate(${n*30} 100 150)`}/>)}</g>;
    case 17: return <g fill="#ffd1e6" stroke="#392537" strokeWidth="2">{[-2,-1,0,1,2].map(n=><ellipse key={n} cx="100" cy="154" rx="10" ry="29" transform={`rotate(${n*28} 100 178)`}/>)}</g>;
    case 18: return <g stroke="#183d29" strokeWidth="5" fill="none"><path d="M67 100v120m32-120v120m33-120v120M50 124h100m-100 32h100m-100 32h100"/>{[124,156,188].map(y=><path key={y} d={`M67 ${y}l18-13m14 13l18 12m15-12l14-12`}/>)}</g>;
    case 19: return <g stroke={light} strokeWidth="4" fill="none">{[125,165,205].map((y,n)=><path key={y} d={`M50 ${y}q12-18 25 0q18-29 30-2q24-16 45 3m-65-2q10-12 15 0`} transform={`translate(${n%2?5:0} 0)`}/>)}</g>;
    case 20: return <g fill="#f5eed9" stroke="#223341" strokeWidth="2"><path d="M100 160Q74 115 52 127L78 159L58 155L89 177L100 192L111 177L142 155L122 159L148 127Q126 115 100 160Z"/><path d="M99 159l7-23l-10 4" fill="none"/></g>;
    case 21: return <g fill="#b7d6d8" stroke="#233b50" strokeWidth="3"><path d="M45 211L80 127L109 184L127 151L155 218Z"/><path d="M70 151l10-24l14 27l-14-7Z" fill="#fff4d7"/></g>;
    case 22: return <g fill="none" strokeWidth="9"><path d="M50 103l100 100m-100-62l74 79" stroke="#efbd58"/><path d="M150 105L50 205m100-65l-79 80" stroke="#da7775"/></g>;
    case 23: return <g stroke="#88dfbe" strokeWidth="4" fill="none">{[0,1,2,3].map(n=><path key={n} d={`M${30+n*32} 100l110 120M${170-n*32} 100L${60-n*32} 220`}/>)}</g>;
    case 24: return <g>{[[73,123],[126,149],[81,197]].map(([x,y])=><g key={y} transform={`translate(${x} ${y})`} fill="#f5a9c1" stroke="#8a3c5b" strokeWidth="1.5">{[0,72,144,216,288].map(a=><ellipse key={a} cy="-7" rx="5" ry="8" transform={`rotate(${a})`}/>)}<circle r="3" fill="#ffe29b"/></g>)}</g>;
    case 25: return <g><path d="M84 114Q55 143 91 166Q120 143 84 114ZM91 166L74 185L100 177Z" fill="#f09c64" stroke="#2a424b" strokeWidth="3"/><path d="M123 176Q143 194 119 211Q97 193 123 176Z" fill="#fff3d8" stroke="#2a424b" strokeWidth="3"/><circle cx="82" cy="130" r="3" fill="#222"/></g>;
    case 26: return <g fill="#101820">{[112,138,164,190,216].map((y,n)=><path key={y} d={`M50 ${y}L${n%2?93:85} ${y+12}L50 ${y+10}ZM150 ${y+3}L${n%2?107:115} ${y+16}L150 ${y+13}Z`}/>)}</g>;
    case 27: return <g fill="none" stroke="#ffca69" strokeWidth="4"><path d="M72 216Q68 162 119 108M79 200l28-4m-31-13l35-5m-28-10l32-9m-24-4l27-14M81 192l-14-15m19-5l-15-15m21 1l-13-19"/><path d="M119 108q22 5 10 27q-23-4-10-27Z" fill="#d86f52"/></g>;
    case 28: return <g fill="#94daed" stroke="#264d6b" strokeWidth="3">{[145,185,225].map(y=><path key={y} d={`M50 ${y}q18-36 43-26q-21 0-19 16q12 11 27 2q19-26 49-6v18H50Z`}/>)}</g>;
    case 29: return <g fill="#fff1b0" stroke="#574c76" strokeWidth="2">{[[75,128],[125,155],[84,198]].map(([x,y])=><path key={y} d={`M${x+9} ${y-14}a16 16 0 1 0 0 28a12 12 0 0 1 0-28Z`}/>)}</g>;
    case 30: return <g fill="none" stroke="#d1e5df" strokeWidth="3">{[0,1,2,3].map(r=>[0,1,2].map(c=><path key={`${r}${c}`} d={`M${55+c*36+(r%2)*18} ${108+r*31}l16-9l16 9v18l-16 9l-16-9Z`}/>))}</g>;
    case 31: return <g fill="#da773f" stroke="#682c24" strokeWidth="2">{[[73,135],[127,179],[76,207]].map(([x,y])=><path key={y} d={`M${x} ${y-18}l4 11l9-7l-3 11l12 2l-16 8l-3 10l-3-10l-16-8l12-2l-3-11l9 7Z`}/>)}</g>;
    case 32: return <g strokeLinejoin="round" strokeLinecap="round"><path d="M114 160Q72 145 70 169Q68 190 101 187Q137 183 126 204Q119 215 83 211L67 221" fill="none" stroke="#ffe3a0" strokeWidth="9"/><path d="M106 157L107 141L118 133L131 140L147 143L139 151L149 158L130 165L119 161Z" fill="#ffe3a0" stroke="#825429" strokeWidth="2"/><path d="M110 141L103 126L118 135M124 137L132 124L132 140M72 167L61 162M84 187L76 198M121 190L139 185M114 211L123 223" fill="none" stroke="#ffe3a0" strokeWidth="4"/><path d="M79 161l6 5m5-7l5 5m-14 19l7-5m7 7l7-5m15 17l6 2" stroke="#aa7437" strokeWidth="2"/><circle cx="125" cy="144" r="3" fill="#962f29"/><path d="M134 152l8-1M140 158l10 4" fill="none" stroke="#9a4a31" strokeWidth="2"/></g>;

    default: return null;
  }
}