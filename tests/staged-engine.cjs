const assert=require('node:assert/strict'),S=require('../staged-engine.js');let checks=0;
const near=(x,y,label)=>{assert.ok(Math.abs(x-y)<=1e-9*Math.max(1,Math.abs(y)),`${label}: ${x} != ${y}`);checks++;};
let d=S.defaults('wall');d.rho=2000;d.members.panel={...d.members.panel,h:2,E:100000,Fb:100,Fv:10};d.members.small={...d.members.small,b:4,h:5,E:100000,Fb:100,Fv:20};d.members.primary={...d.members.primary,b:10,h:10,E:100000,Fb:100,Fv:20};d.tie={area:.5,capacity:1000,Ft:2000,basis:'capacity'};d.stages[0].H1=20;
let r=S.calculate(d);assert.deepEqual(r.errors,[]);let a=r.stages[0],p=a.rows[0],s=a.rows[1],w=a.rows[2];
for(const [x,y,n] of [[a.p,.6,'bottom pressure'],[r.stages[1].p,.4,'second pressure'],[r.stages[2].p,.2,'third pressure'],[p.M,30,'panel M'],[p.V,6,'panel V'],[p.fb,45,'panel stress'],[p.fv,4.5,'panel shear'],[p.delta,.01875,'panel deflection'],[s.M,1350,'small M'],[s.fb,81,'small bending'],[s.fv,13.5,'small shear'],[s.delta,.030375,'small delta'],[w.M,3600,'primary M'],[w.fb,21.6,'primary bending'],[w.fv,5.4,'primary shear'],[w.delta,.0072,'primary delta'],[a.tie.T,720,'full tie area'],[a.tie.ft,1440,'tie stress'],[a.tie.ratio,.72,'tie ratio']])near(x,y,n);
assert.equal(r.interfaces.length,2);checks++;near(r.interfaces[0].p,.6,'boundary lower pressure');near(r.interfaces[0].spacing.H1,30,'boundary max H1');near(r.interfaces[0].spacing.H4,50,'boundary max H4');
// Independent upper-triangle integral for hydrostatic resultant, per 1 cm strip.
near((S.pressureAt(d,0)+S.pressureAt(d,300))*300/2,90,'hydrostatic resultant');
let b=S.defaults('beam');let br=S.calculate(b);near(S.sideHeight(b),130,'beam clear side height');near(S.pressureAt(b,130),.046,'slab head at beam side top');assert.ok(br.stages.every(s=>s.rows.every(m=>m.key!=='small')));checks++;near(br.stages[0].rows[1].w,.345*15,'beam horizontal waler tributary');near(br.stages[0].rows[2].w,.345*30,'beam vertical waler tributary');near(br.stages[0].tie.T,414,'beam tie full tributary');
d.layers='two';d.stages.forEach(s=>{s.B4=60;s.H3=s.H4;});r=S.calculate(d);near(r.stages[0].rows.at(-1).L,60,'secondary horizontal span');near(r.stages[0].rows.at(-1).w,24,'secondary tributary');near(r.stages[0].tie.T,1440,'independent B4');
d.pressure='capped';d.cap=.414;d.pressureSource='核定依據測試';near(S.pressureAt(d,0),.414,'pressure cap');near(S.pressureAt(d,200),.2,'uncapped upper head');d.pressure='manual';d.manual=.25;near(S.pressureAt(d,300),.25,'uniform manual');
for(const mutate of [x=>x.stages[1].top=50,x=>x.members.panel.E=0,x=>x.stages[0].H1=NaN,x=>x.tie.area=0,x=>x.k=.5,x=>x.stages[0].H3=77,x=>x.stages[0].top=1e200]){let x=S.defaults('wall');mutate(x);assert.ok(S.calculate(x).errors.length);checks++;}
let x=S.defaults('wall');x.pressure='manual';assert.ok(S.calculate(x).errors.length);checks++;
x=S.defaults('wall');x.tie.capacity=828;x.rho=2300;const equality=S.calculate(x).stages[0].tie;near(equality.ratio,1,'tie equality');assert.equal(equality.pass,false);checks++;
for(const mode of ['wall','column','beam']){const c=S.defaults(mode);for(const factor of [.5,1,2]){c.rho=2300*factor;assert.deepEqual(S.calculate(c).errors,[]);checks++;}}
// JASS 5 (2022): Ps = W0 h. Independent SI / kgf conversions and method attribution.
for(const mode of ['wall','column','beam']){const c=S.defaults(mode);assert.equal(c.pressure,'jass5-2022');checks++;assert.equal(S.calculate(c).pressureBasis.jass,true);checks++;}
x=S.defaults('wall');const t=S.pressureTrace(x,100);
near(t.headM,2,'JASS head');near(t.unitWeightKN,22.555295,'JASS unit weight kN/m3');near(t.baseKPa,45.11059,'JASS pressure kPa');near(t.base,.46,'JASS pressure kgf/cm2');near(S.pressureAt(x,0),.69,'JASS 3m bottom');
x.k=1.25;near(S.pressureTrace(x,100).base,.46,'project coefficient separate from JASS');near(S.pressureAt(x,100),.575,'project additional coefficient');
x.pressure='capped';x.pressureSource='核定設計';assert.equal(S.calculate(x).pressureBasis.jass,false);checks++;
x.pressure='manual';assert.equal(S.calculate(x).pressureBasis.jass,false);checks++;
x.pressure='hydro';x.version=1;S.normalize(x);assert.equal(x.pressure,'jass5-2022');checks++;near(S.pressureAt(x,100),.575,'saved hydro retains calculation');
const bt=S.pressureTrace(S.defaults('beam'),130);near(bt.headM,.2,'JASS beam slab head');near(bt.baseKPa,4.511059,'JASS beam upper-side pressure');
console.log(checks+' staged engineering checks passed');
