export const OPS = {and:'Both',or:'Either',xor:'One only',not:'Opposite'};
export const PUZZLES = [
  {name:'Together',hint:'The lamp lights only when both switches are on.',goal:[false,false,false,true]},
  {name:'One at a time',hint:'One switch lights the lamp. Two switches cancel it.',goal:[false,true,true,false]},
  {name:'Quiet room',hint:'The lamp lights only when both switches are off.',goal:[true,false,false,false]},
  {name:'Permission',hint:'B lights the lamp, but A blocks it.',goal:[false,true,false,false]},
  {name:'Matching',hint:'The lamp lights when the switches agree.',goal:[true,false,false,true]},
  {name:'A has priority',hint:'The lamp stays on unless only A is on.',goal:[true,true,false,true]},
];
export function initial(){return {gates:[{op:'or',left:'A',right:'B'}],output:'1',a:false,b:false,puzzle:0,sandbox:false};}
export function validBoard(input){
  if(!input||!Array.isArray(input.gates)||input.gates.length<1||input.gates.length>4)throw Error('Use one to four rules.');
  const gates=input.gates.map((gate,index)=>{
    const sources=['A','B',...Array.from({length:index},(_,i)=>String(i+1))];
    if(!gate||!Object.hasOwn(OPS,gate.op)||!sources.includes(gate.left)||!sources.includes(gate.right))throw Error('Each rule can only use switches or earlier rules.');
    return {op:gate.op,left:gate.left,right:gate.right};
  });
  if(!['A','B',...gates.map((_,i)=>String(i+1))].includes(input.output))throw Error('Choose a valid lamp source.');
  return {gates,output:input.output,a:input.a===true,b:input.b===true,puzzle:Number.isInteger(input.puzzle)&&input.puzzle>=0&&input.puzzle<PUZZLES.length?input.puzzle:0,sandbox:input.sandbox===true};
}
export function evaluate(board,a=board.a,b=board.b){
  board=validBoard(board); const signals={A:!!a,B:!!b};
  board.gates.forEach((gate,i)=>{
    const l=signals[gate.left],r=signals[gate.right];
    signals[String(i+1)]=gate.op==='and'?l&&r:gate.op==='or'?l||r:gate.op==='xor'?l!==r:!l;
  });
  return {signals,output:signals[board.output]};
}
export function truth(board){return [[false,false],[false,true],[true,false],[true,true]].map(([a,b])=>({a,b,on:evaluate(board,a,b).output}));}
export function solved(board){return !board.sandbox&&truth(board).every((row,i)=>row.on===PUZZLES[board.puzzle].goal[i]);}
export function removeGate(board){
  const next=structuredClone(validBoard(board)); if(next.gates.length===1)return next;
  const removed=String(next.gates.length);next.gates.pop();if(next.output===removed)next.output=String(next.gates.length);return next;
}
export function exportBoard(board){return JSON.stringify({format:'signal-steps-v1',board:validBoard(board)},null,2);}
export function importBoard(text){if(text.length>16000)throw Error('This board is too large.');const data=JSON.parse(text);if(data.format!=='signal-steps-v1')throw Error('Choose a Signal Steps board.');return validBoard(data.board);}
