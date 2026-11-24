/** Stylized collectibles: legendary objects are labeled separately from real artifact types. */
export const TREASURES = [
 {id:'flaming-pearl',name:"Dragon’s Flaming Pearl",wins:5,kind:'Legendary treasure',description:'A luminous pearl wreathed in flame, inspired by dragon-and-pearl imagery associated with wisdom and spiritual power.'},
 {id:'monkey-staff',name:'Ruyi Jingu Bang',wins:20,kind:'Legendary treasure',description:'The Monkey King’s magical size-changing staff, claimed from the Dragon King’s palace in Journey to the West.'},
 {id:'jade-suit',name:'Gold-Sewn Jade Burial Suit',wins:45,kind:'Historical artifact type · Han dynasty',description:'A ceremonial funerary suit of jade plaques joined with gold wire. This collectible is not wearable combat armor.'},
 {id:'bronze-mask',name:'Sanxingdui Protruding-Eye Mask',wins:80,kind:'Historical artifact type · Ancient Shu',description:'Inspired by bronze masks with projecting pupils and wing-like ears from Sanxingdui. Their meaning remains debated.'},
 {id:'tiger-tally',name:'Bronze Tiger Tally (Hufu)',wins:125,kind:'Historical artifact type · Military token',description:'A tiger-shaped authorization token split into matching halves, brought together to confirm military authority.'},
 {id:'jade-ruyi',name:'Jade Ruyi Scepter',wins:180,kind:'Historical artifact type · Ceremonial object',description:'A curved, auspicious scepter associated with good fortune and ceremonial authority.'},
] as const;
export type Treasure=typeof TREASURES[number];
