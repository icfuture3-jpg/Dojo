// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {FRIENDS} from './friends';
import {Fighter,GameHud} from './hud';
import {parseProfile} from './economy';
import {DojoMovie,CutScene,RescueMovie} from './movie';
import {CutsceneFriend} from './cutscene-friend';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();});

it('renders only the selected friend as an independent animated background character in every player movie type',()=>{
 for(const companion of FRIENDS){
  const me={companion,avatar:<Fighter color="#2471a3" belt="#fff" move={null} state="idle"/>,color:'#2471a3',belt:'#fff',skin:'#e8c39e',hair:'',fem:false};
  const scenes=[<DojoMovie me={me} dojo={0} color="#c00" belt="#fff" onDone={()=>{}}/>,
   ...(['win','lose','champion'] as const).map(kind=><CutScene me={me} kind={kind} dojo={0} color="#c00" belt="#fff" onDone={()=>{}}/>),
   ...(['intro','win','lose'] as const).map(kind=><RescueMovie me={me} kind={kind} k={0} color="#c00" belt="#fff" onDone={()=>{}}/>)];
  for(const scene of scenes){
   const html=renderToStaticMarkup(scene);
   expect(html.match(/class="cutscene-friend-background"/g)).toHaveLength(1);
   expect(html.match(/data-friend="/g)).toHaveLength(1);
   expect(html).toContain(`data-friend="${companion.id}"`);
   expect(html).toContain('data-animated="true"');
   expect(html).not.toContain('data-ability=');
   expect(html).not.toContain('fighter-companion');
  }
 }
 expect(renderToStaticMarkup(<CutsceneFriend/>)).toBe('');
});

it('keeps equipped friends out of menus, customization and fights, but shows them in player cutscenes',async()=>{
 const p=parseProfile({diamondWins:60,companion:'fox',coins:777}),dispatch=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 const render=async(profile=p)=>{await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(profile)} boardData="[]" boardId="local"/>));};
 const click=async(label:string)=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(label));expect(button,label).toBeDefined();await act(()=>button!.click());await act(async()=>{await vi.dynamicImportSettled();});};
 await render();expect(document.querySelector('[data-friend]')).toBeNull();
 await click('CREATE');expect(document.querySelector('.creator-model [data-friend]')).toBeNull();await click('BACK');
 await click('ENTER THE DOJO');
 expect(document.querySelector('.cinematic-movie .cutscene-friend-background [data-friend="fox"]')).not.toBeNull();
 await render(parseProfile({...p,companion:''}));expect(document.querySelector('.cutscene-friend-background')).toBeNull();
 await render(p);expect(document.querySelector('.cutscene-friend-background [data-friend="fox"]')).not.toBeNull();
 await click('SKIP');expect(document.querySelector('.duel-fighters [data-friend]')).toBeNull();
 expect(dispatch).not.toHaveBeenCalled();
});
