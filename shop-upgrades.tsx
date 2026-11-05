import { Coin } from "./catalog-art";
import { useId } from 'react';
import { UPGRADES, type Profile } from './economy';
import { buyUpgradeMsg, type DojoEvent } from './net';
import './shop-upgrades.css';

/** Original vector artwork: no downloaded assets or platform-dependent emoji. */
export function UpgradeArt({ kind }: { kind: 'coin' | 'xp' }) {
  const id = useId().replace(/:/g, '');
  return <svg role="img" aria-label={kind === 'coin' ? 'Embroidered gold coin purse' : 'Jade scholar scroll'} viewBox="0 0 180 150" className="upgrade-art">
    <defs>
      <linearGradient id={`${id}-gold`} x2=".8" y2="1"><stop stopColor="#fff1b3"/><stop offset=".35" stopColor="#d5a33c"/><stop offset=".7" stopColor="#8e5919"/><stop offset="1" stopColor="#ecc36a"/></linearGradient>
      <linearGradient id={`${id}-jade`}><stop stopColor="#163e35"/><stop offset=".5" stopColor="#77a98a"/><stop offset="1" stopColor="#163e35"/></linearGradient>
      <linearGradient id={`${id}-paper`}><stop stopColor="#bda670"/><stop offset=".45" stopColor="#fff0ba"/><stop offset="1" stopColor="#baa06a"/></linearGradient>
    </defs>
    <ellipse cx="90" cy="137" rx="67" ry="8" fill="#000" opacity=".25"/>
    {kind === 'coin' ? <>
      <path d="M62 44L54 17L76 24L91 9L106 24L127 17L118 46Z" fill={`url(#${id}-gold)`} stroke="#754b1c" strokeWidth="3"/>
      <path d="M62 43Q25 62 28 105Q32 143 89 139Q147 142 152 106Q156 64 118 43Z" fill={`url(#${id}-gold)`} stroke="#765020" strokeWidth="3"/>
      <path d="M53 59Q20 110 60 125M128 59Q162 109 124 127M78 54L70 129M103 54L111 129" stroke="#f6d78c" strokeWidth="2" fill="none" opacity=".65"/>
      <path d="M58 43Q90 51 123 43M58 49Q90 57 123 49" stroke="#422f20" strokeWidth="5" fill="none"/>
      <path d="M93 48Q137 30 135 53Q131 69 96 50Q58 32 55 53Q55 65 92 50M90 51L76 82M95 51L115 75" fill="none" stroke="#b42e28" strokeWidth="4"/>
      {[[-1,0],[1,0]].map(([dir],i)=><path key={i} d={`M${90+dir!*42} 72q${dir!*14} 15 0 28q${-dir!*16} 7 0 17`} fill="none" stroke="#ffd984" strokeWidth="3"/>)}
      <circle cx="90" cy="96" r="24" fill="#92641f" stroke="#ffe7a0" strokeWidth="3"/><circle cx="90" cy="96" r="17" fill="none" stroke="#d4b85d"/>
      <path d="M86 86h9v19h-9z" fill="#294d39" stroke="#e5cf82" strokeWidth="2"/>
      {[[43,108],[134,112],[58,129]].map(([x,y])=><g key={x} transform={`translate(${x} ${y})`}><ellipse rx="13" ry="6" fill={`url(#${id}-gold)`} stroke="#704719"/><path d="M-3-2h6v4h-6z" fill="#6e5528"/></g>)}
    </> : <>
      <path d="M40 29H140V125H40Z" fill={`url(#${id}-paper)`} stroke="#94773f" strokeWidth="2"/>
      <path d="M53 34H128V119H53Z" fill="#254b3c" opacity=".85"/>
      {[67,88,109].map((x,i)=><g key={x} stroke="#dacf9c" strokeWidth="2.5" fill="none" opacity=".9"><path d={`M${x} 45v56m-6-48h12m-12 11h12m-10 11h8m-10 11h12m-9 12h6`}/><path d={`M${x-4} ${60+i*5}l-5 8m13-4l5 7`}/></g>)}
      {[37,143].map(x=><g key={x}><rect x={x-9} y="18" width="18" height="116" rx="7" fill={`url(#${id}-jade)`} stroke="#9ab38a" strokeWidth="2"/><path d={`M${x-9} 36h18m-18 78h18`} stroke="#e4d39c" strokeWidth="5"/><ellipse cx={x} cy="17" rx="10" ry="4" fill="#c9b47a"/><ellipse cx={x} cy="136" rx="10" ry="4" fill="#c9b47a"/></g>)}
      <path d="M90 125v15m-5-6l5 8l5-8" fill="none" stroke="#a7352c" strokeWidth="3"/>
    </>}
  </svg>;
}
function ParchmentLandscape() {
  return <svg className="upgrade-landscape" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path d="M0 290L120 78L183 185L220 128L360 306L440 235L600 360H0" fill="#7f8174" opacity=".2"/>
    <path d="M0 330L145 160L210 237L256 198L419 360H0" fill="#5d6c62" opacity=".18"/>
    <path d="M112 90L88 155L124 139L148 167Z" fill="#fffbdf" opacity=".6"/>
    <g fill="#817862" opacity=".28"><path d="M820 320V200H1080V320ZM800 205Q950 195 1100 205L1071 184H833ZM831 162Q950 151 1069 162L1040 140H860ZM870 118Q950 102 1030 118L1005 95H895Z"/><path d="M853 200V320M895 200V320M950 200V320M1005 200V320M1047 200V320" stroke="#665a48" strokeWidth="6"/></g>
    <path d="M1200 15Q1070 34 1060 105M1130 43L1080 19M1092 70L1135 87" stroke="#6f6254" strokeWidth="4" fill="none"/>
    {[[1127,43],[1101,62],[1081,84],[1066,101],[1080,21],[1134,85]].map(([x,y])=><g key={x} fill="#b67b7c" opacity=".55"><circle cx={x} cy={y} r="6"/><circle cx={x!+5} cy={y!-4} r="5"/><circle cx={x!-4} cy={y!-5} r="4"/></g>)}
    <path d="M0 333Q300 309 610 335T1200 321M0 346Q400 331 800 348T1200 340" fill="none" stroke="#80775e" opacity=".2"/>
  </svg>;
}
export function ShopUpgrades({ p, dispatch }: { p: Profile; dispatch(event: DojoEvent): void }) {
  return <section className="shop-upgrades" aria-label="Dojo shop upgrades">
    <div className="upgrade-heading"><span>DOJO TREASURES</span><span>Permanent upgrades · Saved on this device</span></div>
    <div className="upgrade-rows">{UPGRADES.map(u => {
      const level = p.up[u.id], cost = u.costs[level], maxed = cost === undefined;
      const kind = u.id === 'coin' ? 'coin' : 'xp';
      return <article className={`upgrade-row upgrade-${kind}`} key={u.id}>
        <div className="upgrade-description"><h3>{u.name} <span>Lv {level}/{u.costs.length}</span></h3><p>{u.blurb}</p><div className="upgrade-levels" aria-label={`${level} of ${u.costs.length} upgrades purchased`}>{u.costs.map((_,i)=><span key={i} className={i<level?'earned':''}/>)}</div></div>
        <UpgradeArt kind={kind}/>
        <div className="upgrade-purchase">{maxed ? <strong className="upgrade-maxed">MAX UPGRADE</strong> : <><button type="button" disabled={p.coins < cost} aria-label={`Upgrade ${u.name} for ${cost} coins`} onClick={()=>dispatch({type:'dojo.send',message:buyUpgradeMsg({id:u.id})})}>UPGRADE <span><Coin size={18}/> {cost} coins</span></button><small>{p.coins < cost ? `${cost-p.coins} more coins needed` : 'Purchase next level'}</small></>}</div>
      </article>;
    })}</div>
    <div className="upgrade-parchment"><ParchmentLandscape/><div className="upgrade-seal"><span>THREE HANDS</span><strong>Train with purpose.</strong><p>Build your fortune.<br/>Deepen your knowledge.</p><span className="seal-mark" aria-hidden="true">III</span></div></div>
  </section>;
}
