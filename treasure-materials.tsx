/** Shared painted materials for the purse, scroll and collectible treasury artwork. */
export function TreasureMaterials({id}:{id:string}){
 return <>
 <linearGradient id={`${id}-gold`} x2=".8" y2="1"><stop stopColor="#fff1b3"/><stop offset=".35" stopColor="#d5a33c"/><stop offset=".7" stopColor="#8e5919"/><stop offset="1" stopColor="#ecc36a"/></linearGradient>
 <linearGradient id={`${id}-jade`}><stop stopColor="#163e35"/><stop offset=".5" stopColor="#77a98a"/><stop offset="1" stopColor="#163e35"/></linearGradient>
 <linearGradient id={`${id}-paper`}><stop stopColor="#bda670"/><stop offset=".45" stopColor="#fff0ba"/><stop offset="1" stopColor="#baa06a"/></linearGradient>
 <linearGradient id={`${id}-bronze`} x2=".8" y2="1"><stop stopColor="#d8c482"/><stop offset=".3" stopColor="#8e9561"/><stop offset=".65" stopColor="#325b4f"/><stop offset="1" stopColor="#ae9460"/></linearGradient>
 <radialGradient id={`${id}-pearl`} cx=".3" cy=".25"><stop stopColor="#fffbe1"/><stop offset=".4" stopColor="#eee9c9"/><stop offset=".75" stopColor="#b9c9be"/><stop offset="1" stopColor="#52776d"/></radialGradient>
 <linearGradient id={`${id}-fire`} x2=".2" y2="1"><stop stopColor="#ffe9a1"/><stop offset=".45" stopColor="#da933e"/><stop offset="1" stopColor="#933c25"/></linearGradient>
 </>;
}
