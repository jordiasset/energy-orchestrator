"use client";
import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Cell, PieChart, Pie, ReferenceLine } from "recharts";
import { Zap, Battery, Sun, Plug, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, Settings, RefreshCw, Wifi, Cpu, Thermometer, Activity, ChevronRight, Play, Pause, BarChart3, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, CircleDollarSign, Gauge, PlugZap, SunMedium, Menu, Bell, Layers, MessageCircle, FileText, CloudSun, Cloud, Brain, Target, Lightbulb, ShieldCheck, Heart, Download, MapPin, Eye, Box, Factory, Droplets } from "lucide-react";

const A="#0078D4",AL="#60CDFF",G="#0F7B0F",W="#F7630C",D="#C42B1C",P="#B4A0FF";const HR=new Date().getHours();

// ========== DATA ==========
const omie=Array.from({length:24},(_,h)=>{const b=h<6?.025+Math.random()*.02:h<10?.065+Math.random()*.035:h<14?.045+Math.random()*.025:h<18?.085+Math.random()*.045:h<22?.16+Math.random()*.08:.055+Math.random()*.025;return{hora:`${String(h).padStart(2,"0")}:00`,h,precio:+b.toFixed(4),isPast:h<HR,isCur:h===HR}});
const pvH=Array.from({length:24},(_,h)=>({hora:`${String(h).padStart(2,"0")}:00`,h,pv:+(h>=7&&h<=20?Math.max(0,Math.sin((h-7)/13*Math.PI)*(85+Math.random()*15)):0).toFixed(1)}));
const batH=Array.from({length:24},(_,h)=>{const s=h<6?80+h*3:h<8?95-(h-6)*5:h<14?85+(h-8)*2:h<18?97-(h-14)*8:h<22?65-(h-18)*10:25+(h-22)*5;return{hora:`${String(h).padStart(2,"0")}:00`,h,soc:Math.min(100,Math.max(10,s+Math.random()*5))}});
const pFlow=Array.from({length:24},(_,h)=>{const pv=pvH[h].pv,con=40+Math.random()*30+(h>=8&&h<=18?20:0),bat=h<6?-15:h>=10&&h<=15&&pv>con?-(pv-con)*.6:h>=18?20+Math.random()*15:0,red=Math.max(0,con-pv-Math.max(0,bat));return{hora:`${String(h).padStart(2,"0")}:00`,h,pv:+pv,consumo:+con.toFixed(1),bat:+bat.toFixed(1),red:+red.toFixed(1)}});
const decs=[{h:"00-06h",f:"Red Valle",a:"Cargar bateria",r:"OMIE<0.04",s:"2.40",ic:BatteryCharging,c:A},{h:"07-10h",f:"FV+Red",a:"Autoconsumo",r:"FV creciente",s:"1.80",ic:Sun,c:W},{h:"10-15h",f:"100% FV",a:"FV->Consumo+Bat",r:"FV cubre",s:"8.50",ic:SunMedium,c:G},{h:"15-18h",f:"FV+Bat",a:"Descarga parcial",r:"FV baja OMIE sube",s:"3.20",ic:Battery,c:P},{h:"18-22h",f:"Bateria",a:"Descarga max",r:"Pico 0.22",s:"12.60",ic:Zap,c:D},{h:"22-00h",f:"Red Valle",a:"Precarga",r:"OMIE 0.05",s:"0.90",ic:Plug,c:A}];
const wSav=[{d:"L",v:28.4},{d:"M",v:31.2},{d:"X",v:26.8},{d:"J",v:34.1},{d:"V",v:29.5},{d:"S",v:22.3},{d:"D",v:18.9}];
const pred30=Array.from({length:30},(_,i)=>({dia:`${i+1}`,real:i<20?Math.round(12000+Math.random()*4000):null,pred:Math.round(12500+Math.random()*3500+Math.sin(i*.5)*1500),upper:Math.round(15000+Math.random()*3000),lower:Math.round(10000+Math.random()*2500)}));
const pricePred=Array.from({length:24},(_,h)=>({hora:`${String(h).padStart(2,"0")}:00`,h,real:h<=HR?omie[h].precio:null,pred:omie[h].precio*(.9+Math.random()*.2),upper:omie[h].precio*1.25,lower:omie[h].precio*.75}));
const anomalies=[
  {fecha:"25/03",tipo:"Consumo nocturno",desc:"02h-05h +34% vs media. Equipo no apagado linea 3",imp:"+420/mes",conf:96,sev:"alta",acc:"Revisar apagado auto linea 3"},
  {fecha:"24/03",tipo:"Pico anomalo",desc:"890kW a 03:15 sin actividad. Duracion 12min",imp:"+180/mes",conf:91,sev:"alta",acc:"Inspeccionar arrancador compresor"},
  {fecha:"22/03",tipo:"Deriva termica",desc:"Camara 1 +42% tiempo estabilizacion. 18 dias tendencia",imp:"+95/mes",conf:88,sev:"media",acc:"Revisar gas y juntas puerta"},
  {fecha:"20/03",tipo:"Cos phi bajo",desc:"<0.88 entre 09-14h. Tendencia 3 semanas",imp:"+65/mes",conf:85,sev:"media",acc:"Ampliar condensadores cuadro ppal"},
  {fecha:"18/03",tipo:"FV underperform",desc:"Produccion -15% vs prevision meteo",imp:"+110/mes",conf:82,sev:"baja",acc:"Limpieza paneles + revision strings"},
];
const aiRecs=[
  {ic:Clock,t:"Desplazar 30% carga a Valle",d:"Linea empaquetado de 10-14h a 00-06h",s:"1,240",dif:"Media",prob:92,pay:"0 meses"},
  {ic:Gauge,t:"Reducir potencia P3-P6",d:"Max real 618kW de 850kW. Optimo: 680kW",s:"380",dif:"Facil",prob:98,pay:"Inmediato"},
  {ic:Thermometer,t:"Subir setpoint camara 1",d:"De 2.8C a 4.0C. -18% ciclos compresor",s:"145",dif:"Facil",prob:89,pay:"0 meses"},
  {ic:SunMedium,t:"Ampliar FV +25kWp",d:"Autoconsumo de 62% a 78%",s:"320",dif:"Inversion",prob:87,pay:"28 meses"},
  {ic:Battery,t:"2a bateria 5kWh",d:"Spread 0.14/kWh. +35kWh arbitraje/dia",s:"210",dif:"Inversion",prob:84,pay:"32 meses"},
  {ic:RefreshCw,t:"Sustituir motor bomba",d:"Consumo +22% en 6m por rodamientos",s:"95",dif:"Tecnica",prob:79,pay:"8 meses"},
];
const forecast=[{d:"Hoy",ic:SunMedium,t:22,n:10,pv:680,c:W},{d:"Man",ic:CloudSun,t:19,n:40,pv:520,c:W},{d:"Pas",ic:Cloud,t:16,n:80,pv:180,c:D},{d:"Jue",ic:Cloud,t:18,n:55,pv:380,c:W},{d:"Vie",ic:SunMedium,t:24,n:5,pv:720,c:G}];
const hmap=Array.from({length:7},(_,d)=>Array.from({length:24},(_,h)=>{const b=h<6?.02:h<10?.07:h<14?.05:h<18?.09:h<22?.18:.06;return+(b+Math.random()*.05-(d>4?.03:0)).toFixed(3)}));
const dH=["L","M","X","J","V","S","D"];
const sohH=Array.from({length:12},(_,i)=>({mes:["Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic","Ene","Feb","Mar"][i],soh:100-i*.3-Math.random()*.2,ciclos:Math.round(22+i*18+Math.random()*5)}));
const comp=Array.from({length:30},(_,i)=>({dia:i+1,sin:+(140+Math.random()*40).toFixed(0),con:+(95+Math.random()*30).toFixed(0)}));
const mPred=Array.from({length:6},(_,i)=>({mes:["Abr","May","Jun","Jul","Ago","Sep"][i],coste:Math.round(4800-i*150+Math.random()*300),ahorro:Math.round(800+i*30+Math.random()*100)}));
const wPat=Array.from({length:7},(_,d)=>Array.from({length:24},(_,h)=>{const b=h<6?25:h<9?45:h<13?70:h<17?65:h<20?55:h<22?40:30;return Math.round(b*(d<5?1:.6)+Math.random()*15)}));
// Seinon-style data
const zones=[
  {name:"Produccion",x:5,y:12,w:45,h:38,kw:342,temp:22,st:"ok",meters:["SM-001","SM-002"]},
  {name:"Camara Frio 1",x:55,y:12,w:20,h:38,kw:128,temp:3.1,st:"ok",meters:["SM-003"]},
  {name:"Camara Frio 2",x:78,y:12,w:18,h:38,kw:95,temp:1.8,st:"warn",meters:["SM-004"]},
  {name:"Oficinas",x:5,y:55,w:30,h:32,kw:45,temp:23,st:"ok",meters:["SM-005"]},
  {name:"Almacen",x:38,y:55,w:30,h:32,kw:18,temp:19,st:"ok",meters:["SM-006"]},
  {name:"Compresores",x:72,y:55,w:24,h:32,kw:186,temp:38,st:"alert",meters:["SM-007","SM-008"]},
];
const meters=[
  {id:"SM-001",zona:"Produccion",tipo:"Energia Activa",valor:"8,420 kWh",pot:"245 kW",cosPhi:"0.94",st:"online"},
  {id:"SM-002",zona:"Produccion",tipo:"Energia Reactiva",valor:"1,240 kVArh",pot:"97 kW",cosPhi:"0.92",st:"online"},
  {id:"SM-003",zona:"Camara 1",tipo:"Energia + Temp",valor:"3,180 kWh",pot:"128 kW",cosPhi:"0.96",st:"online"},
  {id:"SM-004",zona:"Camara 2",tipo:"Energia + Temp",valor:"2,890 kWh",pot:"95 kW",cosPhi:"0.95",st:"online"},
  {id:"SM-005",zona:"Oficinas",tipo:"Energia Activa",valor:"980 kWh",pot:"45 kW",cosPhi:"0.98",st:"online"},
  {id:"SM-006",zona:"Almacen",tipo:"Energia Activa",valor:"420 kWh",pot:"18 kW",cosPhi:"0.97",st:"online"},
  {id:"SM-007",zona:"Compresores",tipo:"Energia + Temp",valor:"5,640 kWh",pot:"186 kW",cosPhi:"0.88",st:"warn"},
  {id:"SM-008",zona:"Compresores",tipo:"Potencia React.",valor:"890 kVArh",pot:"42 kW",cosPhi:"0.85",st:"warn"},
];
const facturas=[
  {id:679912,nom:"Planta 4 03/2026",per:"01/03-20/03",cups:"PLANTA4",tar:"6.1TD",max:736,total:"4,892",val:true},
  {id:679911,nom:"Planta 4 02/2026",per:"01/02-28/02",cups:"PLANTA4",tar:"6.1TD",max:764,total:"5,124",val:true},
  {id:679910,nom:"Planta 4 01/2026",per:"01/01-31/01",cups:"PLANTA4",tar:"6.1TD",max:724,total:"4,756",val:false},
  {id:679909,nom:"Planta 4 12/2025",per:"01/12-31/12",cups:"PLANTA4",tar:"6.1TD",max:744,total:"4,988",val:true},
];
const sAlerts=[
  {t:"14:32",msg:"Potencia maxima superada P1",tipo:"alta",zona:"Compresores"},
  {t:"12:32",msg:"Bateria cargada 95% - parando carga",tipo:"info",zona:"Orquestador"},
  {t:"11:15",msg:"OMIE baja 0.03 - oportunidad carga",tipo:"ok",zona:"Orquestador"},
  {t:"10:02",msg:"FV max 92kW - excedente a bateria",tipo:"ok",zona:"FV"},
  {t:"08:45",msg:"Temp Camara 2 fuera de rango",tipo:"media",zona:"Camara 2"},
  {t:"06:00",msg:"Schedule IA generado FlexMeasures",tipo:"info",zona:"IA"},
  {t:"03:12",msg:"Carga nocturna completada 15-95%",tipo:"ok",zona:"Bateria"},
  {t:"02:15",msg:"Cos phi bajo 0.85 en Compresores",tipo:"media",zona:"Compresores"},
];

