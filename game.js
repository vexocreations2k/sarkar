const $ = id => document.getElementById(id);
const BEST = "sarkar-infinite-best";

// t = treasury, p = public trust, e = economy, o = law and order
const NAMES = {t:"Treasury", p:"Public trust", e:"Economy", o:"Law and order"};
const EVENTS = [
  {title:"Farmers' protest", text:"Farmers are protesting low crop prices outside the secretariat.",
   c:[["Raise support prices",{t:-12,p:+10}],["Offer talks only",{p:-4,o:+2}],["Send police to clear the road",{p:-12,o:+6}]]},
  {title:"Water shortage", text:"A long dry spell is hurting several districts.",
   c:[["Fund new pipelines",{t:-15,p:+8,e:+3}],["Truck in tanker water",{t:-6,p:+3}],["Ask people to save water",{p:-5}]]},
  {title:"Factory investment", text:"A big company wants to build a plant in your state.",
   c:[["Give tax breaks",{t:-8,e:+12,p:+3}],["Ask for fair terms",{e:+5,t:+4}],["Turn it down",{e:-6,p:+2}]]},
  {title:"Bus fare hike request", text:"The transport department says it is losing money.",
   c:[["Raise fares",{t:+10,p:-9}],["Pay a subsidy",{t:-10,p:+6}],["Reform the department",{t:-3,e:+4,p:-2}]]},
  {title:"Cyclone warning", text:"A cyclone is expected on the coast in two days.",
   c:[["Evacuate and set up shelters",{t:-12,p:+10,o:+3}],["Alert only the worst areas",{t:-4,p:-2}],["Wait and see",{p:-14,o:-6}]]},
  {title:"Teachers' strike", text:"Teachers demand better pay and have stopped classes.",
   c:[["Grant the pay rise",{t:-10,p:+8}],["Negotiate a smaller raise",{t:-4,p:+2}],["Threaten action",{p:-10,o:+3}]]},
  {title:"Corruption scandal", text:"A newspaper reports that an officer in your department took bribes.",
   c:[["Suspend and investigate",{p:+8,o:+3}],["Quietly move the officer",{p:-8,t:-2}],["Call the report false",{p:-14}]]},
  {title:"Festival season", text:"A major festival is coming. Crowds and traffic will be huge.",
   c:[["Fund safety and lights",{t:-7,p:+6,o:+4}],["Add extra police",{t:-3,o:+6}],["Do nothing special",{p:-3,o:-5}]]},
  {title:"IT park proposal", text:"Planners suggest a new technology park near the city.",
   c:[["Build it fully",{t:-15,e:+14}],["Start small",{t:-6,e:+6}],["Skip it",{e:-4,t:+3}]]},
  {title:"Hospital crowding", text:"Government hospitals are packed and patients are waiting for hours.",
   c:[["Open more wards",{t:-12,p:+9}],["Hire contract doctors",{t:-5,p:+4}],["Ignore for now",{p:-9}]]},
  {title:"Gang violence", text:"Two groups are fighting in a growing town.",
   c:[["Strong police action",{o:+10,p:-4,t:-3}],["Youth jobs program",{t:-9,o:+5,p:+5}],["Ask for outside help",{o:+3,p:-3}]]},
  {title:"Road repair", text:"Monsoon damage has left roads full of potholes.",
   c:[["Repair everything",{t:-13,p:+8,e:+3}],["Repair main roads only",{t:-6,p:+3}],["Delay until next budget",{p:-7,e:-3}]]},
  {title:"Central grant", text:"The central government offers a grant if you sign new conditions.",
   c:[["Accept it",{t:+15,p:-4}],["Bargain for better terms",{t:+8,p:+2}],["Reject it",{p:+4,t:-3}]]},
  {title:"Power cuts", text:"Heat waves are causing long power cuts.",
   c:[["Buy power at high cost",{t:-12,p:+7,e:+3}],["Ration power by area",{p:-6,e:-3}],["Promote solar panels",{t:-7,e:+5,p:+3}]]},
  {title:"Opposition rally", text:"The opposition plans a huge rally in the capital.",
   c:[["Allow it peacefully",{p:+6,o:-3}],["Limit the route",{p:-3,o:+3}],["Ban it",{p:-12,o:+5}]]},
  {title:"Tourism boom", text:"Tourists are arriving in record numbers.",
   c:[["Invest in facilities",{t:-8,e:+10,p:+3}],["Tax tourists a little",{t:+10,e:-3}],["Leave it as is",{e:+3}]]}
];

