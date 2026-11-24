/** Playful companions inspired by Chinese folklore, not literal historical reconstructions. */
export const FRIENDS = [
 {id:'carp',name:'Dragon-Gate Carp',wins:3,kind:'fish',color:'#ef9950',accent:'#ffe6aa',lore:'A brave little carp inspired by the Dragon Gate transformation tale.'},
 {id:'bixi',name:'Little Bixi',wins:8,kind:'turtle',color:'#6db99b',accent:'#dcf4bd',lore:'A patient turtle-dragon friend with a sturdy little shell.'},
 {id:'suanni',name:'Little Suanni',wins:15,kind:'lion',color:'#da9a59',accent:'#ffe5ac',lore:'A lion-like dragon child with a fluffy smoke-shaped mane.'},
 {id:'xiezhi',name:'Little Xiezhi',wins:25,kind:'goat',color:'#657c9c',accent:'#e6ebff',lore:'A single-horned friend inspired by the legendary symbol of justice.'},
 {id:'qilin',name:'Little Qilin',wins:40,kind:'deer',color:'#60bcae',accent:'#ffe3a1',lore:'A gentle, antlered companion with jade-like scales.'},
 {id:'fox',name:'Nine-Tailed Fox',wins:60,kind:'fox',color:'#e9bbdf',accent:'#fff0de',lore:'A clever fox spirit with nine soft, fan-shaped tails.'},
 {id:'fenghuang',name:'Little Fenghuang',wins:85,kind:'bird',color:'#ed8360',accent:'#ffe39c',lore:'A colorful feathered friend inspired by the bird of harmony.'},
 {id:'yazi',name:'Little Yazi',wins:110,kind:'cat',color:'#cc8e64',accent:'#fff0b0',lore:'A brave dragon child reimagined as a friendly, striped little guardian.'},
 {id:'taotie',name:'Little Taotie',wins:140,kind:'mask',color:'#6db8ae',accent:'#f5d49a',lore:'A playful bronze-mask-inspired companion; a reminder not to be greedy.'},
 {id:'black-dragon',name:'Black River Dragon',wins:175,kind:'dragon',color:'#63718b',accent:'#d7e9ff',lore:'One of four river-dragon friends inspired by the Four Dragons tale.'},
 {id:'yellow-dragon',name:'Yellow River Dragon',wins:210,kind:'dragon',color:'#e8b644',accent:'#fff0b2',lore:'A golden river-dragon friend who loves sharing rain.'},
 {id:'pearl-dragon',name:'Pearl River Dragon',wins:250,kind:'dragon',color:'#c7b3dd',accent:'#fff1f7',lore:'A pearl-colored river-dragon friend with a shining little crest.'},
 {id:'azure-dragon',name:'Azure River Dragon',wins:300,kind:'dragon',color:'#4badd0',accent:'#bdf8ec',lore:'An azure river-dragon friend inspired by stories of generous rain-bringers.'},
 {id:'zhulong',name:'Little Zhulong',wins:365,kind:'torch',color:'#cf665f',accent:'#ffe7b5',lore:'A red, serpent-shaped friend inspired by the Torch Dragon and stories of day and night.'},
] as const;
export const friendIds=FRIENDS.map(f=>f.id);
export type Friend=typeof FRIENDS[number];
export function friendsAtWins(wins:number){return FRIENDS.filter(f=>wins>=f.wins).map(f=>f.id);}