// ========== APP ==========
export default function App(){
  const[tab,setTab]=useState("dash");const[sim,setSim]=useState(true);const[tick,setTick]=useState(0);const[col,setCol]=useState(false);
  useEffect(()=>{if(!sim)return;const iv=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(iv)},[sim]);
  const pvN=+(pvH[HR]?.pv+Math.sin(tick*.3)*3).toFixed(1),socN=+Math.min(99,Math.max(12,batH[HR]?.soc+Math.sin(tick*.2)*2)).toFixed(0),gridN=+(Math.max(0,55-pvN+Math.sin(tick*.4)*5)).toFixed(1),conN=+(pvN+gridN+(socN>50?-5:8)).toFixed(1),omieN=omie[HR]?.precio||.08;
  const dec=omieN>.12?"BATERIA":pvN>30?"FOTOVOLTAICA":"RED",decC=dec==="BATERIA"?D:dec==="FOTOVOLTAICA"?G:A;
  const sf="#fff",sf2="#f8f9fa",tx="#111",tx2="#666",bd="#e2e5e9",sh="0 1px 8px rgba(0,0,0,.06)";
  const p={sf,sf2,tx,tx2,bd,sh,A,G,W,D,P,pvN,socN,gridN,conN,omieN,dec,decC,tick,HR};
  const nav=[{id:"dash",ic:BarChart3,l:"Dashboard"},{id:"monitor",ic:Eye,l:"Monitorizacion"},{id:"orq",ic:Brain,l:"Orquestacion IA"},{id:"alertas",ic:Bell,l:"Alertas"},{id:"fin",ic:CircleDollarSign,l:"Financiero"},{id:"sys",ic:Layers,l:"Sistema"}];
  const R=()=>{switch(tab){case"dash":return <Pg1 {...p}/>;case"monitor":return <Pg2 {...p}/>;case"orq":return <Pg3 {...p}/>;case"alertas":return <Pg4 {...p}/>;case"fin":return <Pg5 {...p}/>;case"sys":return <Pg6 {...p}/>;default:return null}};
  return(
    <div style={{width:"100%",height:"100vh",background:"#f0f2f5",color:tx,fontFamily:"'Segoe UI Variable','Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes glow{0%,100%{box-shadow:0 0 6px ${A}33}50%{box-shadow:0 0 16px ${A}55}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}`}</style>
      <header style={{height:44,background:"rgba(255,255,255,.85)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",padding:"0 14px",borderBottom:`1px solid ${bd}`,gap:10,flexShrink:0,zIndex:50}}>
        <IB onClick={()=>setCol(!col)} c={tx2}><Menu size={15}/></IB>
        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:26,height:26,borderRadius:6,background:`linear-gradient(135deg,${A},${AL})`,display:"flex",alignItems:"center",justifyContent:"center"}}><PlugZap size={13} color="#fff"/></div><span style={{fontWeight:700,fontSize:13.5}}>Seinon + Orchestrator</span><span style={{fontSize:9,color:"#fff",background:G,padding:"1px 6px",borderRadius:8,fontWeight:600}}>LIVE</span></div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:tx2}}><Cpu size={11}/>RPi PLC 21+ <span style={{display:"flex",alignItems:"center",gap:3,marginLeft:8}}><span style={{width:5,height:5,borderRadius:"50%",background:G,animation:"pulse 2s infinite"}}/><span style={{color:G}}>Online</span></span></div>
        <IB c={tx2} onClick={()=>setSim(!sim)}>{sim?<Pause size={13}/>:<Play size={13}/>}</IB><IB c={tx2}><Bell size={13}/></IB><IB c={tx2}><Settings size={13}/></IB>
      </header>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <nav style={{width:col?48:165,flexShrink:0,background:"rgba(255,255,255,.85)",backdropFilter:"blur(20px)",borderRight:`1px solid ${bd}`,padding:"6px 3px",transition:"width .3s ease",display:"flex",flexDirection:"column"}}>
          {nav.map(n=>{const ac=tab===n.id,Ic=n.ic;return(<button key={n.id} onClick={()=>setTab(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:col?"9px 14px":"8px 10px",background:ac?"#e8edf2":"transparent",border:"none",borderRadius:5,cursor:"pointer",color:ac?tx:tx2,fontSize:12,fontWeight:ac?600:400,fontFamily:"inherit",textAlign:"left",position:"relative",transition:"all .15s",marginBottom:1}} onMouseEnter={e=>{if(!ac)e.currentTarget.style.background="#f0f0f0"}} onMouseLeave={e=>{if(!ac)e.currentTarget.style.background="transparent"}}>{ac&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:14,borderRadius:2,background:A}}/>}<Ic size={15}/>{!col&&<span>{n.l}</span>}</button>)})}
          {!col&&<div style={{marginTop:"auto",padding:"8px 10px",borderTop:`1px solid ${bd}`,fontSize:9,color:tx2}}><div style={{display:"flex",alignItems:"center",gap:4}}><Wifi size={10} color={G}/>Modbus OK - 8 medidores</div><div style={{marginTop:2}}>Planta 4 - Certex Innova</div></div>}
        </nav>
        <main style={{flex:1,overflow:"auto",padding:16}}><div style={{animation:"fadeUp .3s ease"}} key={tab}>{R()}</div></main>
      </div>
    </div>
  );
}

