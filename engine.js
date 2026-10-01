/* FormMain.vb _CALCULATE_ENGINE_GO and _DMIN, supplied archive. Units kgf, cm, m. */
(function(root){
const member=(name,b,h,L,E,Fb,Fv,sim=1,shape='rect',A=1,I=1,Z=1)=>({name,b,h,L,E,Fb,Fv,sim,shape,A,I,Z});
function defaults(mode='plate'){
 const d={mode,wd:.84,wi:.2,wl:.2,rho:2400,H:6.1,R:2.1,T:23,pressure:'normal',manualP:5000,def:'both',X:90,Y:90,Lb:100,support:'tube',D:4.85,t:.25,sw:6,sh:6,Fc:28,capacity:32,tieSp:1.25,tieCapacity:1433,confirmed:false,members:[]};
 if(mode==='plate')d.members=[member('模板',100,1.5,.35,70000,140,10),member('角材',4.5,10.5,.9,70000,160,14),member('貫材',4.5,10.5,.9,70000,160,14)];
 else if(mode==='beam'){Object.assign(d,{H:.9,wi:0,wl:.35,X:120,Y:70,Lb:350,tieSp:.7});d.members=[member('側模板',1,1.5,.26,70000,110,10),member('側直材',6,6,.7,70000,110,10),member('底模板',1,1.5,.21,70000,110,10),member('底角材',6,6,.7,70000,110,10),member('底貫材',10,10,1.2,2100000,1500,1000)];}
 else d.members=[member('側模板',1,1.5,.2,50000,110,10),member('直材',6,6,.5,70000,120,14,0),member('橫材',6,6,1.25,2100000,1500,1000,1,'custom',8.64,189,37.8)];
 if(mode==='wall'){Object.assign(d,{H:6.85,R:1.2,T:32,tieSp:.5,tieCapacity:548});d.members[0].L=.3;Object.assign(d.members[2],{L:.5,A:2.71,I:28.3,Z:9.44,sim:0});}
 return d;
}
function lateral(d){const {mode,H,R,T,rho}=d;if(mode==='beam')return rho*H;if(d.pressure==='manual')return d.manualP;if(d.pressure==='hydro')return rho*H;
 if(d.pressure==='normal'){let p=mode==='column'||R<2.1?732+80100*R/(T+17.8):732+117710/(T+17.8)+24920*R/(T+17.8);return Math.min(Math.max(Math.min(p,mode==='column'?14646:9764),2929),rho*H)*rho/2403;}
 if(mode==='column')return rho*(R<10?(H<1.5?H:1.5+.6*(H-1.5)):R<=20?(H<2?H:2+.8*(H-2)):H);
 return rho*(R<10?(H<1.5?H:H<3?1.5+.2*(H-1.5):H<4?1.5:H):R<=20?(H<2?H:H<3?2+.4*(H-2):H<4?2:H):H);
}
function section(m){return m.shape==='custom'?{A:m.A,I:m.I,Z:m.Z}:{A:m.b*m.h,I:m.b*m.h**3/12,Z:m.b*m.h**2/6};}
function analyzeMember(m,w,def){const s=section(m),L=m.L*100,M=w*L*L/(m.sim?8:10),V=w*L/2,delta=w*L**4/(m.E*s.I)*(m.sim?5/384:1/128),fb=M/s.Z,fv=1.5*V/s.A,limit=def==='both'?Math.min(.3,L/240):def==='absolute'?.3:L/240;return {...m,...s,w,M,V,delta,fb,fv,limit,ratios:[fb/m.Fb,fv/m.Fv,delta/limit],ratio:Math.max(fb/m.Fb,fv/m.Fv,delta/limit)};}
function validate(d){let errors=[];const positive=(x,n)=>{if(!Number.isFinite(x)||x<=0)errors.push(n+'須大於 0')};const nonnegative=(x,n)=>{if(!Number.isFinite(x)||x<0)errors.push(n+'不得為空白或負值')};d.members.forEach(m=>{for(const k of ['L','E','Fb','Fv',...(m.shape==='custom'?['A','I','Z']:['b','h'])])positive(m[k],m.name+' '+k)});
 if(['plate','beam'].includes(d.mode)){for(const k of ['wi','wl'])nonnegative(d[k],k);if(d.mode==='plate')nonnegative(d.wd,'WD');for(const k of ['X','Y'])positive(d[k],k);if(d.support==='tube'){for(const k of ['Lb','D','t'])positive(d[k],k);if(d.D<=2*d.t)errors.push('鋼管外徑必須大於 2 倍壁厚')}else if(d.support==='wood'){for(const k of ['Lb','sw','sh','Fc'])positive(d[k],k)}else positive(d.capacity,'支架容許承載力');}
 if(d.mode!=='plate'){for(const k of ['rho','H','tieSp','tieCapacity'])positive(d[k],k);nonnegative(d.R,'澆置速度');if(!Number.isFinite(d.T)||d.T<=-17.8)errors.push('溫度須大於 −17.8°C');if(d.pressure==='manual')positive(d.manualP,'指定側壓');}return errors;
}
function calculate(d){const errors=validate(d);if(errors.length)return {errors};let p=d.mode==='plate'?0:lateral(d),q=d.mode==='plate'?d.wd+d.wi+d.wl:d.mode==='beam'?d.rho*d.H/1000+d.wi+d.wl:0,m=d.members,w;
 if(d.mode==='plate')w=[q*10,q*10*m[0].L,q*10*m[1].L];else if(d.mode==='beam')w=[p/10000,p*m[0].L/100,q/10,q*10*m[2].L,q*10*m[3].L];else w=[p/10000,p*m[0].L/100,p*m[1].L/100];
 let rows=m.map((x,i)=>analyzeMember(x,w[i],d.def)),s=null,tie=null;
 if(d.mode==='plate'||d.mode==='beam'){const P=q*d.X*d.Y/10;let A,I,r,lambda,Cc,Fa,capacity;
 if(d.support==='tube'){const di=d.D-2*d.t;A=Math.PI*(d.D*d.D-di*di)/4;I=Math.PI*(d.D**4-di**4)/64;r=Math.sqrt(I/A);lambda=d.Lb/r;Cc=Math.sqrt(2*Math.PI**2*2100000/2500);const x=lambda/Cc;Fa=lambda>Cc?12*Math.PI**2*2100000/(23*lambda**2):(1-.5*x*x)*2500/(5/3+3*x/8-x**3/8);capacity=Fa*A;}
 else if(d.support==='wood'){A=d.sw*d.sh;I=Math.max(d.sw,d.sh)*Math.min(d.sw,d.sh)**3/12;r=Math.sqrt(I/A);lambda=d.Lb/r;Fa=(lambda<=30?1:lambda<=100?1.3-.01*lambda:3000/lambda**2)*d.Fc;capacity=Fa*A;}else capacity=d.capacity*1000;
 s={P,A,I,r,lambda,Cc,Fa,capacity,ratio:P/capacity,pass:d.support==='wood'?P<=capacity:P<capacity};}
 if(d.mode!=='plate'){const area=d.tieSp*(d.mode==='beam'?m[0].L:m[1].L)/2,force=p*area;tie={area,force,doubleForce:force*2,capacity:d.tieCapacity,ratio:force/d.tieCapacity,doubleRatio:force*2/d.tieCapacity};}
 const ratios=rows.flatMap(r=>r.ratios);if(s)ratios.push(s.ratio);if(tie){ratios.push(tie.ratio);if(d.mode!=='beam')ratios.push(tie.doubleRatio);}return {errors:[],rows,q,p,s,tie,max:Math.max(...ratios),pass:rows.every(r=>r.ratio<1)&&(!s||s.pass)&&(!tie||(tie.ratio<1&&(d.mode==='beam'||tie.doubleRatio<1)))};
}
// Bidirectional dimensions share the same member span and support tributary length.
function setInput(d,key,value){
 const keys=key.split('.');
 if(keys[0]==='m')d.members[Number(keys[1])][keys[2]]=value;else d[key]=value;
 if(d.mode!=='plate'&&d.mode!=='beam')return;
 const offset=d.mode==='beam'?2:0;
 const pairs=[['X',offset+2],['Y',offset+1]];
 for(const [axis,index] of pairs){
  if(key===`m.${index}.L`)d[axis]=Number.isFinite(value)?Number((value*100).toPrecision(12)):NaN;
  if(key===axis)d.members[index].L=Number.isFinite(value)?Number((value/100).toPrecision(12)):NaN;
 }
}
const api={setInput,defaults,lateral,section,analyzeMember,validate,calculate};if(typeof module!=='undefined')module.exports=api;root.Formwork=api;
})(typeof window!=='undefined'?window:globalThis);
