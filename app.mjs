import {OPS,PUZZLES,initial,validBoard,evaluate,truth,solved,removeGate,exportBoard,importBoard} from './model.mjs';
const $=id=>document.getElementById(id), history=[];let state=initial();
try{const saved=localStorage.getItem('signal-steps-v1');if(saved)state=importBoard(saved);}catch{$('storage-notice').hidden=false;$('storage-notice').textContent='The saved board could not be restored. This board still works; use Save board under How the rules work to keep a copy.';}
function options(values,current){return values.map(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;o.selected=value===current;return o;});}
function sources(count){return [['A','A'],['B','B'],...Array.from({length:count},(_,i)=>[String(i+1),`Rule ${i+1}`])];}
function remember(){try{localStorage.setItem('signal-steps-v1',exportBoard(state));$('storage-notice').hidden=true;}catch{$('storage-notice').hidden=false;$('storage-notice').textContent='This browser cannot save your board. Keep this tab open or use Save board under How the rules work.';}}
function change(fn,rebuild=true){history.push(structuredClone(state));if(history.length>40)history.shift();fn();remember();render(rebuild);}
function render(rebuild=true){
  const result=evaluate(state),done=solved(state),rows=truth(state),p=PUZZLES[state.puzzle];
  $('chapter').textContent=state.sandbox?'YOUR OWN CIRCUIT':`PUZZLE ${state.puzzle+1} / ${PUZZLES.length}`;
  $('goal-title').textContent=state.sandbox?'What will you make?':p.name;$('goal-copy').textContent=state.sandbox?'Connect up to four rules. Toggle the switches and watch the answer travel.':p.hint;
  for(const name of ['a','b']){$(`switch-${name}`).setAttribute('aria-pressed',String(state[name]));$(`switch-${name}`).querySelector('strong').textContent=state[name]?'On':'Off';}
  if(rebuild){
    $('gates').replaceChildren(...state.gates.map((gate,i)=>{
      const el=document.createElement('div');el.className='gate';
      const head=document.createElement('div');head.className='gate-head';const title=document.createElement('strong');title.textContent=`Rule ${i+1}`;const signal=document.createElement('span');signal.id=`signal-${i}`;signal.className='signal';head.append(title,signal);el.append(head);
      const fields=document.createElement('div');fields.className='fields';
      for(const [key,label,list] of [['left','First',sources(i)],['op','Rule',Object.entries(OPS)],['right','Second',sources(i)]]){
        const wrap=document.createElement('label');wrap.textContent=label;const select=document.createElement('select');select.id=`gate-${i}-${key}`;select.setAttribute('aria-label',`Rule ${i+1} ${label.toLowerCase()}`);select.replaceChildren(...options(list,gate[key]));select.disabled=key==='right'&&gate.op==='not';
        select.addEventListener('change',()=>{change(()=>{state.gates[i][key]=select.value;},false);});wrap.append(select);fields.append(wrap);
      }el.append(fields);return el;
    }));
    $('output').replaceChildren(...options(sources(state.gates.length),state.output));
  }
  state.gates.forEach((gate,i)=>{$(`signal-${i}`).textContent=result.signals[String(i+1)]?'● On':'○ Off';$(`signal-${i}`).classList.toggle('on',result.signals[String(i+1)]);$(`gate-${i}-right`).disabled=gate.op==='not';});
  $('lamp').classList.toggle('on',result.output);$('lamp').setAttribute('aria-label',`Lamp ${result.output?'on':'off'}`);$('lamp-text').textContent=result.output?'On':'Off';
  $('target-heading').textContent=state.sandbox?'Pair':'Goal';
  $('table-help').textContent=state.sandbox?'Try each switch pair. These four rows show everything your circuit can do.':'Try each switch pair. Your rules must match all four rows.';
  $('truth').replaceChildren(...rows.map((row,i)=>{const tr=document.createElement('tr');[row.a?'On':'Off',row.b?'On':'Off',row.on?'● On':'○ Off',state.sandbox?`${i+1}/4`:`${p.goal[i]?'● On':'○ Off'} ${row.on===p.goal[i]?'✓':'≠'}`].forEach((v,j)=>{const td=document.createElement('td');td.textContent=v;if(j===3&&!state.sandbox)td.className=row.on===p.goal[i]?'match':'miss';tr.append(td);});return tr;}));
  const matched=rows.filter((row,i)=>row.on===p.goal[i]).length;
  $('feedback').textContent=state.sandbox?'Every switch combination is shown above. Save a board to keep your idea.':done?state.puzzle===PUZZLES.length-1?'Final puzzle solved. Explore freely to build your own rules.':'It works! All four combinations match.':`${matched} of 4 combinations match. Adjust a rule to change the lamp.`;
  $('next').hidden=!done||state.puzzle===PUZZLES.length-1;$('undo').disabled=!history.length;$('add').disabled=state.gates.length===4;$('remove').disabled=state.gates.length===1;$('sandbox').setAttribute('aria-pressed',String(state.sandbox));$('sandbox').textContent=state.sandbox?'Back to puzzles':'Explore freely';
}
for(const key of ['a','b'])$(`switch-${key}`).onclick=()=>change(()=>state[key]=!state[key],false);
$('output').onchange=()=>change(()=>state.output=$('output').value,false);
$('add').onclick=()=>{change(()=>{state.gates.push({op:'not',left:String(state.gates.length),right:'B'});state.output=String(state.gates.length);});$(`gate-${state.gates.length-1}-op`).focus();};
$('remove').onclick=()=>{change(()=>state=removeGate(state));$('add').focus();};
$('undo').onclick=()=>{if(history.length){state=history.pop();remember();render();if($('undo').disabled)$('switch-a').focus();}};
$('reset').onclick=()=>change(()=>{state={...initial(),puzzle:state.puzzle,sandbox:state.sandbox};});
$('next').onclick=()=>{change(()=>{state={...initial(),puzzle:state.puzzle+1};});$('gate-0-op').focus();};
$('sandbox').onclick=()=>change(()=>state.sandbox=!state.sandbox);
$('save').onclick=()=>{const url=URL.createObjectURL(new Blob([exportBoard(state)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='signal-steps.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('open').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>16000)throw Error('This board is too large.');const imported=importBoard(await f.text());change(()=>state=imported);$('feedback').textContent='Board opened. Undo returns to your previous board.';}catch(error){$('feedback').textContent=`Could not open board: ${error.message}`;}e.target.value='';};
render();