let S, last = -1;
const clamp = v => Math.max(0, Math.min(100, v));
const fresh = () => ({t:60, p:60, e:50, o:60, month:1, term:1, ev:null, msg:""});
const best = () => { try { return +localStorage.getItem(BEST) || 0; } catch(e){ return 0; } };
const score = () => (S.term-1)*12 + S.month;

function nextEvent(){
  let i; do { i = Math.floor(Math.random()*EVENTS.length); } while (i === last);
  last = i; S.ev = EVENTS[i];
}
function apply(fx){
  const parts = [];
  for (const k in fx){
    S[k] = clamp(S[k] + fx[k]);
    parts.push('<span class="'+(fx[k]>0?"up":"down")+'">'+NAMES[k]+' '+(fx[k]>0?"+":"")+fx[k]+'</span>');
  }
  return parts.join(", ");
}
function choose(n){
  const fx = S.ev.c[n][1];
  let note = apply(fx);
  // Monthly drift: a strong economy fills the treasury, a weak one drains it
  const drift = Math.round((S.e - 50)/8);
  S.t = clamp(S.t + drift + 2);
  S.msg = note + (drift ? ' | Monthly budget ' + (drift+2>0?"+":"") + (drift+2) : "");
  S.month++;

  if (S.p <= 0)  return over("The people lost all trust in you and forced you out.");
  if (S.o <= 0)  return over("Law and order collapsed. The governor dismissed your government.");
  if (S.t <= 0)  return over("The treasury is empty. You can no longer pay salaries.");

  if (S.month > 12){
    if (S.p >= 50){
      S.term++; S.month = 1;
      S.msg = "You WON the election! Starting term " + S.term + ". Trust resets to a fresh mandate.";
      S.p = clamp(S.p + 10);
    } else {
      return over("You lost the election with only " + S.p + " public trust (you needed 50).");
    }
  }
  nextEvent(); render();
}
function over(why){
  const sc = score() - 1, b = Math.max(best(), sc);
  try { localStorage.setItem(BEST, b); } catch(e){}
  $("card").hidden = true; $("over").hidden = false;
  $("why").textContent = why;
  $("final").textContent = "You lasted " + sc + " months across " + S.term + " term" + (S.term>1?"s":"") + ". Best run: " + b + " months.";
}
function render(){
  $("term").textContent = "Term " + S.term;
  $("month").textContent = "Month " + S.month + " of 12";
  $("score").textContent = "Months: " + (score()-1);
  $("stats").innerHTML = ["t","p","e","o"].map(k =>
    '<div class="st"><div class="row"><span>'+NAMES[k]+'</span><b>'+S[k]+'</b></div><div class="track"><div class="fill'+(S[k]<25?" lowbar":"")+'" style="width:'+S[k]+'%"></div></div></div>').join("");
  $("title").textContent = S.ev.title;
  $("text").textContent = S.ev.text;
  $("choices").innerHTML = S.ev.c.map((c,i) => '<button type="button" class="ch" data-i="'+i+'">'+c[0]+'</button>').join("");
  document.querySelectorAll(".ch").forEach(b => b.onclick = () => choose(+b.dataset.i));
  $("last").innerHTML = S.msg;
}
function start(){ S = fresh(); $("over").hidden = true; $("card").hidden = false; nextEvent(); render(); }
$("again").onclick = start;
start();
