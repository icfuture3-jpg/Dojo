import {afterEach,expect,it,vi} from 'vitest';
import {createRunId} from './run-id';
afterEach(()=>vi.unstubAllGlobals());
it('retains native UUID generation when supported',()=>{
 const randomUUID=vi.fn(()=> 'native-match-id');vi.stubGlobal('crypto',{randomUUID});
 expect(createRunId()).toBe('native-match-id');expect(randomUUID).toHaveBeenCalledOnce();
});
it('generates distinct UUIDv4 identities without randomUUID',()=>{
 const getRandomValues=crypto.getRandomValues.bind(crypto);vi.stubGlobal('crypto',{getRandomValues});
 const ids=Array.from({length:1000},createRunId);
 expect(new Set(ids).size).toBe(1000);
 for(const id of ids)expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