// ========== ATOMS ==========
function IB({children,onClick,c}){return <button onClick={onClick} style={{background:"none",border:"none",color:c,cursor:"pointer",padding:5,borderRadius:4,display:"flex",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,.04)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{children}</button>}
function Cd({children,style={},s="#fff",sh:shadow,bd:border}){return <div style={{background:s,borderRadius:7,padding:14,border:`1px solid ${border}`,boxShadow:shadow,...style}}>{children}</div>}
function Bg({text,color}){return <span style={{padding:"2px 7px",borderRadius:9,fontSize:9,fontWeight:600,background:`${color}12`,color}}>{text}</span>}
function TT(p){return{contentStyle:{background:"#fff",border:`1px solid ${p.bd}`,borderRadius:7,fontSize:10,boxShadow:p.sh}}}
function Hd({t,sub,children}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><h1 style={{fontSize:18,fontWeight:700,margin:0}}>{t}</h1>{sub&&<p style={{fontSize:11,color:"#666",margin:"2px 0 0"}}>{sub}</p>}</div>{children}</div>}
function Mi({ic:Ic,l,v,u,color,sub,p}){return(<Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:10}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><div style={{width:24,height:24,borderRadius:5,background:`${color}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={12} color={color}/></div><span style={{fontSize:9,color:p.tx2}}>{l}</span></div><div style={{fontSize:17,fontWeight:700,letterSpacing:-.5}}>{v}{u&&<span style={{fontSize:10,fontWeight:400,color:p.tx2}}> {u}</span>}</div>{sub&&<Bg text={sub} color={color}/>}</Cd>)}

// ========== 1. DASHBOARD ==========
function Pg1(p){
  const SI=p.socN>70?BatteryFull:p.socN>30?BatteryMedium:BatteryLow;
  const ins=["Anomalia: consumo nocturno +34% en linea 3. Equipo no apagado detectado por IA.","Pico OMIE previsto 20h: 0.24/kWh. Bateria reservada 80% para descarga.","Manana nubes 40%: precarga nocturna a 0.03/kWh programada.","Compresor ppal: consumo +22% en 6m. IA recomienda sustitucion motor."][p.tick%4];
  return(<>
    <Hd t="Dashboard General" sub="Monitorizacion + Orquestacion IA - Planta 4"><div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:7,background:`${p.decC}08`,border:`2px solid ${p.decC}25`,animation:"glow 3s infinite"}}><Zap size={14} color={p.decC}/><div><div style={{fontSize:9,color:p.tx2}}>Fuente</div><div style={{fontSize:14,fontWeight:700,color:p.decC}}>{p.dec}</div></div></div></Hd>
    {/* AI Banner */}
    <div style={{padding:"8px 12px",borderRadius:7,background:`linear-gradient(135deg,${A}06,${P}06)`,border:`1px solid ${A}18`,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:28,height:28,borderRadius:7,background:`${A}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Brain size={14} color={A}/></div>
      <div style={{flex:1}}><div style={{fontSize:9,color:A,fontWeight:600}}>IA INSIGHT</div><div style={{fontSize:11}}>{ins}</div></div><Bg text="94%" color={A}/>
    </div>
    {/* KPIs - 8 across */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:8,marginBottom:10}}>
      <Mi ic={SunMedium} l="FV" v={`${p.pvN}`} u="kW" color={p.W} p={p}/>
      <Mi ic={SI} l="Bateria" v={`${p.socN}%`} color={p.socN>50?p.G:p.D} p={p}/>
      <Mi ic={Plug} l="Red" v={`${p.gridN}`} u="kW" color={p.A} p={p}/>
      <Mi ic={Gauge} l="Consumo" v={`${p.conN}`} u="kW" color={p.tx} p={p}/>
      <Mi ic={CircleDollarSign} l="OMIE" v={`${p.omieN.toFixed(3)}`} color={p.omieN>.12?p.D:p.omieN>.06?p.W:p.G} p={p}/>
      <Mi ic={Thermometer} l="Cam 1" v="3.1" u="C" color={p.G} p={p}/>
      <Mi ic={Activity} l="Cos phi" v="0.94" color={p.G} p={p}/>
      <Mi ic={AlertTriangle} l="Alertas" v="3" color={p.D} sub="activas" p={p}/>
    </div>
    {/* Charts 2x2 */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>OMIE + Prediccion IA</div>
        <ResponsiveContainer width="100%" height={130}><ComposedChart data={pricePred}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><ReferenceLine y={.12} stroke={D} strokeDasharray="3 3"/><Area type="monotone" dataKey="upper" stroke="none" fill={`${P}12`}/><Area type="monotone" dataKey="lower" stroke="none" fill={p.sf}/><Line type="monotone" dataKey="real" stroke={A} strokeWidth={2} dot={false}/><Line type="monotone" dataKey="pred" stroke={P} strokeWidth={1.5} strokeDasharray="4 3" dot={false}/></ComposedChart></ResponsiveContainer>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Flujo Energetico</div>
        <ResponsiveContainer width="100%" height={130}><AreaChart data={pFlow}><defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={W} stopOpacity={.3}/><stop offset="95%" stopColor={W} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Area type="monotone" dataKey="pv" stroke={W} fill="url(#pG)" strokeWidth={2} name="FV"/><Area type="monotone" dataKey="red" stroke={A} fill={`${A}12`} strokeWidth={1.5} name="Red"/><Line type="monotone" dataKey="consumo" stroke={p.tx} strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer>
      </Cd>
    </div>
    {/* Strategy of the Day */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:14,marginBottom:10,borderLeft:`4px solid ${A}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${A}15,${P}15)`,display:"flex",alignItems:"center",justifyContent:"center"}}><Brain size={16} color={A}/></div>
        <div><div style={{fontSize:14,fontWeight:700}}>Estrategia de Consumo - Hoy</div><div style={{fontSize:10,color:p.tx2}}>Generada por Seinon IA a las 00:05 - Actualizada con intradiario a las 12:15</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:4}}><Bg text="Optimizando" color={G}/><Bg text="Ahorro est. 29.40" color={G}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:0,marginBottom:12}}>
        {decs.map((d,i)=>{const Ic=d.ic;const isNow=HR>=parseInt(d.h)&&HR<(parseInt(decs[i+1]?.h)||24);return(
          <div key={i} style={{padding:"10px 8px",textAlign:"center",background:isNow?`${d.c}10`:i%2===0?p.sf2:"transparent",borderRadius:isNow?6:0,border:isNow?`2px solid ${d.c}`:"2px solid transparent",position:"relative"}}>
            {isNow&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",fontSize:7,fontWeight:700,color:d.c,background:p.sf,padding:"1px 6px",borderRadius:8,border:`1px solid ${d.c}`}}>AHORA</div>}
            <Ic size={18} color={d.c} style={{margin:"0 auto 4px",display:"block"}}/>
            <div style={{fontSize:9,fontWeight:700,color:d.c}}>{d.h}</div>
            <div style={{fontSize:9,fontWeight:600,marginTop:2}}>{d.a}</div>
            <div style={{fontSize:8,color:p.tx2,marginTop:1}}>{d.f}</div>
            <div style={{fontSize:11,fontWeight:700,color:G,marginTop:4}}>{d.s}</div>
          </div>
        )})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div style={{padding:10,borderRadius:6,background:`${A}06`,border:`1px solid ${A}12`}}>
          <div style={{fontSize:10,fontWeight:600,color:A,marginBottom:4}}>🌙 Madrugada (ahora mismo)</div>
          <div style={{fontSize:10,lineHeight:1.4}}>El algoritmo ha detectado que OMIE marca precios de <strong>0.03/kWh</strong> hasta las 06:00. Se esta cargando la bateria al maximo aprovechando tarifa valle. SoC actual: <strong>{p.socN}%</strong>. Objetivo: llegar al 95% antes del amanecer para cubrir el pico de la tarde sin comprar red cara.</div>
        </div>
        <div style={{padding:10,borderRadius:6,background:`${W}06`,border:`1px solid ${W}12`}}>
          <div style={{fontSize:10,fontWeight:600,color:W,marginBottom:4}}>☀️ Mediodia (previsto)</div>
          <div style={{fontSize:10,lineHeight:1.4}}>La prevision meteorologica indica <strong>cielo despejado</strong> con produccion FV estimada de <strong>92kW pico</strong>. El orquestador desconectara la red a las 10:00 y alimentara toda la planta con FV. El excedente (estimado 35kW) ira directo a recargar bateria para el pico de la tarde.</div>
        </div>
        <div style={{padding:10,borderRadius:6,background:`${D}06`,border:`1px solid ${D}12`}}>
          <div style={{fontSize:10,fontWeight:600,color:D,marginBottom:4}}>🔴 Pico tarde (critico)</div>
          <div style={{fontSize:10,lineHeight:1.4}}>OMIE predice picos de <strong>0.22-0.24/kWh</strong> entre 18:00-22:00. El orquestador descargara la bateria al maximo para evitar compra de red cara. Sin orquestador pagarias ~14.20 en esas 4h. Con orquestador: <strong>1.60</strong>. Ahorro solo en este bloque: <strong>12.60</strong>.</div>
        </div>
      </div>
    </Cd>
    {/* Bottom row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Gemelo Digital - Planta 4</div>
        <div style={{position:"relative",width:"100%",paddingBottom:"55%",background:p.sf2,borderRadius:6,border:`1px solid ${p.bd}`}}>
          {zones.map(z=>{const bg=z.st==="alert"?`${D}15`:z.st==="warn"?`${W}15`:`${G}08`;const bc=z.st==="alert"?D:z.st==="warn"?W:p.bd;return <div key={z.name} style={{position:"absolute",left:`${z.x}%`,top:`${z.y}%`,width:`${z.w}%`,height:`${z.h}%`,background:bg,border:`1.5px solid ${bc}`,borderRadius:5,padding:4,display:"flex",flexDirection:"column",justifyContent:"space-between",cursor:"pointer"}}><div style={{fontSize:8,fontWeight:600}}>{z.name}</div><div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:p.tx2}}><span>{z.kw}kW</span><span>{z.temp}C</span></div></div>})}
        </div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Bateria + Prevision Solar</div>
        <ResponsiveContainer width="100%" height={80}><AreaChart data={batH}><defs><linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={P} stopOpacity={.35}/><stop offset="95%" stopColor={P} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} domain={[0,100]}/><Area type="monotone" dataKey="soc" stroke={P} fill="url(#bG)" strokeWidth={2}/></AreaChart></ResponsiveContainer>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3,marginTop:6}}>{forecast.map(f=>{const Ic=f.ic;return <div key={f.d} style={{textAlign:"center",padding:3,borderRadius:4,background:p.sf2,border:`1px solid ${p.bd}`}}><div style={{fontSize:7,fontWeight:600}}>{f.d}</div><Ic size={14} color={f.c} style={{margin:"2px auto",display:"block"}}/><div style={{fontSize:9,fontWeight:700,color:f.c}}>{f.pv}</div></div>})}</div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Decisiones IA + Ahorro</div>
        {decs.filter(d=>parseInt(d.h)>=HR).slice(0,3).map((d,i)=>{const Ic=d.ic;return <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:i<2?`1px solid ${p.bd}`:"none"}}><div style={{width:22,height:22,borderRadius:5,background:`${d.c}10`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic size={10} color={d.c}/></div><div style={{flex:1}}><div style={{fontSize:10,fontWeight:600}}>{d.a}</div><div style={{fontSize:8,color:p.tx2}}>{d.h}</div></div><span style={{fontSize:11,fontWeight:700,color:G}}>{d.s}</span></div>})}
        <div style={{marginTop:6,padding:6,borderRadius:5,background:`${G}06`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:G,fontWeight:600}}>Ahorro hoy</span><span style={{fontSize:14,fontWeight:700,color:G}}>29.40</span></div>
      </Cd>
    </div>
  </>);
}

// ========== 2. MONITORIZACION ==========
function Pg2(p){
  const[selZone,setSelZone]=useState(null);
  const filt=selZone?meters.filter(m=>m.zona.includes(selZone)):meters;
  return(<>
    <Hd t="Monitorizacion" sub="Puntos de medida, zonas, gemelo digital y tiempo real"/>
    {/* Gemelo Digital grande */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:10,marginBottom:10}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Gemelo Digital - Planta 4 (click en zona para filtrar)</div>
        <div style={{position:"relative",width:"100%",paddingBottom:"45%",background:p.sf2,borderRadius:6,border:`1px solid ${p.bd}`}}>
          {zones.map(z=>{const bg=z.st==="alert"?`${D}15`:z.st==="warn"?`${W}15`:selZone===z.name?`${A}12`:`${G}06`;const bc=z.st==="alert"?D:z.st==="warn"?W:selZone===z.name?A:p.bd;return <div key={z.name} onClick={()=>setSelZone(selZone===z.name?null:z.name)} style={{position:"absolute",left:`${z.x}%`,top:`${z.y}%`,width:`${z.w}%`,height:`${z.h}%`,background:bg,border:`2px solid ${bc}`,borderRadius:6,padding:6,display:"flex",flexDirection:"column",justifyContent:"space-between",cursor:"pointer",transition:"all .2s"}}><div style={{fontSize:9,fontWeight:700}}>{z.name}</div><div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:p.tx2}}><span>⚡{z.kw}kW</span><span>🌡{z.temp}C</span></div><div style={{fontSize:7,color:p.tx2}}>{z.meters.join(", ")}</div></div>})}
        </div>
      </Cd>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:10}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Estado Zonas</div>
          {zones.map(z=><div key={z.name} onClick={()=>setSelZone(selZone===z.name?null:z.name)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:`1px solid ${p.bd}`,cursor:"pointer",fontSize:11,background:selZone===z.name?`${A}06`:"transparent",borderRadius:3,paddingLeft:4}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:z.st==="alert"?D:z.st==="warn"?W:G,flexShrink:0}}/>
            <span style={{flex:1,fontWeight:selZone===z.name?600:400}}>{z.name}</span>
            <span style={{fontSize:10,color:p.tx2}}>{z.kw}kW</span>
          </div>)}
        </Cd>
        <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:10}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>Resumen</div>
          <div style={{fontSize:22,fontWeight:700,color:A}}>{zones.reduce((s,z)=>s+z.kw,0)} kW</div>
          <div style={{fontSize:10,color:p.tx2}}>Consumo total Planta 4</div>
          <div style={{fontSize:10,color:p.tx2,marginTop:4}}>{meters.length} medidores activos</div>
          <div style={{fontSize:10,color:p.tx2}}>{meters.filter(m=>m.st==="warn").length} con alertas</div>
        </Cd>
      </div>
    </div>
    {/* Meters table */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:12,fontWeight:600}}>Puntos de Medida {selZone&&`- ${selZone}`}</div>
        {selZone&&<button onClick={()=>setSelZone(null)} style={{fontSize:10,color:A,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Ver todos</button>}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
        <thead><tr style={{borderBottom:`2px solid ${p.bd}`}}>{["ID","Zona","Tipo","Valor Mes","Potencia","Cos phi","Estado"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left",fontWeight:600,fontSize:9,color:p.tx2}}>{h}</th>)}</tr></thead>
        <tbody>{filt.map(m=><tr key={m.id} style={{borderBottom:`1px solid ${p.bd}`}}>
          <td style={{padding:"5px 8px",fontWeight:600}}>{m.id}</td>
          <td style={{padding:"5px 8px"}}>{m.zona}</td>
          <td style={{padding:"5px 8px",color:p.tx2}}>{m.tipo}</td>
          <td style={{padding:"5px 8px"}}>{m.valor}</td>
          <td style={{padding:"5px 8px"}}>{m.pot}</td>
          <td style={{padding:"5px 8px"}}><span style={{color:parseFloat(m.cosPhi)<.9?D:G,fontWeight:600}}>{m.cosPhi}</span></td>
          <td style={{padding:"5px 8px"}}><Bg text={m.st} color={m.st==="online"?G:W}/></td>
        </tr>)}</tbody>
      </table>
    </Cd>
    {/* Realtime charts per zone */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      {[{l:"Energia Activa (kWh)",data:pFlow,dk:"consumo",c:A},{l:"Potencia (kW)",data:pFlow,dk:"pv",c:W},{l:"Temperaturas",data:batH.map((b,i)=>({...b,cam1:2.5+Math.sin(i*.3)*.8,cam2:1.2+Math.sin(i*.4)*.6})),dk:"cam1",c:P}].map((ch,i)=>(
        <Cd key={i} s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>{ch.l}</div>
          <ResponsiveContainer width="100%" height={120}><LineChart data={ch.data}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Line type="monotone" dataKey={ch.dk} stroke={ch.c} strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
        </Cd>
      ))}
    </div>
  </>);
}

// ========== 3. ORQUESTACION IA ==========
function Pg3(p){
  const[pvX,setPvX]=useState(0);const[batX,setBatX]=useState(0);const[tar,setTar]=useState("indexada");
  const bS=9894,simS=Math.round(bS+pvX*120+batX*85+(tar==="indexada"?0:-1200));
  const tSin=comp.reduce((s,d)=>s+Number(d.sin),0),tCon=comp.reduce((s,d)=>s+Number(d.con),0),diff=tSin-tCon;
  const gPC=(v)=>v>65?D:v>50?W:v>35?"#E8A838":G;
  return(<>
    <Hd t="Orquestacion IA" sub="Prediccion, anomalias, recomendaciones, simulador y schedule"><div style={{display:"flex",gap:4}}><Bg text="LSTM v3.2" color={A}/><Bg text="94.2% precision" color={G}/></div></Hd>
    {/* AI KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:8}}>
      <Mi ic={Brain} l="Modelo" v="LSTM" color={A} sub="v3.2" p={p}/><Mi ic={Target} l="MAPE" v="5.8%" color={G} p={p}/><Mi ic={AlertTriangle} l="Anomalias" v="5" color={D} sub="mes" p={p}/><Mi ic={Lightbulb} l="Recomend." v="6" color={W} p={p}/><Mi ic={CircleDollarSign} l="Ahorro IA" v="2,390" color={G} sub="/mes" p={p}/><Mi ic={ShieldCheck} l="Uptime" v="99.9%" color={G} p={p}/>
    </div>
    {/* Predictions */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:600}}>Prediccion Consumo 30d</span><Bg text="LSTM" color={P}/></div>
        <ResponsiveContainer width="100%" height={140}><ComposedChart data={pred30}><defs><linearGradient id="ci" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={A} stopOpacity={.1}/><stop offset="95%" stopColor={A} stopOpacity={.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="dia" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Area type="monotone" dataKey="upper" stroke="none" fill="url(#ci)"/><Area type="monotone" dataKey="lower" stroke="none" fill={p.sf}/><Line type="monotone" dataKey="pred" stroke={A} strokeWidth={1.5} strokeDasharray="5 3" dot={false}/><Line type="monotone" dataKey="real" stroke={G} strokeWidth={2} dot={false}/></ComposedChart></ResponsiveContainer>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:600}}>Prediccion Precios OMIE</span><Bg text="XGBoost" color={A}/></div>
        <ResponsiveContainer width="100%" height={140}><ComposedChart data={pricePred}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><ReferenceLine y={.12} stroke={D} strokeDasharray="3 3"/><Area type="monotone" dataKey="upper" stroke="none" fill={`${P}12`}/><Area type="monotone" dataKey="lower" stroke="none" fill={p.sf}/><Line type="monotone" dataKey="real" stroke={A} strokeWidth={2} dot={false}/><Line type="monotone" dataKey="pred" stroke={P} strokeWidth={1.5} strokeDasharray="4 3" dot={false}/></ComposedChart></ResponsiveContainer>
        <div style={{marginTop:4,padding:5,borderRadius:4,background:`${D}06`,fontSize:9}}><strong style={{color:D}}>Alerta:</strong> Pico 0.24 previsto 20h. Bateria reservada.</div>
      </Cd>
    </div>
    {/* Anomalies */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>Anomalias Detectadas (Isolation Forest)</span><Bg text="Impacto: +870/mes" color={D}/></div>
      {anomalies.map((a,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 80px 50px 1fr",gap:8,alignItems:"center",padding:"7px 0",borderBottom:i<anomalies.length-1?`1px solid ${p.bd}`:"none",fontSize:10}}>
        <div><div style={{fontWeight:600,fontSize:9}}>{a.fecha}</div><Bg text={a.sev} color={a.sev==="alta"?D:a.sev==="media"?W:A}/></div>
        <div><div style={{fontWeight:600}}>{a.tipo}</div><div style={{fontSize:9,color:p.tx2}}>{a.desc}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:D}}>{a.imp}</div></div>
        <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:A}}>{a.conf}%</div>
        <div style={{padding:"4px 8px",borderRadius:4,background:`${G}06`,fontSize:9}}><strong style={{color:G}}>→</strong> {a.acc}</div>
      </div>))}
    </Cd>
    {/* Recommendations */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>Recomendaciones IA</span><Bg text="Potencial: 2,390/mes" color={G}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
        {aiRecs.map((r,i)=>{const Ic=r.ic;return(<div key={i} style={{padding:10,borderRadius:6,border:`1px solid ${p.bd}`,background:p.sf2}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:28,height:28,borderRadius:6,background:`${A}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={14} color={A}/></div><div style={{fontSize:10,fontWeight:700}}>{r.t}</div></div>
          <div style={{fontSize:9,color:p.tx2,marginBottom:4,lineHeight:1.3}}>{r.d}</div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}><Bg text={`${r.s}/m`} color={G}/><Bg text={r.dif} color={r.dif==="Facil"?G:r.dif==="Media"?W:A}/><Bg text={`${r.prob}%`} color={A}/></div>
        </div>)})}
      </div>
    </Cd>
    {/* Pattern + Projection + Simulator + Compare + Schedule */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Patron Semanal IA (kW)</div>
        <div style={{overflowX:"auto"}}><div style={{display:"grid",gridTemplateColumns:"18px repeat(24,1fr)",gap:1,minWidth:450}}>
          <div/>{Array.from({length:24},(_,h)=><div key={h} style={{fontSize:6,color:p.tx2,textAlign:"center"}}>{String(h).padStart(2,"0")}</div>)}
          {wPat.flatMap((row,d)=>[<div key={`l${d}`} style={{fontSize:7,color:p.tx2,display:"flex",alignItems:"center",fontWeight:600}}>{dH[d]}</div>,...row.map((v,h)=><div key={`p${d}-${h}`} style={{background:gPC(v),borderRadius:1,minHeight:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:5,color:"#fff",fontWeight:600}}>{v}</div>)])}
        </div></div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Proyeccion IA 6 meses</div>
        <ResponsiveContainer width="100%" height={110}><ComposedChart data={mPred}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="mes" tick={{fill:p.tx2,fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Bar dataKey="coste" fill={`${A}25`} radius={[3,3,0,0]} name="Coste"/><Bar dataKey="ahorro" fill={G} radius={[3,3,0,0]} name="Ahorro"/></ComposedChart></ResponsiveContainer>
      </Cd>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Simulador IA</div>
        {[{l:"FV extra",v:pvX,set:setPvX,max:100,step:5,u:"kWp",c:W},{l:"Bateria extra",v:batX,set:setBatX,max:50,step:5,u:"kWh",c:P}].map(s=>(
          <div key={s.l} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}><span>{s.l}</span><span style={{fontWeight:700,color:s.c}}>+{s.v} {s.u}</span></div>
            <input type="range" min={0} max={s.max} step={s.step} value={s.v} onChange={e=>s.set(+e.target.value)} style={{width:"100%",accentColor:s.c,height:4}}/></div>))}
        <div style={{display:"flex",gap:3,marginBottom:8}}>{["indexada","fija"].map(t=><button key={t} onClick={()=>setTar(t)} style={{padding:"4px 12px",borderRadius:4,border:"none",fontSize:10,fontWeight:tar===t?600:400,cursor:"pointer",fontFamily:"inherit",background:tar===t?A:"rgba(0,0,0,.05)",color:tar===t?"#fff":p.tx2}}>{t}</button>)}</div>
        <div style={{textAlign:"center",borderTop:`1px solid ${p.bd}`,paddingTop:8}}><div style={{fontSize:9,color:p.tx2}}>Ahorro anual IA</div><div style={{fontSize:28,fontWeight:700,color:G}}>{simS.toLocaleString()}</div></div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Con vs Sin Orquestador IA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:6}}>
          <div style={{padding:5,borderRadius:5,background:p.sf2,textAlign:"center"}}><div style={{fontSize:8,color:p.tx2}}>Sin</div><div style={{fontSize:14,fontWeight:700,color:D}}>{tSin.toLocaleString()}</div></div>
          <div style={{padding:5,borderRadius:5,background:p.sf2,textAlign:"center"}}><div style={{fontSize:8,color:p.tx2}}>Con</div><div style={{fontSize:14,fontWeight:700,color:G}}>{tCon.toLocaleString()}</div></div>
          <div style={{padding:5,borderRadius:5,background:`${G}08`,textAlign:"center"}}><div style={{fontSize:8,color:p.tx2}}>Ahorro</div><div style={{fontSize:14,fontWeight:700,color:G}}>{diff.toLocaleString()}</div></div>
        </div>
        <ResponsiveContainer width="100%" height={110}><ComposedChart data={comp}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="dia" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={5}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Bar dataKey="sin" fill={`${D}25`} radius={[2,2,0,0]} name="Sin"/><Bar dataKey="con" fill={G} radius={[2,2,0,0]} name="Con"/></ComposedChart></ResponsiveContainer>
      </Cd>
    </div>
    {/* Schedule */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:600}}>Schedule Optimo IA - Hoy</span><Bg text="FlexMeasures LP" color={A}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:5}}>
        {decs.map((d,i)=>{const Ic=d.ic;return <div key={i} style={{padding:"8px 6px",borderRadius:5,border:`1px solid ${p.bd}`,background:p.sf2,textAlign:"center"}}><Ic size={16} color={d.c} style={{margin:"0 auto 3px",display:"block"}}/><div style={{fontSize:9,fontWeight:700}}>{d.h}</div><div style={{fontSize:8,marginTop:1}}>{d.a}</div><div style={{fontSize:11,fontWeight:700,color:G,marginTop:3}}>{d.s}</div></div>})}
      </div>
      <div style={{marginTop:6,padding:6,borderRadius:5,background:`${G}06`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:G,fontWeight:600}}>Total ahorro IA hoy</span><span style={{fontSize:18,fontWeight:700,color:G}}>29.40</span></div>
    </Cd>
  </>);
}

// ========== 4. ALERTAS ==========
function Pg4(p){
  const tc={alta:D,media:W,ok:G,info:A};
  return(<>
    <Hd t="Alertas" sub="Alarmas clasicas + deteccion anomalias IA"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:10}}>
      <Mi ic={AlertTriangle} l="Activas" v="3" color={D} p={p}/><Mi ic={CheckCircle} l="Resueltas 7d" v="5" color={G} p={p}/><Mi ic={Brain} l="Anomalias IA" v="5" color={W} sub="mes" p={p}/><Mi ic={CircleDollarSign} l="Impacto" v="870" color={D} sub="/mes" p={p}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Alertas del Sistema (clasicas + IA)</div>
        {sAlerts.map((a,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<sAlerts.length-1?`1px solid ${p.bd}`:"none"}}>
          <div style={{width:24,height:24,borderRadius:5,background:`${tc[a.tipo]||A}10`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Bell size={11} color={tc[a.tipo]||A}/></div>
          <div style={{flex:1}}><div style={{fontSize:10}}>{a.msg}</div><div style={{fontSize:8,color:p.tx2}}>{a.t} - {a.zona}</div></div>
          <Bg text={a.tipo} color={tc[a.tipo]||A}/>
        </div>))}
        <div style={{marginTop:8,fontSize:9,color:p.tx2,display:"flex",gap:4}}>Canales: <Bg text="Telegram OK" color={G}/><Bg text="Email OK" color={G}/><Bg text="WhatsApp..." color={W}/></div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Anomalias IA (predictivas)</div>
        {anomalies.map((a,i)=>(<div key={i} style={{padding:8,borderRadius:5,border:`1px solid ${p.bd}`,marginBottom:6,background:p.sf2}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}><Bg text={a.sev} color={a.sev==="alta"?D:a.sev==="media"?W:A}/><span style={{fontSize:9,color:p.tx2}}>{a.fecha}</span></div>
            <div style={{display:"flex",gap:4}}><span style={{fontSize:12,fontWeight:700,color:D}}>{a.imp}</span><Bg text={`${a.conf}%`} color={A}/></div>
          </div>
          <div style={{fontSize:10,fontWeight:600}}>{a.tipo}</div>
          <div style={{fontSize:9,color:p.tx2,marginTop:2}}>{a.desc}</div>
          <div style={{marginTop:4,padding:4,borderRadius:3,background:`${G}06`,fontSize:9}}><strong style={{color:G}}>Accion:</strong> {a.acc}</div>
        </div>))}
      </Cd>
    </div>
  </>);
}

// ========== 5. FINANCIERO ==========
function Pg5(p){
  return(<>
    <Hd t="Financiero" sub="Ahorro, facturas, valor solar e informe mensual"><button style={{padding:"5px 12px",borderRadius:5,border:"none",background:A,color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><Download size={12}/> PDF</button></Hd>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:10}}>
      <Mi ic={CircleDollarSign} l="Hoy" v="29.40" color={G} p={p}/><Mi ic={CircleDollarSign} l="Semana" v="191" color={A} p={p}/><Mi ic={CircleDollarSign} l="Mes" v="824" color={W} p={p}/><Mi ic={CircleDollarSign} l="Anual" v="9,894" color={P} p={p}/><Mi ic={SunMedium} l="Valor FV" v="89.52" color={W} p={p}/><Mi ic={Activity} l="Autoconsumo" v="62%" color={G} p={p}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Ahorro Semanal</div>
        <ResponsiveContainer width="100%" height={130}><BarChart data={wSav}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="d" tick={{fill:p.tx2,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Bar dataKey="v" fill={G} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Valor Solar</div>
        {[{l:"Autoconsumo",v:"54.80",c:G},{l:"A bateria",v:"28.60",c:P},{l:"Excedentes",v:"6.12",c:A},{l:"TOTAL FV",v:"89.52",c:W}].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<3?`1px solid ${p.bd}`:"none",fontSize:11}}>
            <span style={{fontWeight:i===3?700:400}}>{r.l}</span><span style={{fontWeight:700,color:r.c}}>{r.v}</span>
          </div>))}
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Autoconsumo FV</div>
        <ResponsiveContainer width="100%" height={100}><PieChart><Pie data={[{name:"Auto",value:62},{name:"Bat",value:23},{name:"Red",value:15}]} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={4} dataKey="value"><Cell fill={G}/><Cell fill={P}/><Cell fill={A}/></Pie></PieChart></ResponsiveContainer>
        <div style={{display:"flex",justifyContent:"center",gap:8}}>{[["62% Auto",G],["23% Bat",P],["15% Red",A]].map(([l,c])=><span key={l} style={{fontSize:8,display:"flex",alignItems:"center",gap:2,color:p.tx2}}><span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</span>)}</div>
      </Cd>
    </div>
    {/* Facturas */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,marginBottom:10}}>
      <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Facturas Electricidad</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
        <thead><tr style={{borderBottom:`2px solid ${p.bd}`}}>{["ID","Nombre","Periodo","Tarifa","Max","Total","Validada"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left",fontWeight:600,fontSize:9,color:p.tx2}}>{h}</th>)}</tr></thead>
        <tbody>{facturas.map(f=><tr key={f.id} style={{borderBottom:`1px solid ${p.bd}`}}>
          <td style={{padding:"5px 8px",color:p.tx2}}>{f.id}</td><td style={{padding:"5px 8px",fontWeight:500}}>{f.nom}</td><td style={{padding:"5px 8px",color:p.tx2}}>{f.per}</td><td style={{padding:"5px 8px"}}>{f.tar}</td><td style={{padding:"5px 8px"}}>{f.max}</td><td style={{padding:"5px 8px",fontWeight:600,color:A}}>{f.total}</td><td style={{padding:"5px 8px"}}>{f.val?<CheckCircle size={14} color={G}/>:<AlertTriangle size={14} color={D}/>}</td>
        </tr>)}</tbody>
      </table>
    </Cd>
    {/* Monthly report */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
      <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Informe Mensual - Marzo 2026</div>
      <div style={{background:p.sf2,borderRadius:6,padding:14,border:`1px solid ${p.bd}`}}>
        <div style={{textAlign:"center",marginBottom:10}}><div style={{fontSize:14,fontWeight:700}}>Certex Innova S.L.</div><div style={{fontSize:10,color:p.tx2}}>Monitorizacion + Orquestacion IA - Planta 4</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
          {[{l:"Sin orquestador",v:"4,872",c:D},{l:"Con orq. IA",v:"4,048",c:G},{l:"AHORRO",v:"824",c:G}].map(k=><div key={k.l} style={{padding:8,borderRadius:5,background:"#fff",border:`1px solid ${p.bd}`,textAlign:"center"}}><div style={{fontSize:8,color:p.tx2}}>{k.l}</div><div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div></div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,fontSize:10}}>
          <div>{[{l:"FV",v:"45%"},{l:"Bateria",v:"30%"},{l:"Red",v:"25%"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${p.bd}`}}><span>{r.l}</span><strong>{r.v}</strong></div>)}</div>
          <div>{[{l:"Autoconsumo",v:"62%"},{l:"SoH Bat",v:"96.5%"},{l:"Uptime",v:"99.8%"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${p.bd}`}}><span>{r.l}</span><strong>{r.v}</strong></div>)}</div>
          <div>{[{l:"Anomalias IA",v:"5"},{l:"Medidores",v:"8"},{l:"CO2 evitado",v:"3.8t"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${p.bd}`}}><span>{r.l}</span><strong>{r.v}</strong></div>)}</div>
        </div>
        <div style={{marginTop:8,padding:6,borderRadius:4,background:`${G}06`,fontSize:10}}><strong style={{color:G}}>ROI:</strong> 14.2 meses. Recuperado 68%.</div>
      </div>
    </Cd>
  </>);
}

