const fs=require('fs');const SR=44100,D=80.5,N=Math.round(SR*D);
function wav(file,L,R){const b=Buffer.alloc(44+N*4);b.write('RIFF',0);b.writeUInt32LE(36+N*4,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(N*4,40);
 for(let i=0;i<N;i++){b.writeInt16LE(Math.max(-32767,Math.min(32767,L[i]*32767|0)),44+i*4);b.writeInt16LE(Math.max(-32767,Math.min(32767,R[i]*32767|0)),46+i*4)}fs.writeFileSync(file,b)}
// music
const mL=new Float32Array(N),mR=new Float32Array(N);
const hz=m=>440*Math.pow(2,(m-69)/12);
const chords=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]; // Am F C G
const bar=4.0;
for(let i=0;i<N;i++){const t=i/SR;const ci=Math.floor(t/bar)%4,ph=(t%bar)/bar;const prev=chords[(ci+3)%4],ch=chords[ci];
 const xf=Math.min(1,ph*8);let s=0;
 for(let k=0;k<4;k++){const f1=hz(ch[k]),f0=hz(prev[k]);const a=0.5+0.5*Math.sin(2*Math.PI*0.13*t+k);
  s+=xf*(Math.sin(2*Math.PI*f1*t)+0.3*Math.sin(2*Math.PI*f1*2.003*t))*0.06*a+(1-xf)*(Math.sin(2*Math.PI*f0*t))*0.06*a}
 const bass=hz(ch[0]-24);s+=0.12*Math.sin(2*Math.PI*bass*t)*(0.6+0.4*Math.sin(2*Math.PI*t/bar*2));
 // soft pulse each half-beat
 const beat=0.5,bp=(t%beat);s+=0.10*Math.sin(2*Math.PI*55*bp)*Math.exp(-bp*18)*(t>9.3?1:0.4);
 // tick hi
 const tp=((t+0.25)%0.5);s+=0.015*(Math.random()*2-1)*Math.exp(-tp*60)*(t>9.3?1:0);
 const env=Math.min(1,t/2)*Math.min(1,(D-t)/2.5);mL[i]=s*env*(1+0.15*Math.sin(t*0.7));mR[i]=s*env*(1-0.15*Math.sin(t*0.7))}
wav(process.argv[2]+'/music.wav',mL,mR);
// sfx
const sL=new Float32Array(N),sR=new Float32Array(N);
function whoosh(t0,len=0.9,g=0.5){let lp=0,lp2=0;const st=Math.round(t0*SR);for(let j=0;j<len*SR;j++){const u=j/(len*SR);const cut=0.02+0.25*Math.sin(Math.PI*u);const n=Math.random()*2-1;lp+=cut*(n-lp);lp2+=cut*(lp-lp2);const e=Math.sin(Math.PI*u)**2*g;const i=st+j;if(i<N){sL[i]+=lp2*e*(1.5-u);sR[i]+=lp2*e*(0.5+u)}}}
function pop(t0,f=900,g=0.35){const st=Math.round(t0*SR);for(let j=0;j<0.25*SR;j++){const u=j/SR;const fr=f*(1-0.5*Math.min(1,u*8));const v=Math.sin(2*Math.PI*fr*u)*Math.exp(-u*22)*g;const i=st+j;if(i<N){sL[i]+=v;sR[i]+=v}}}
function boom(t0,g=0.6){const st=Math.round(t0*SR);for(let j=0;j<1.2*SR;j++){const u=j/SR;const v=Math.sin(2*Math.PI*(45+40*Math.exp(-u*8))*u)*Math.exp(-u*3)*g;const i=st+j;if(i<N){sL[i]+=v;sR[i]+=v}}}
[0.1,9.0,15.9,31.2,35.0,45.6,51.3,61.6,66.6,71.2].forEach(t=>whoosh(t));
[[7.45,700],[9.9,500],[14.1,900],[28.5,800],[31.8,500],[47.2,700],[59.7,600],[65.2,900],[77.8,700],[78.05,760],[78.3,820]].forEach(p=>pop(p[0],p[1]));
[ [4.4], [56.1], [68.6] ].forEach(b=>boom(b[0]));
wav(process.argv[2]+'/sfx.wav',sL,sR);
