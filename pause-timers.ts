export class PauseTimers {
  private tasks=new Map<number,{fn:()=>void;remaining:number;started:number;timer:ReturnType<typeof setTimeout>|null}>();
  private seq=0; private paused=false;
  add(fn:()=>void,ms:number){const id=++this.seq;this.tasks.set(id,{fn,remaining:ms,started:performance.now(),timer:null});if(!this.paused)this.arm(id);return id;}
  private arm(id:number){const task=this.tasks.get(id);if(!task)return;task.started=performance.now();task.timer=setTimeout(()=>{this.tasks.delete(id);task.fn();},Math.max(0,task.remaining));}
  pause(){if(this.paused)return;this.paused=true;for(const task of this.tasks.values()){if(task.timer!==null)clearTimeout(task.timer);task.remaining=Math.max(0,task.remaining-(performance.now()-task.started));task.timer=null;}}
  resume(){if(!this.paused)return;this.paused=false;for(const id of this.tasks.keys())this.arm(id);}
  clear(){for(const t of this.tasks.values())if(t.timer!==null)clearTimeout(t.timer);this.tasks.clear();}
}