// ========== 6. SISTEMA ==========
function Pg6(p){
  const ports=[{n:"RS-485 #1",d:"Fronius GEN24",pr:"SunSpec",s:"OK",c:G},{n:"RS-485 #2",d:"BYD HVS 10.2",pr:"Modbus RTU",s:"OK",c:G},{n:"Ethernet",d:"Contador Bidi",pr:"Modbus TCP",s:"OK",c:G},{n:"WiFi",d:"MQTT Broker",pr:"MQTT+TLS",s:"OK",c:G},{n:"R0.1",d:"Contactor FV",pr:"GPIO",s:"CERRADO",c:W},{n:"R0.2",d:"Contactor Bat",pr:"GPIO",s:"ABIERTO",c:p.tx2},{n:"R0.3",d:"Contactor Red",pr:"GPIO",s:"CERRADO",c:W},{n:"API",d:"OMIE/ESIOS",pr:"HTTPS",s:"Sync",c:A}];
  const cS=sohH[sohH.length-1].soh;
  return(<>
    <Hd t="Sistema" sub="Hardware PLC, salud bateria e integraciones"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:10}}>
      <Mi ic={Cpu} l="CPU" v="RPi 4" color={A} sub="ARM A72" p={p}/><Mi ic={Thermometer} l="Temp" v="42C" color={G} p={p}/><Mi ic={Clock} l="Uptime" v="47d" color={G} p={p}/><Mi ic={Heart} l="SoH" v={`${cS.toFixed(1)}%`} color={cS>90?G:W} p={p}/><Mi ic={RefreshCw} l="Ciclos" v={`${sohH[sohH.length-1].ciclos}`} color={A} p={p}/><Mi ic={Clock} l="Vida" v="12.5a" color={P} p={p}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Puertos y Conexiones</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
          <thead><tr style={{borderBottom:`2px solid ${p.bd}`}}>{["Puerto","Dispositivo","Proto",""].map(h=><th key={h} style={{padding:"4px 6px",textAlign:"left",fontWeight:600,fontSize:8,color:p.tx2}}>{h}</th>)}</tr></thead>
          <tbody>{ports.map((pt,i)=><tr key={i} style={{borderBottom:`1px solid ${p.bd}`}}><td style={{padding:"4px 6px",fontWeight:600}}>{pt.n}</td><td style={{padding:"4px 6px"}}>{pt.d}</td><td style={{padding:"4px 6px",color:p.tx2,fontSize:9}}>{pt.pr}</td><td style={{padding:"4px 6px"}}><Bg text={pt.s} color={pt.c}/></td></tr>)}</tbody>
        </table>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Integraciones</div>
        {[{n:"Fronius GEN24",st:"Conectado",c:G},{n:"BYD HVS BMS",st:"Conectado",c:G},{n:"Datadis/SIPS",st:"Conectado",c:G},{n:"OMIE API",st:"Sync diario",c:A},{n:"FlexMeasures",st:"Activo",c:G},{n:"Solcast (meteo)",st:"Activo",c:G},{n:"Telegram Bot",st:"Activo",c:G},{n:"MQTT Cloud",st:"Conectado",c:G}].map((i,idx)=>(
          <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${p.bd}`,fontSize:10}}>
            <span>{i.n}</span><Bg text={i.st} color={i.c}/>
          </div>))}
      </Cd>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>SoH Bateria 12m</div>
        <ResponsiveContainer width="100%" height={120}><LineChart data={sohH}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="mes" tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false}/><YAxis tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false} domain={[95,100]}/><Tooltip {...TT(p)}/><Line type="monotone" dataKey="soh" stroke={G} strokeWidth={2} dot={{fill:G,r:2}}/></LineChart></ResponsiveContainer>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Ciclos Acumulados</div>
        <ResponsiveContainer width="100%" height={120}><BarChart data={sohH}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="mes" tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false}/><YAxis tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Bar dataKey="ciclos" fill={A} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
      </Cd>
    </div>
  </>);
}
