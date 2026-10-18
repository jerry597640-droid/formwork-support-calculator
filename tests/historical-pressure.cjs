const assert=require('node:assert/strict'),S=require('../staged-engine.js');let checks=0;
const near=(a,b,label)=>{assert.ok(Math.abs(a-b)<1e-10,`${label}: ${a} != ${b}`);checks++;};
function config(mode,R,length=300){const d=S.defaults(mode);Object.assign(d,{pressure:S.HISTORICAL.id,R,wallLength:length});return d;}
// Independent numeric values read from the verified historical table; density 2350 kg/m3.
for(const [mode,R,length,z,p] of [
 ['column',10,300,0,.564],['column',10.0001,300,0,.658],['column',20,300,0,.658],['column',20.0001,300,0,.705],
 ['wall',10,300,0,.423],['wall',10,300.0001,0,.3525],['wall',10.0001,300,0,.564],['wall',20,301,0,.47],['wall',20.0001,301,0,.705],
 ['wall',10,300,100,.376],['column',10,300,100,.423],['wall',10,301,100,.3525],['wall',20,300,100,.47],
 ['wall',10,300,150,.3525],['column',10,300,150,.3525],['wall',10,301,150,.3525],
 ['wall',20,300,200,.235],['column',20,300,200,.235],['wall',10,301,200,.235],['wall',10,300,300,0]
])near(S.pressureAt(config(mode,R,length),z),p,[mode,R,length,z].join('/'));
for(const [mode,R,length,p] of [['column',10,300,.705],['column',20,300,.846],['wall',10,300,.47],['wall',20,300,.658],['wall',10,301,.3525],['wall',20,301,.47]]){const d=config(mode,R,length);d.total=400;S.normalize(d);assert.deepEqual(S.calculate(d).errors,[]);checks++;near(S.pressureAt(d,0),p,'4m scope');}
let d=config('wall',1.5),r=S.calculate(d);assert.equal(r.pressureBasis.historical,true);checks++;assert.equal(r.pressureBasis.current,false);checks++;
near(r.stages[0].pressureTrace.referenceRatio,.6,'bottom derived ratio');near(r.stages[1].pressureTrace.referenceRatio,.8,'mid-depth derived ratio');near(r.stages[2].pressureTrace.referenceRatio,1,'upper hydro ratio');
assert.deepEqual(S.pressureBreakpoints(d),[150]);checks++;d.R=20;assert.deepEqual(S.pressureBreakpoints(d),[100]);checks++;d.R=20.1;assert.deepEqual(S.pressureBreakpoints(d),[]);checks++;
d=config('wall',1.5);d.k=1.25;near(S.pressureAt(d,0),.52875,'engineering factor separate');near(S.pressureTrace(d,0).base,.423,'table pressure unchanged by k');
for(const mutate of [x=>x.R=0,x=>x.R=NaN,x=>x.wallLength=0,x=>x.wallLength=NaN,x=>x.total=401,x=>x.mode='beam']){d=config('wall',1.5);mutate(d);S.normalize(d);assert.ok(S.calculate(d).errors.length);checks++;}
d=config('wall',1.5);d.total=300.01;S.normalize(d);near(S.pressureAt(d,0),.4230047,'wall height crosses 3m continuously');d.wallLength=301;near(S.pressureAt(d,0),.3525,'length determines wall branch');
d=S.defaults('wall');d.version=2;delete d.R;delete d.wallLength;S.normalize(d);assert.equal(d.R,1.5);checks++;assert.equal(d.wallLength,300);checks++;assert.equal(d.pressure,'jass5-2022');checks++;
console.log(checks+' historical pressure checks passed');
