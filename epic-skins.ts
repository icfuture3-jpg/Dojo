/** Diamond-only collection. Legacy skins and ownership remain unchanged. */
export const EPIC_SKINS = [
 {id:'skin-ember-knight',name:'Ember Knight',gems:20,color:'#ce542c',accent:'#ffd27a',motif:'flame',detail:'Flame-forged faceguard and a blazing chest sigil.'},
 {id:'skin-frost-warden',name:'Frost Warden',gems:50,color:'#287b9b',accent:'#c0f5ff',motif:'ice',detail:'Crystal crown, frost mask and an ice-star breastplate.'},
 {id:'skin-thunder-ronin',name:'Thunder Ronin',gems:100,color:'#42316e',accent:'#fce36e',motif:'bolt',detail:'Lightning-crested helmet and a thunderbolt chest seal.'},
 {id:'skin-jade-dragon',name:'Jade Dragon',gems:200,color:'#216149',accent:'#99f2ba',motif:'dragon',detail:'Swept dragon horns, jade visor and a coiled dragon crest.'},
 {id:'skin-solar-phoenix',name:'Solar Phoenix',gems:350,color:'#9a3b29',accent:'#ffdf70',motif:'phoenix',detail:'A winged sun crown and a rising phoenix breastplate.'},
 {id:'skin-void-emperor',name:'Void Emperor',gems:500,color:'#33284f',accent:'#d1acff',motif:'void',detail:'An eclipse diadem, star mask and an orbital void seal.'},
 {id:'skin-celestial-sovereign',name:'Celestial Sovereign',gems:650,color:'#274a70',accent:'#fff0ab',motif:'crown',detail:'Seven-point celestial crown, diamond visor and a radiant star crest.'},
] as const;
export type EpicSkin = typeof EPIC_SKINS[number];
export const epicSkin = (id?:string) => EPIC_SKINS.find(s=>s.id===id);
