import { useId } from 'react';
import type { Move } from './rps';

/** Decorative artwork only. No hitboxes, outcomes, input handlers or game state. */
export function ThreeHandsCrest() {
  return <svg className="three-hands-crest" viewBox="0 0 320 130" role="img" aria-label="Three Hands: stone, flowing paper and crossed blades">
    <path d="M18 67Q160-20 302 67Q160 151 18 67Z" fill="#251b19" stroke="#b88b45" strokeWidth="2"/>
    {[76,160,244].map(x=><circle key={x} cx={x} cy="66" r="35" fill="#17252a" stroke="#d3b36e" strokeWidth="2"/>)}
    <path d="M54 63L65 43L88 47L101 71L87 89L61 85Z" fill="#939d9f" stroke="#111d21" strokeWidth="3"/><path d="M65 43L74 68L101 71M74 68L61 85M74 68L88 47" fill="none" stroke="#44565c" strokeWidth="2"/>
    <path d="M143 42Q156 50 177 40Q164 64 176 88Q160 82 142 91Q155 69 143 42Z" fill="#f8e6b0" stroke="#a99062" strokeWidth="2"/><path d="M149 54Q160 58 170 52M151 66Q159 68 169 63" fill="none" stroke="#ac9569"/>
    <path d="M225 43L262 90M264 43L225 91" stroke="#c94836" strokeWidth="8"/><path d="M224 41L260 88M265 42L228 88" stroke="#ffb26f" strokeWidth="2"/>
  </svg>;
}
export function CinematicDojo() {
  const id = useId().replace(/:/g,'');
  return <svg className="cinematic-dojo-art" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id={`${id}wall`} x2="0" y2="1"><stop stopColor="#271a1a"/><stop offset="1" stopColor="#9d572c"/></linearGradient><radialGradient id={`${id}light`}><stop stopColor="#ffe19a" stopOpacity=".75"/><stop offset="1" stopColor="#f7b65d" stopOpacity="0"/></radialGradient><linearGradient id={`${id}floor`} x2="0" y2="1"><stop stopColor="#bc9153"/><stop offset="1" stopColor="#513022"/></linearGradient></defs>
    <path d="M0 0H1280V505H0Z" fill={`url(#${id}wall)`}/>
    {[80,305,530,755,980,1205].map(x=><g key={x}><rect x={x-20} width="34" height="510" fill="#23151a"/><path d={`M${x+14} 0V505`} stroke="#d5994e" strokeWidth="3" opacity=".55"/></g>)}
    {[155,890].map(x=><g key={x}><rect x={x} y="125" width="235" height="230" fill="#f7d99a" stroke="#291b1d" strokeWidth="12"/><path d={`M${x+78} 125V355M${x+156} 125V355M${x} 202H${x+235}M${x} 279H${x+235}`} stroke="#6b4e37" strokeWidth="5"/></g>)}
    <path d="M0 0L1280 0L1280 50L0 80ZM0 81L1280 51V75L0 108ZM0 420H1280V451H0Z" fill="#341d1b" stroke="#d2914b" strokeWidth="2"/>
    <circle cx="640" cy="245" r="100" fill="#a93327" stroke="#e3ab56" strokeWidth="7"/><path d="M600 220h80m-40-40v120m-44-33h88" fill="none" stroke="#e4b35e" strokeWidth="14"/>
    <path d="M0 505H1280V800H0Z" fill={`url(#${id}floor)`}/>
    {[0,1,2,3,4,5,6,7,8].map(i=><path key={i} d={`M${480+i*40} 505L${-500+i*285} 800`} stroke="#41251c" strokeWidth="4" opacity=".5"/>)}
    {[555,635,740].map(y=><path key={y} d={`M0 ${y}H1280`} stroke="#3a251d" strokeWidth="3" opacity=".55"/>)}
    <path d="M330 523H950L1110 750H170Z" fill="#355963" stroke="#dfc084" strokeWidth="6"/><path d="M640 523V750M247 640H1033" stroke="#d9c38d" strokeWidth="2" opacity=".45"/>
    <ellipse cx="290" cy="390" rx="430" ry="450" fill={`url(#${id}light)`}/>
    <path d="M170 125L400 125L1030 800H470Z" fill="#fff0ba" opacity=".07"/>
    {[460,820].map(x=><g key={x}><path d={`M${x} 0V90`} stroke="#221c1b" strokeWidth="3"/><ellipse cx={x} cy="115" rx="27" ry="36" fill="#eca34b" stroke="#633422" strokeWidth="4"/><path d={`M${x-26} 105H${x+26}M${x-26} 123H${x+26}`} stroke="#9d552d" strokeWidth="3"/></g>)}
  </svg>;
}
export function EnergyRibbons({ move, active = false }: { move?: Move | null; active?: boolean }) {
  return <svg className={`energy-ribbons${active?' energized':''}`} data-hand={move ?? 'none'} viewBox="0 0 1000 600" aria-hidden="true">
    <path className="ribbon-gold" d="M80 475C-10 250 280 75 610 155S1040 420 855 490C695 550 350 520 210 392"/>
    <path className="ribbon-cyan" d="M170 445C390 580 965 400 885 205C850 110 698 95 620 123"/>
    <path className="ribbon-green" d="M250 521C655 620 1100 360 925 170"/>
    {Array.from({length:12},(_,i)=><path key={i} d={`M${110+i*70} ${130+(i%4)*90}l${i%2?8:-8} -15l4 18Z`} fill={i%2?'#ffd879':'#a2f5cf'} opacity=".7"/>)}
  </svg>;
}
