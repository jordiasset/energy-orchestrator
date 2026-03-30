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
export default function Root(){
  const[logged,setLogged]=useState(false);
  const[scrollTo,setScrollTo]=useState(null);
  if(!logged) return <Landing onLogin={()=>setLogged(true)} scrollTo={scrollTo} setScrollTo={setScrollTo}/>;
  return <AppDash onLogout={()=>setLogged(false)}/>;
}

// ========== LANDING PAGE ==========
function Landing({onLogin}){
  const[step,setStep]=useState(0);
  const[mob,setMob]=useState(false);
  const[form,setForm]=useState({consumo:15000,potencia:200,fv:0,bat:0,tarifa:"indexada",tipo:"industrial",turnos:1,climatizacion:true});
  const[showCalc,setShowCalc]=useState(false);
  const[loginOpen,setLoginOpen]=useState(false);
  const[anim,setAnim]=useState(0);
  const[pdfLoading,setPdfLoading]=useState(false);
  const[pdfData,setPdfData]=useState(null);
  const[pdfError,setPdfError]=useState(null);
  const[pdfName,setPdfName]=useState(null);
  useEffect(()=>{const c=()=>setMob(window.innerWidth<768);c();window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  useEffect(()=>{const iv=setInterval(()=>setAnim(a=>a+1),2000);return()=>clearInterval(iv)},[]);

  const analyzePDF=async(file)=>{
    setPdfLoading(true);setPdfError(null);setPdfData(null);setPdfName(file.name);
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej(new Error("Error leyendo archivo"));r.readAsDataURL(file)});
      const resp=await fetch("/api/analyze",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({pdf_base64:base64})
      });
      const result=await resp.json();
      if(result.error)throw new Error(result.error);
      const parsed=result.data||JSON.parse(result.raw);
      setPdfData(parsed);
      setForm(f=>({
        ...f,
        consumo:Math.round(parsed.consumo_mensual_kwh||f.consumo),
        potencia:Math.round(parsed.potencia_contratada_kw||f.potencia),
        tarifa:parsed.tarifa||f.tarifa,
        tipo:parsed.tipo_tarifa?.startsWith("6")?"industrial":parsed.tipo_tarifa?.startsWith("3")?"comercial":"comercial",
        fv:parsed.tiene_fv?50:0,
      }));
      setStep(2);
    }catch(e){setPdfError("No se pudo analizar la factura. "+e.message)}
    setPdfLoading(false);
  };

  // Savings calculator
  const consumoAnual=form.consumo*12;
  const costeActual=consumoAnual*(form.tarifa==="indexada"?.12:.14);
  const ahorroMonitor=costeActual*.08; // 8% solo monitorizacion
  const ahorroOrqFV=form.fv>0?form.fv*1400*.13*.62:0; // autoconsumo
  const ahorroOrqBat=form.bat>0?form.bat*365*.14*.7:0; // arbitraje diario
  const ahorroOrqShift=costeActual*.05; // demand shifting
  const ahorroPotencia=form.potencia>100?form.potencia*.15*12*3.5:0; // optimizar pot contratada
  const ahorroTotal=Math.round(ahorroMonitor+ahorroOrqFV+ahorroOrqBat+ahorroOrqShift+ahorroPotencia);
  const pctAhorro=Math.min(35,Math.round(ahorroTotal/costeActual*100));
  const roi=Math.round(4800/Math.max(1,ahorroTotal/12));

  const feats=[
    {ic:"📊",t:"Monitorizacion en Tiempo Real",d:"8+ puntos de medida, gemelo digital de tu planta, analisis por zona. Detecta donde gastas mas y por que."},
    {ic:"🤖",t:"Orquestacion IA",d:"Algoritmo LSTM + FlexMeasures que decide cada hora si comprar red, usar FV o descargar bateria. Aprende de tu patron."},
    {ic:"💰",t:"Ahorro Automatico",d:"Arbitraje OMIE, autoconsumo optimizado, demand shifting. El sistema trabaja 24/7 para reducir tu factura."},
    {ic:"🔮",t:"Prediccion Avanzada",d:"Predice consumo a 30 dias, precios OMIE, produccion solar. Detecta anomalias antes de que sean problemas."},
    {ic:"📋",t:"Reportes Diarios",d:"Cada manana recibes un briefing: que va a hacer el orquestador, alertas pendientes, ahorro previsto."},
    {ic:"⚡",t:"Hardware Industrial",d:"Industrial Shields RPi PLC 21+, doble RS-485, reles, Modbus. Instalacion plug&play en tu cuadro electrico."},
  ];

  const steps=[
    {t:"Tipo de instalacion",fields:[{k:"tipo",l:"Tipo",opts:["industrial","comercial","terciario"]},{k:"turnos",l:"Turnos de trabajo",opts:[1,2,3]}]},
    {t:"Consumo y potencia",fields:[{k:"consumo",l:"Consumo mensual (kWh)",type:"range",min:1000,max:100000,step:500},{k:"potencia",l:"Potencia contratada (kW)",type:"range",min:20,max:2000,step:10}]},
    {t:"Generacion propia",fields:[{k:"fv",l:"Instalacion FV (kWp)",type:"range",min:0,max:500,step:5},{k:"bat",l:"Bateria (kWh)",type:"range",min:0,max:200,step:5}]},
    {t:"Tarifa",fields:[{k:"tarifa",l:"Tipo tarifa",opts:["indexada","fija","mixta"]},{k:"climatizacion",l:"Climatizacion/Frio industrial",opts:[true,false]}]},
  ];

  const insights=["OMIE esta a 0.03 EUR/kWh... cargando bateria","Produccion FV: 92kW pico. Red desconectada","Anomalia detectada: consumo +34% en linea 3","Ahorro hoy: 29.40 EUR. Acumulado mes: 824 EUR"];

  return(
    <div style={{width:"100%",minHeight:"100vh",background:"#fff",fontFamily:"'Segoe UI Variable','Segoe UI',system-ui,sans-serif",color:"#111",overflowX:"hidden"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes pulse2{0%,100%{opacity:1}50%{opacity:.5}}@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}@keyframes typing{from{width:0}to{width:100%}}@keyframes blink{50%{border-color:transparent}}@keyframes spin{to{transform:rotate(360deg)}}.landBtn{padding:12px 28px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;display:inline-flex;align-items:center;gap:8px}.landBtn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.15)}
@media(max-width:768px){.heroGrid{flex-direction:column!important;text-align:center}.featGrid{grid-template-columns:1fr!important}.calcGrid{grid-template-columns:1fr!important}.stepGrid{grid-template-columns:1fr!important}}`}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(255,255,255,.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid #e5e7eb",padding:"0 24px",height:56,display:"flex",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#0078D4,#60CDFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
          <span style={{fontWeight:700,fontSize:18}}>Seinon</span>
        </div>
        <div style={{flex:1}}/>
        {!mob&&<div style={{display:"flex",gap:24,fontSize:13,color:"#666"}}>
          <a href="#features" style={{textDecoration:"none",color:"inherit",cursor:"pointer"}}>Funcionalidades</a>
          <a href="#calculator" style={{textDecoration:"none",color:"inherit",cursor:"pointer"}}>Calculadora</a>
          <a href="#how" style={{textDecoration:"none",color:"inherit",cursor:"pointer"}}>Como funciona</a>
        </div>}
        <div style={{flex:1}}/>
        <button onClick={()=>setLoginOpen(true)} className="landBtn" style={{background:"#0078D4",color:"#fff",padding:"8px 20px",fontSize:12}}>Acceder</button>
      </nav>

      {/* HERO */}
      <section style={{paddingTop:100,paddingBottom:60,background:"linear-gradient(135deg,#f8faff 0%,#eef4ff 50%,#f0f7ff 100%)",overflow:"hidden"}}>
        <div className="heroGrid" style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:50}}>
          <div style={{flex:1,animation:"fadeUp .8s ease"}}>
            <div style={{display:"inline-block",padding:"4px 12px",borderRadius:20,background:"#0078D415",color:"#0078D4",fontSize:12,fontWeight:600,marginBottom:16}}>🤖 Orquestacion Energetica con IA</div>
            <h1 style={{fontSize:mob?32:48,fontWeight:800,lineHeight:1.1,margin:"0 0 16px",letterSpacing:-.5}}>Tu planta consume.<br/><span style={{color:"#0078D4"}}>Seinon decide cuando.</span></h1>
            <p style={{fontSize:17,color:"#555",lineHeight:1.6,margin:"0 0 24px",maxWidth:500}}>Monitorizacion inteligente + orquestacion IA que elige en tiempo real si comprar red, usar solar o descargar bateria. <strong>Sube tu factura y te decimos cuanto ahorras.</strong></p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <button onClick={()=>{setShowCalc(true);document.getElementById("calculator")?.scrollIntoView({behavior:"smooth"})}} className="landBtn" style={{background:"#0078D4",color:"#fff"}}>Calcula tu ahorro →</button>
              <button onClick={()=>setLoginOpen(true)} className="landBtn" style={{background:"#fff",color:"#111",border:"1px solid #ddd"}}>Ver demo en vivo</button>
            </div>
            <div style={{display:"flex",gap:20,marginTop:24}}>
              {[["35%","ahorro medio"],["24/7","autonomo"],["<6 meses","payback"]].map(([v,l])=>(
                <div key={l}><div style={{fontSize:22,fontWeight:700,color:"#0078D4"}}>{v}</div><div style={{fontSize:11,color:"#888"}}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{flex:1,position:"relative",animation:"fadeUp 1s ease .2s both"}}>
            <div style={{background:"#fff",borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,.1)",padding:16,border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:"#0F7B0F",animation:"pulse2 2s infinite"}}/><span style={{fontSize:10,color:"#0F7B0F",fontWeight:600}}>EN VIVO — Planta Demo</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:10}}>
                {[["☀️ FV","67 kW","#F7630C"],["🔋 Bat","82%","#B4A0FF"],["⚡ Red","12 kW","#0078D4"],["💰 OMIE","0.08","#0F7B0F"]].map(([l,v,c])=>(
                  <div key={l} style={{padding:8,borderRadius:6,background:"#f8f9fa",border:"1px solid #e5e7eb",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#888"}}>{l}</div>
                    <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:8,borderRadius:6,background:"#0078D408",border:"1px solid #0078D415",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14}}>🤖</span>
                <div style={{fontSize:10,color:"#333"}}>{insights[anim%insights.length]}</div>
              </div>
            </div>
            <div style={{position:"absolute",bottom:-20,right:-20,width:100,height:100,borderRadius:12,background:"linear-gradient(135deg,#0F7B0F,#4CAF50)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",boxShadow:"0 10px 30px rgba(15,123,15,.3)",animation:"float 3s ease infinite"}}>
              <div style={{fontSize:24,fontWeight:800}}>-35%</div>
              <div style={{fontSize:8}}>factura electrica</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:"60px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <h2 style={{fontSize:32,fontWeight:700,margin:"0 0 8px"}}>Todo lo que necesitas para controlar tu energia</h2>
          <p style={{fontSize:15,color:"#666"}}>Monitorizacion + Orquestacion + IA Predictiva en una sola plataforma</p>
        </div>
        <div className="featGrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
          {feats.map((f,i)=>(
            <div key={i} style={{padding:24,borderRadius:10,border:"1px solid #e5e7eb",background:"#fff",transition:"all .3s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.08)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
              <div style={{fontSize:28,marginBottom:10}}>{f.ic}</div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{f.t}</div>
              <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" style={{padding:"60px 24px",background:"#f8faff"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:30}}>
            <h2 style={{fontSize:32,fontWeight:700,margin:"0 0 8px"}}>Calcula tu ahorro en 60 segundos</h2>
            <p style={{fontSize:15,color:"#666"}}>Sube tu factura o introduce tus datos. Al final te mostramos cuanto puedes ahorrar.</p>
          </div>

          <div style={{background:"#fff",borderRadius:16,padding:mob?20:32,border:"1px solid #e5e7eb",boxShadow:"0 4px 30px rgba(0,0,0,.06)",animation:"fadeUp .5s ease"}}>

            {step<=3?(
              <>
                {/* PDF Upload */}
                <div style={{marginBottom:20,padding:16,borderRadius:10,border:"2px dashed #0078D440",background:pdfData?"#0F7B0F06":pdfLoading?"#0078D406":"#f8faff",transition:"all .3s"}}>
                  {pdfLoading?(
                    <div style={{textAlign:"center",padding:10}}>
                      <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #0078D430",borderTopColor:"#0078D4",animation:"spin 1s linear infinite",margin:"0 auto 10px"}}/>
                      <div style={{fontSize:13,fontWeight:600,color:"#0078D4"}}>Analizando factura con IA...</div>
                      <div style={{fontSize:10,color:"#888",marginTop:4}}>Extrayendo consumo, potencia, tarifa, periodos...</div>
                    </div>
                  ):pdfData?(
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <div style={{width:28,height:28,borderRadius:7,background:"#0F7B0F15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✅</div>
                        <div><div style={{fontSize:12,fontWeight:700,color:"#0F7B0F"}}>Factura analizada correctamente</div><div style={{fontSize:10,color:"#888"}}>{pdfName}</div></div>
                        <button onClick={()=>{setPdfData(null);setPdfName(null);setStep(0)}} style={{marginLeft:"auto",fontSize:10,color:"#888",background:"none",border:"1px solid #ddd",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit"}}>Cambiar</button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:6}}>
                        {[["Consumo",`${(pdfData.consumo_mensual_kwh||0).toLocaleString()} kWh`,"#0078D4"],["Potencia",`${pdfData.potencia_contratada_kw||0} kW`,"#F7630C"],["Importe",`${(pdfData.coste_total_eur||0).toFixed(2)} EUR`,"#C42B1C"]].map(([l,v,c])=>(
                          <div key={l} style={{padding:8,borderRadius:5,background:`${c}08`,border:`1px solid ${c}15`,textAlign:"center"}}>
                            <div style={{fontSize:8,color:"#888"}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {pdfData.resumen&&<div style={{fontSize:10,color:"#555",lineHeight:1.4,padding:6,borderRadius:4,background:"#f8f9fa"}}><strong>IA:</strong> {pdfData.resumen}</div>}
                      <div style={{marginTop:6,padding:6,borderRadius:4,background:"#0078D408",fontSize:10,color:"#0078D4",fontWeight:600,textAlign:"center"}}>✓ Datos extraidos. Ajusta abajo si necesitas.</div>
                    </div>
                  ):(
                    <label style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",padding:8}}>
                      <input type="file" accept=".pdf" onChange={e=>{const f=e.target.files?.[0];if(f)analyzePDF(f)}} style={{display:"none"}}/>
                      <div style={{width:40,height:40,borderRadius:10,background:"#0078D412",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:8}}>📄</div>
                      <div style={{fontSize:13,fontWeight:700,color:"#0078D4",marginBottom:3}}>Sube tu factura de la luz</div>
                      <div style={{fontSize:11,color:"#888",textAlign:"center"}}>La IA extrae automaticamente consumo, potencia y tarifa</div>
                      <div style={{marginTop:8,padding:"6px 16px",borderRadius:6,background:"#0078D4",color:"#fff",fontSize:11,fontWeight:600}}>Seleccionar PDF</div>
                    </label>
                  )}
                  {pdfError&&<div style={{marginTop:6,padding:6,borderRadius:4,background:"#C42B1C08",fontSize:10,color:"#C42B1C"}}>{pdfError}</div>}
                </div>

                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                  <div style={{flex:1,height:1,background:"#e5e7eb"}}/><span style={{fontSize:10,color:"#aaa",flexShrink:0}}>o configura manualmente</span><div style={{flex:1,height:1,background:"#e5e7eb"}}/>
                </div>

                {/* Progress */}
                <div style={{display:"flex",gap:4,marginBottom:20}}>
                  {steps.map((_,i)=>(<div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?"#0078D4":"#e5e7eb",transition:"all .3s"}}/>))}
                </div>
                <div style={{fontSize:11,color:"#888",marginBottom:4}}>Paso {step+1} de {steps.length}</div>
                <div style={{fontSize:20,fontWeight:700,marginBottom:20}}>{steps[step].t}</div>

                {steps[step].fields.map(f=>(
                  <div key={f.k} style={{marginBottom:20}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:8,color:"#444"}}>{f.l}</div>
                    {f.opts?(
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {f.opts.map(o=>{const sel=form[f.k]===o;return(
                          <button key={String(o)} onClick={()=>setForm({...form,[f.k]:o})} style={{padding:"10px 20px",borderRadius:8,border:sel?"2px solid #0078D4":"1px solid #ddd",background:sel?"#0078D410":"#fff",color:sel?"#0078D4":"#666",fontSize:13,fontWeight:sel?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
                            {o===true?"Si":o===false?"No":typeof o==="number"?`${o} turno${o>1?"s":""}`:o.charAt(0).toUpperCase()+o.slice(1)}
                          </button>
                        )})}
                      </div>
                    ):(
                      <div>
                        <input type="range" min={f.min} max={f.max} step={f.step} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:+e.target.value})} style={{width:"100%",accentColor:"#0078D4",height:6}}/>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginTop:4}}>
                          <span>{f.min.toLocaleString()}</span>
                          <span style={{fontSize:18,fontWeight:700,color:"#0078D4"}}>{form[f.k].toLocaleString()}{f.k==="consumo"?" kWh/mes":f.k==="potencia"?" kW":f.k==="fv"?" kWp":" kWh"}</span>
                          <span>{f.max.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
                  <button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0} style={{padding:"10px 24px",borderRadius:8,border:"1px solid #ddd",background:"#fff",color:step===0?"#ccc":"#666",fontSize:13,cursor:step===0?"default":"pointer",fontFamily:"inherit"}}>Anterior</button>
                  {step<steps.length-1?(
                    <button onClick={()=>setStep(step+1)} className="landBtn" style={{background:"#0078D4",color:"#fff",padding:"10px 24px",fontSize:13}}>Siguiente →</button>
                  ):(
                    <button onClick={()=>setStep(4)} className="landBtn" style={{background:"#0F7B0F",color:"#fff",padding:"10px 24px",fontSize:13}}>Ver mi ahorro →</button>
                  )}
                </div>
              </>
            ):(
              /* ===== RESULTS SCREEN (step 4) ===== */
              <div style={{animation:"fadeUp .5s ease"}}>
                <div style={{textAlign:"center",marginBottom:24}}>
                  <div style={{fontSize:40,marginBottom:8}}>🎉</div>
                  <div style={{fontSize:24,fontWeight:800,marginBottom:4}}>Tu ahorro potencial con Seinon</div>
                  <div style={{fontSize:13,color:"#888"}}>Basado en {pdfData?`tu factura de ${pdfData.comercializadora||"electricidad"}`:"los datos que has proporcionado"}</div>
                </div>

                {/* Big number */}
                <div style={{textAlign:"center",padding:24,borderRadius:14,background:"linear-gradient(135deg,#0F7B0F08,#4CAF5012)",border:"2px solid #0F7B0F20",marginBottom:20}}>
                  <div style={{fontSize:12,color:"#0F7B0F",fontWeight:600}}>Ahorro anual estimado</div>
                  <div style={{fontSize:56,fontWeight:800,color:"#0F7B0F",letterSpacing:-3,lineHeight:1}}>{ahorroTotal.toLocaleString()} <span style={{fontSize:24}}>EUR</span></div>
                  <div style={{fontSize:14,color:"#555",marginTop:8}}>Eso es un <strong style={{color:"#0F7B0F",fontSize:18}}>{pctAhorro}%</strong> de tu factura actual de <strong>{Math.round(costeActual).toLocaleString()} EUR/ano</strong></div>
                  <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:14}}>
                    <div style={{padding:"8px 16px",borderRadius:8,background:"#fff",border:"1px solid #e5e7eb"}}><div style={{fontSize:10,color:"#888"}}>ROI estimado</div><div style={{fontSize:20,fontWeight:700,color:"#0078D4"}}>{roi} meses</div></div>
                    <div style={{padding:"8px 16px",borderRadius:8,background:"#fff",border:"1px solid #e5e7eb"}}><div style={{fontSize:10,color:"#888"}}>Ahorro mensual</div><div style={{fontSize:20,fontWeight:700,color:"#0F7B0F"}}>{Math.round(ahorroTotal/12).toLocaleString()} EUR</div></div>
                    <div style={{padding:"8px 16px",borderRadius:8,background:"#fff",border:"1px solid #e5e7eb"}}><div style={{fontSize:10,color:"#888"}}>Ahorro diario</div><div style={{fontSize:20,fontWeight:700,color:"#F7630C"}}>{(ahorroTotal/365).toFixed(1)} EUR</div></div>
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Desglose del ahorro</div>
                  {[
                    {l:"Monitorizacion + deteccion anomalias",v:Math.round(ahorroMonitor),d:"Optimizacion cos phi, consumo standby, eficiencia",c:"#0078D4",pct:Math.round(ahorroMonitor/ahorroTotal*100)},
                    {l:"Autoconsumo FV optimizado",v:Math.round(ahorroOrqFV),d:form.fv>0?`${form.fv}kWp al 62% autoconsumo con orquestacion`:"Sin FV instalada — con FV ahorrarias mas",c:"#F7630C",pct:Math.round(ahorroOrqFV/ahorroTotal*100)},
                    {l:"Arbitraje bateria (comprar valle, usar punta)",v:Math.round(ahorroOrqBat),d:form.bat>0?`${form.bat}kWh x spread 0.14 EUR/kWh x 365 dias`:"Sin bateria — el arbitraje aporta gran ahorro",c:"#B4A0FF",pct:Math.round(ahorroOrqBat/ahorroTotal*100)},
                    {l:"Demand shifting IA (mover cargas a valle)",v:Math.round(ahorroOrqShift),d:"El algoritmo mueve automaticamente el 5% de carga a horas baratas",c:"#0F7B0F",pct:Math.round(ahorroOrqShift/ahorroTotal*100)},
                    {l:"Optimizar potencia contratada",v:Math.round(ahorroPotencia),d:`Potencia actual: ${form.potencia}kW — posible reduccion del 15%`,c:"#C42B1C",pct:Math.round(ahorroPotencia/ahorroTotal*100)},
                  ].map((r,i)=>(
                    <div key={i} style={{padding:"10px 0",borderBottom:i<4?"1px solid #f0f0f0":"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600}}>{r.l}</span>
                        <span style={{fontSize:15,fontWeight:700,color:r.v>0?r.c:"#ccc"}}>{r.v>0?`${r.v.toLocaleString()} EUR`:"-"}</span>
                      </div>
                      <div style={{fontSize:10,color:"#999",marginBottom:4}}>{r.d}</div>
                      {r.v>0&&<div style={{height:6,borderRadius:3,background:"#f0f0f0",overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:r.c,width:`${Math.max(5,r.pct)}%`,transition:"width 1s ease"}}/></div>}
                    </div>
                  ))}
                </div>

                {/* Datos usados */}
                <div style={{padding:14,borderRadius:8,background:"#f8f9fa",border:"1px solid #e5e7eb",marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Datos utilizados para el calculo</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[["Consumo mensual",`${form.consumo.toLocaleString()} kWh`],["Potencia contratada",`${form.potencia} kW`],["Tarifa",form.tarifa],["Tipo",form.tipo],["FV instalada",form.fv>0?`${form.fv} kWp`:"No"],["Bateria",form.bat>0?`${form.bat} kWh`:"No"]].map(([l,v])=>(
                      <div key={l}><div style={{fontSize:9,color:"#888"}}>{l}</div><div style={{fontSize:12,fontWeight:600}}>{v}</div></div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div style={{display:"flex",gap:10,marginBottom:12}}>
                  <button onClick={()=>setLoginOpen(true)} className="landBtn" style={{flex:1,background:"#0078D4",color:"#fff",justifyContent:"center",padding:"14px 0",fontSize:15}}>Solicitar demo personalizada →</button>
                  <button onClick={()=>setStep(0)} className="landBtn" style={{background:"#fff",color:"#666",border:"1px solid #ddd",padding:"14px 20px",fontSize:13}}>Recalcular</button>
                </div>
                <div style={{textAlign:"center",fontSize:10,color:"#aaa"}}>Sin compromiso. Te mostramos el dashboard real con datos de tu planta.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{padding:"60px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <h2 style={{fontSize:32,fontWeight:700,margin:"0 0 8px"}}>Como funciona</h2>
          <p style={{fontSize:15,color:"#666"}}>De la instalacion al ahorro en 4 pasos</p>
        </div>
        <div className="stepGrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16}}>
          {[
            {n:"1",t:"Instalamos el PLC",d:"Industrial Shields RPi PLC 21+ en tu cuadro electrico. Conexion Modbus a tus contadores e inversores. 2 horas.",ic:"🔧"},
            {n:"2",t:"Conectamos Seinon",d:"El PLC envia datos en tiempo real a la nube. Configuramos zonas, puntos de medida y alarmas. 1 hora.",ic:"📡"},
            {n:"3",t:"La IA aprende",d:"En 7 dias el algoritmo LSTM aprende tu patron de consumo, precios OMIE y produccion solar. Empieza a optimizar.",ic:"🧠"},
            {n:"4",t:"Ahorras 24/7",d:"El orquestador decide cada hora la fuente optima. Tu recibes un briefing diario. Sin intervencion manual.",ic:"💰"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:20}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"#0078D410",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 12px"}}>{s.ic}</div>
              <div style={{fontSize:11,color:"#0078D4",fontWeight:600,marginBottom:4}}>PASO {s.n}</div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{s.t}</div>
              <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"50px 24px",background:"linear-gradient(135deg,#0078D4,#60CDFF)",textAlign:"center"}}>
        <h2 style={{fontSize:28,fontWeight:700,color:"#fff",margin:"0 0 10px"}}>Empieza a ahorrar hoy</h2>
        <p style={{fontSize:15,color:"rgba(255,255,255,.8)",margin:"0 0 20px"}}>Sin compromiso. Conecta tu planta y ve resultados en la primera semana.</p>
        <button onClick={()=>setLoginOpen(true)} className="landBtn" style={{background:"#fff",color:"#0078D4",fontSize:15,padding:"14px 32px"}}>Acceder a Seinon →</button>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"30px 24px",background:"#111",color:"#888",fontSize:11,textAlign:"center"}}>
        <div>Seinon — Orquestacion Energetica Inteligente</div>
        <div style={{marginTop:4}}>Certex Innova S.L. — Industrial Shields RPi PLC 21+ — FlexMeasures</div>
      </footer>

      {/* LOGIN MODAL */}
      {loginOpen&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setLoginOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:32,maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.2)",animation:"fadeUp .3s ease"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#0078D4,#60CDFF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 12px"}}>⚡</div>
              <div style={{fontSize:20,fontWeight:700}}>Acceder a Seinon</div>
              <div style={{fontSize:12,color:"#888",marginTop:4}}>Entra a tu panel de monitorizacion y orquestacion</div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,marginBottom:4,color:"#444"}}>Email</div>
              <input type="email" placeholder="jordi@certexinnova.com" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:600,marginBottom:4,color:"#444"}}>Contrasena</div>
              <input type="password" placeholder="••••••••" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:13,fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <button onClick={onLogin} className="landBtn" style={{background:"#0078D4",color:"#fff",width:"100%",justifyContent:"center",padding:"12px 0",fontSize:14}}>Entrar →</button>
            <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#888"}}>Demo: cualquier email/password</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SAAS DASHBOARD ==========
function AppDash(p2){
  const[tab,setTab]=useState("dash");const[sim,setSim]=useState(true);const[tick,setTick]=useState(0);const[col,setCol]=useState(true);const[mob,setMob]=useState(false);
  useEffect(()=>{const c=()=>{const m=window.innerWidth<768;setMob(m);if(m)setCol(true)};c();window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c)},[]);
  useEffect(()=>{if(!sim)return;const iv=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(iv)},[sim]);
  const pvN=+(pvH[HR]?.pv+Math.sin(tick*.3)*3).toFixed(1),socN=+Math.min(99,Math.max(12,batH[HR]?.soc+Math.sin(tick*.2)*2)).toFixed(0),gridN=+(Math.max(0,55-pvN+Math.sin(tick*.4)*5)).toFixed(1),conN=+(pvN+gridN+(socN>50?-5:8)).toFixed(1),omieN=omie[HR]?.precio||.08;
  const dec=omieN>.12?"BATERIA":pvN>30?"FOTOVOLTAICA":"RED",decC=dec==="BATERIA"?D:dec==="FOTOVOLTAICA"?G:A;
  const sf="#fff",sf2="#f8f9fa",tx="#111",tx2="#666",bd="#e2e5e9",sh="0 1px 8px rgba(0,0,0,.06)";
  const p={sf,sf2,tx,tx2,bd,sh,A,G,W,D,P,pvN,socN,gridN,conN,omieN,dec,decC,tick,HR,mob};
  const nav=[{id:"dash",ic:BarChart3,l:"Dashboard"},{id:"monitor",ic:Eye,l:"Monitorizacion"},{id:"orq",ic:Brain,l:"Orquestacion IA"},{id:"report",ic:FileText,l:"Reportes"},{id:"alertas",ic:Bell,l:"Alertas"},{id:"fin",ic:CircleDollarSign,l:"Financiero"},{id:"sys",ic:Layers,l:"Sistema"}];
  const R=()=>{switch(tab){case"dash":return <Pg1 {...p}/>;case"monitor":return <Pg2 {...p}/>;case"orq":return <Pg3 {...p}/>;case"report":return <PgReport {...p}/>;case"alertas":return <Pg4 {...p}/>;case"fin":return <Pg5 {...p}/>;case"sys":return <Pg6 {...p}/>;default:return null}};
  return(
    <div style={{width:"100%",height:"100vh",background:"#f0f2f5",color:tx,fontFamily:"'Segoe UI Variable','Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes glow{0%,100%{box-shadow:0 0 6px ${A}33}50%{box-shadow:0 0 16px ${A}55}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.g6{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.g8{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}.gSide{display:grid;grid-template-columns:1fr 280px;gap:10px}.g3fr2fr{display:grid;grid-template-columns:3fr 2fr;gap:10px}.gDecs{display:grid;grid-template-columns:repeat(6,1fr);gap:0}.gStrat{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
@media(max-width:768px){.g2,.g3,.g4,.g5,.g6,.gSide,.g3fr2fr,.gStrat{grid-template-columns:1fr}.g8{grid-template-columns:repeat(4,1fr)}.gDecs{grid-template-columns:repeat(3,1fr);gap:4px}}`}</style>
      <header style={{height:44,background:"rgba(255,255,255,.85)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",padding:"0 14px",borderBottom:`1px solid ${bd}`,gap:10,flexShrink:0,zIndex:50}}>
        <IB onClick={()=>setCol(!col)} c={tx2}><Menu size={15}/></IB>
        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:26,height:26,borderRadius:6,background:`linear-gradient(135deg,${A},${AL})`,display:"flex",alignItems:"center",justifyContent:"center"}}><PlugZap size={13} color="#fff"/></div><span style={{fontWeight:700,fontSize:13.5}}>Seinon</span><span style={{fontSize:9,color:"#fff",background:G,padding:"1px 6px",borderRadius:8,fontWeight:600}}>LIVE</span></div>
        <div style={{flex:1}}/>
        {!mob&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:tx2}}><Cpu size={11}/>RPi PLC 21+ <span style={{display:"flex",alignItems:"center",gap:3,marginLeft:8}}><span style={{width:5,height:5,borderRadius:"50%",background:G,animation:"pulse 2s infinite"}}/><span style={{color:G}}>Online</span></span></div>}
        {mob&&<span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:5,height:5,borderRadius:"50%",background:G,animation:"pulse 2s infinite"}}/></span>}
        <IB c={tx2} onClick={()=>setSim(!sim)}>{sim?<Pause size={13}/>:<Play size={13}/>}</IB>{!mob&&<IB c={tx2}><Bell size={13}/></IB>}<IB c={tx2}><Settings size={13}/></IB>
        <button onClick={p2?.onLogout} style={{padding:"4px 10px",borderRadius:4,border:"1px solid #ddd",background:"#fff",color:"#666",fontSize:10,cursor:"pointer",fontFamily:"inherit",marginLeft:4}}>Salir</button>
      </header>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <nav style={{width:col?(mob?0:48):165,flexShrink:0,background:"rgba(255,255,255,.95)",backdropFilter:"blur(20px)",borderRight:col&&mob?"none":`1px solid ${bd}`,padding:col&&mob?"0":"6px 3px",transition:"width .3s ease",display:"flex",flexDirection:"column",overflow:"hidden",...(mob&&!col?{position:"absolute",left:0,top:44,bottom:0,zIndex:40,width:200,boxShadow:"4px 0 20px rgba(0,0,0,.1)"}:{})}}>
          {mob&&!col&&<div onClick={()=>setCol(true)} style={{position:"fixed",left:200,top:44,right:0,bottom:0,background:"rgba(0,0,0,.2)",zIndex:39}}/>}
          {nav.map(n=>{const ac=tab===n.id,Ic=n.ic;return(<button key={n.id} onClick={()=>{setTab(n.id);if(mob)setCol(true)}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:col?"9px 14px":"8px 10px",background:ac?"#e8edf2":"transparent",border:"none",borderRadius:5,cursor:"pointer",color:ac?tx:tx2,fontSize:12,fontWeight:ac?600:400,fontFamily:"inherit",textAlign:"left",position:"relative",transition:"all .15s",marginBottom:1}} onMouseEnter={e=>{if(!ac)e.currentTarget.style.background="#f0f0f0"}} onMouseLeave={e=>{if(!ac)e.currentTarget.style.background="transparent"}}>{ac&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:14,borderRadius:2,background:A}}/>}<Ic size={15}/>{!col&&<span>{n.l}</span>}</button>)})}
          {!col&&<div style={{marginTop:"auto",padding:"8px 10px",borderTop:`1px solid ${bd}`,fontSize:9,color:tx2}}><div style={{display:"flex",alignItems:"center",gap:4}}><Wifi size={10} color={G}/>Modbus OK - 8 medidores</div><div style={{marginTop:2}}>Planta 4 - Certex Innova</div></div>}
        </nav>
        <main style={{flex:1,overflow:"auto",padding:mob?10:16}}><div style={{animation:"fadeUp .3s ease"}} key={tab}>{R()}</div></main>
      </div>
    </div>
  );
}

// ========== ATOMS ==========
function IB({children,onClick,c}){return <button onClick={onClick} style={{background:"none",border:"none",color:c,cursor:"pointer",padding:5,borderRadius:4,display:"flex",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,.04)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{children}</button>}
function Cd({children,style={},s="#fff",sh:shadow,bd:border}){return <div style={{background:s,borderRadius:7,padding:14,border:`1px solid ${border}`,boxShadow:shadow,...style}}>{children}</div>}
function Bg({text,color}){return <span style={{padding:"2px 7px",borderRadius:9,fontSize:9,fontWeight:600,background:`${color}12`,color}}>{text}</span>}
function TT(p){return{contentStyle:{background:"#fff",border:`1px solid ${p.bd}`,borderRadius:7,fontSize:10,boxShadow:p.sh}}}
function Hd({t,sub,children}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}><div><h1 style={{fontSize:18,fontWeight:700,margin:0}}>{t}</h1>{sub&&<p style={{fontSize:11,color:"#666",margin:"2px 0 0"}}>{sub}</p>}</div>{children}</div>}
function Mi({ic:Ic,l,v,u,color,sub,p}){return(<Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:10}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><div style={{width:24,height:24,borderRadius:5,background:`${color}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={12} color={color}/></div><span style={{fontSize:9,color:p.tx2}}>{l}</span></div><div style={{fontSize:17,fontWeight:700,letterSpacing:-.5}}>{v}{u&&<span style={{fontSize:10,fontWeight:400,color:p.tx2}}> {u}</span>}</div>{sub&&<Bg text={sub} color={color}/>}</Cd>)}

// ========== 1. DASHBOARD ==========
function Pg1(p){
  const SI=p.socN>70?BatteryFull:p.socN>30?BatteryMedium:BatteryLow;
  const ins=["Anomalia: consumo nocturno +34% en linea 3. Equipo no apagado detectado por IA.","Pico OMIE previsto 20h: 0.24/kWh. Bateria reservada 80% para descarga.","Manana nubes 40%: precarga nocturna a 0.03/kWh programada.","Compresor ppal: consumo +22% en 6m. IA recomienda sustitucion motor."][p.tick%4];
  return(<>
    <Hd t="Dashboard General" sub="Monitorizacion + Orquestacion IA - Planta 4"><div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:7,background:`${p.decC}08`,border:`2px solid ${p.decC}25`,animation:"glow 3s infinite"}}><Zap size={14} color={p.decC}/><div><div style={{fontSize:9,color:p.tx2}}>Fuente</div><div style={{fontSize:14,fontWeight:700,color:p.decC}}>{p.dec}</div></div></div></Hd>
    {/* AI Banner */}
    <div style={{padding:"8px 12px",borderRadius:7,background:`linear-gradient(135deg,${A}06,${P}06)`,border:`1px solid ${A}18`,marginBottom:10,display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
      <div style={{width:28,height:28,borderRadius:7,background:`${A}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Brain size={14} color={A}/></div>
      <div style={{flex:1}}><div style={{fontSize:9,color:A,fontWeight:600}}>IA INSIGHT</div><div style={{fontSize:11}}>{ins}</div></div><Bg text="94%" color={A}/>
    </div>
    {/* KPIs - 8 across */}
    <div className="g8" style={{marginBottom:10}}>
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
    <div className="g2" style={{marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>OMIE + Prediccion IA</div>
        <ResponsiveContainer width="100%" height={130}><ComposedChart data={pricePred}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><ReferenceLine y={.12} stroke={D} strokeDasharray="3 3"/><Area type="monotone" dataKey="upper" stroke="none" fill={`${P}12`}/><Area type="monotone" dataKey="lower" stroke="none" fill={p.sf}/><Line type="monotone" dataKey="real" stroke={A} strokeWidth={2} dot={false}/><Line type="monotone" dataKey="pred" stroke={P} strokeWidth={1.5} strokeDasharray="4 3" dot={false}/></ComposedChart></ResponsiveContainer>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Flujo Energetico</div>
        <ResponsiveContainer width="100%" height={130}><AreaChart data={pFlow}><defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={W} stopOpacity={.3}/><stop offset="95%" stopColor={W} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={3}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false}/><Tooltip {...TT(p)}/><Area type="monotone" dataKey="pv" stroke={W} fill="url(#pG)" strokeWidth={2} name="FV"/><Area type="monotone" dataKey="red" stroke={A} fill={`${A}12`} strokeWidth={1.5} name="Red"/><Line type="monotone" dataKey="consumo" stroke={p.tx} strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer>
      </Cd>
    </div>
    {/* Strategy of the Day */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:14,marginBottom:10,borderLeft:`4px solid ${A}`}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${A}15,${P}15)`,display:"flex",alignItems:"center",justifyContent:"center"}}><Brain size={16} color={A}/></div>
        <div><div style={{fontSize:14,fontWeight:700}}>Estrategia de Consumo - Hoy</div><div style={{fontSize:10,color:p.tx2}}>Generada por Seinon IA a las 00:05 - Actualizada con intradiario a las 12:15</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:4}}><Bg text="Optimizando" color={G}/><Bg text="Ahorro est. 29.40" color={G}/></div>
      </div>
      <div className="gDecs" style={{marginBottom:12}}>
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
      <div className="g3" style={{gap:10}}>
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
    <div className="g3">
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Gemelo Digital - Planta 4</div>
        <div style={{position:"relative",width:"100%",paddingBottom:"55%",background:p.sf2,borderRadius:6,border:`1px solid ${p.bd}`}}>
          {zones.map(z=>{const bg=z.st==="alert"?`${D}15`:z.st==="warn"?`${W}15`:`${G}08`;const bc=z.st==="alert"?D:z.st==="warn"?W:p.bd;return <div key={z.name} style={{position:"absolute",left:`${z.x}%`,top:`${z.y}%`,width:`${z.w}%`,height:`${z.h}%`,background:bg,border:`1.5px solid ${bc}`,borderRadius:5,padding:4,display:"flex",flexDirection:"column",justifyContent:"space-between",cursor:"pointer"}}><div style={{fontSize:8,fontWeight:600}}>{z.name}</div><div style={{display:"flex",justifyContent:"space-between",fontSize:7,color:p.tx2}}><span>{z.kw}kW</span><span>{z.temp}C</span></div></div>})}
        </div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Bateria + Prevision Solar</div>
        <ResponsiveContainer width="100%" height={80}><AreaChart data={batH}><defs><linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={P} stopOpacity={.35}/><stop offset="95%" stopColor={P} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="hora" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} domain={[0,100]}/><Area type="monotone" dataKey="soc" stroke={P} fill="url(#bG)" strokeWidth={2}/></AreaChart></ResponsiveContainer>
        <div className="g5" style={{gap:3,marginTop:6}}>{forecast.map(f=>{const Ic=f.ic;return <div key={f.d} style={{textAlign:"center",padding:3,borderRadius:4,background:p.sf2,border:`1px solid ${p.bd}`}}><div style={{fontSize:7,fontWeight:600}}>{f.d}</div><Ic size={14} color={f.c} style={{margin:"2px auto",display:"block"}}/><div style={{fontSize:9,fontWeight:700,color:f.c}}>{f.pv}</div></div>})}</div>
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
    <div className="gSide" style={{marginBottom:10}}>
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
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:500}}>
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
      </table></div>
    </Cd>
    {/* Realtime charts per zone */}
    <div className="g3">
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
    <div className="g6" style={{marginBottom:8}}>
      <Mi ic={Brain} l="Modelo" v="LSTM" color={A} sub="v3.2" p={p}/><Mi ic={Target} l="MAPE" v="5.8%" color={G} p={p}/><Mi ic={AlertTriangle} l="Anomalias" v="5" color={D} sub="mes" p={p}/><Mi ic={Lightbulb} l="Recomend." v="6" color={W} p={p}/><Mi ic={CircleDollarSign} l="Ahorro IA" v="2,390" color={G} sub="/mes" p={p}/><Mi ic={ShieldCheck} l="Uptime" v="99.9%" color={G} p={p}/>
    </div>
    {/* Predictions */}
    <div className="g2" style={{marginBottom:8}}>
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
      <div style={{overflowX:"auto"}}>
      {anomalies.map((a,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 80px 50px 1fr",gap:8,alignItems:"center",padding:"7px 0",borderBottom:i<anomalies.length-1?`1px solid ${p.bd}`:"none",fontSize:10,minWidth:600}}>
        <div><div style={{fontWeight:600,fontSize:9}}>{a.fecha}</div><Bg text={a.sev} color={a.sev==="alta"?D:a.sev==="media"?W:A}/></div>
        <div><div style={{fontWeight:600}}>{a.tipo}</div><div style={{fontSize:9,color:p.tx2}}>{a.desc}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:D}}>{a.imp}</div></div>
        <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:A}}>{a.conf}%</div>
        <div style={{padding:"4px 8px",borderRadius:4,background:`${G}06`,fontSize:9}}><strong style={{color:G}}>→</strong> {a.acc}</div>
      </div>))}
      </div>
    </Cd>
    {/* Recommendations */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>Recomendaciones IA</span><Bg text="Potencial: 2,390/mes" color={G}/></div>
      <div className="g3" style={{gap:6}}>
        {aiRecs.map((r,i)=>{const Ic=r.ic;return(<div key={i} style={{padding:10,borderRadius:6,border:`1px solid ${p.bd}`,background:p.sf2}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:28,height:28,borderRadius:6,background:`${A}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={14} color={A}/></div><div style={{fontSize:10,fontWeight:700}}>{r.t}</div></div>
          <div style={{fontSize:9,color:p.tx2,marginBottom:4,lineHeight:1.3}}>{r.d}</div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}><Bg text={`${r.s}/m`} color={G}/><Bg text={r.dif} color={r.dif==="Facil"?G:r.dif==="Media"?W:A}/><Bg text={`${r.prob}%`} color={A}/></div>
        </div>)})}
      </div>
    </Cd>
    {/* Pattern + Projection + Simulator + Compare + Schedule */}
    <div className="g2" style={{marginBottom:8}}>
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
    <div className="g2" style={{marginBottom:8}}>
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
        <div className="g3" style={{marginBottom:6}}>
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
      <div className="gDecs" style={{gap:5}}>
        {decs.map((d,i)=>{const Ic=d.ic;return <div key={i} style={{padding:"8px 6px",borderRadius:5,border:`1px solid ${p.bd}`,background:p.sf2,textAlign:"center"}}><Ic size={16} color={d.c} style={{margin:"0 auto 3px",display:"block"}}/><div style={{fontSize:9,fontWeight:700}}>{d.h}</div><div style={{fontSize:8,marginTop:1}}>{d.a}</div><div style={{fontSize:11,fontWeight:700,color:G,marginTop:3}}>{d.s}</div></div>})}
      </div>
      <div style={{marginTop:6,padding:6,borderRadius:5,background:`${G}06`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:G,fontWeight:600}}>Total ahorro IA hoy</span><span style={{fontSize:18,fontWeight:700,color:G}}>29.40</span></div>
    </Cd>

    {/* GESTION DE EXCEDENTES */}
    <div style={{marginTop:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div style={{width:30,height:30,borderRadius:8,background:`${G}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><TrendingUp size={16} color={G}/></div>
        <div><div style={{fontSize:15,fontWeight:700}}>Gestion de Excedentes</div><div style={{fontSize:10,color:p.tx2}}>Venta a red, compensacion y optimizacion de vertido</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:4}}><Bg text="RD 244/2019" color={A}/><Bg text="Compensacion simplificada" color={G}/></div>
      </div>

      {/* KPIs excedentes */}
      <div className="g6" style={{marginBottom:8}}>
        <Mi ic={TrendingUp} l="Excedentes hoy" v="142" u="kWh" color={G} p={p}/>
        <Mi ic={CircleDollarSign} l="Valor vertido" v="8.52" color={G} sub="0.06/kWh" p={p}/>
        <Mi ic={SunMedium} l="Autoconsumo" v="62%" color={W} p={p}/>
        <Mi ic={Zap} l="Vertido evitable" v="38" u="kWh" color={D} sub="a bateria" p={p}/>
        <Mi ic={CircleDollarSign} l="Ingresos mes" v="186" color={G} sub="excedentes" p={p}/>
        <Mi ic={TrendingUp} l="Ingresos anual" v="2,232" color={A} sub="proyectado" p={p}/>
      </div>

      <div className="g2" style={{marginBottom:8}}>
        {/* Weekly surplus pattern */}
        <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>Excedentes por Dia de Semana</span><Bg text="Fin de semana = oportunidad" color={W}/></div>
          <ResponsiveContainer width="100%" height={130}><BarChart data={[
            {d:"Lun",exc:18,auto:82,precio:.061},{d:"Mar",exc:15,auto:85,precio:.058},{d:"Mie",exc:20,auto:80,precio:.063},
            {d:"Jue",exc:16,auto:84,precio:.059},{d:"Vie",exc:22,auto:78,precio:.067},
            {d:"Sab",exc:48,auto:52,precio:.072},{d:"Dom",exc:55,auto:45,precio:.074}
          ]}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="d" tick={{fill:p.tx2,fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false} unit="%"/><Tooltip {...TT(p)}/><Bar dataKey="auto" stackId="1" fill={G} radius={[0,0,0,0]} name="Autoconsumo %"/><Bar dataKey="exc" stackId="1" fill={W} radius={[3,3,0,0]} name="Excedente %"/></BarChart></ResponsiveContainer>
          <div style={{padding:8,borderRadius:5,background:`${W}06`,border:`1px solid ${W}12`,fontSize:10,marginTop:6}}>
            <strong style={{color:W}}>Insight IA:</strong> Los fines de semana el excedente sube al 48-55% porque la planta consume un 40% menos. El orquestador prioriza: 1) cargar bateria al 100%, 2) verter a red en horas de mayor precio OMIE, 3) precarga para el lunes.
          </div>
        </Cd>

        {/* Hourly strategy */}
        <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>Estrategia de Vertido Optimo (Sabado)</span><Bg text="IA optimiza hora" color={A}/></div>
          <ResponsiveContainer width="100%" height={130}><ComposedChart data={Array.from({length:24},(_,h)=>{
            const pv=h>=7&&h<=20?Math.max(0,Math.sin((h-7)/13*Math.PI)*92):0;
            const con=h<6?12:h<9?18:h<17?25:h<20?20:15;
            const exc=Math.max(0,pv-con);
            const precio=omie[h]?.precio||.05;
            return{h:`${String(h).padStart(2,"0")}`,pv:+pv.toFixed(0),con,exc:+exc.toFixed(0),precio:+(precio*100).toFixed(1)};
          })}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="h" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} interval={2}/><YAxis yAxisId="kw" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} unit="kW"/><YAxis yAxisId="pr" orientation="right" tick={{fill:p.tx2,fontSize:7}} axisLine={false} tickLine={false} unit="c"/><Tooltip {...TT(p)}/><Area yAxisId="kw" type="monotone" dataKey="exc" fill={`${G}30`} stroke={G} strokeWidth={2} name="Excedente kW"/><Line yAxisId="kw" type="monotone" dataKey="con" stroke={A} strokeWidth={1.5} dot={false} name="Consumo kW"/><Line yAxisId="pr" type="monotone" dataKey="precio" stroke={D} strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="OMIE c/kWh"/></ComposedChart></ResponsiveContainer>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:4}}>{[["Excedente",G],["Consumo",A],["Precio OMIE",D]].map(([l,c])=><span key={l} style={{fontSize:8,display:"flex",alignItems:"center",gap:3,color:p.tx2}}><span style={{width:8,height:3,borderRadius:1,background:c,display:"inline-block"}}/>{l}</span>)}</div>
        </Cd>
      </div>

      {/* Strategy decisions for surplus */}
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>Decisiones IA sobre Excedentes - Sabado Tipo</span><Bg text="Ingreso estimado: 11.80" color={G}/></div>
        <div className="g3" style={{gap:6}}>
          {[
            {h:"07:00-09:00",ic:BatteryCharging,c:P,acc:"FV a bateria",desc:"Produccion FV aun baja (15-30kW). Toda la FV va a cargar bateria antes de que suba el excedente. SoC 40% a 65%.",valor:"0 vertido"},
            {h:"09:00-11:00",ic:Battery,c:P,acc:"Bateria al 100%",desc:"FV sube a 60kW, consumo solo 22kW. Excedente carga bateria hasta 100%. El resto empieza a verter a red.",valor:"+1.20"},
            {h:"11:00-14:00",ic:TrendingUp,c:G,acc:"Vertido maximo a red",desc:"FV en pico (85-92kW), consumo 25kW, bateria llena. Excedente de 60kW vertido a red. OMIE en 0.06-0.08/kWh.",valor:"+5.40"},
            {h:"14:00-17:00",ic:TrendingUp,c:W,acc:"Vertido + reserva",desc:"FV baja gradualmente. El orquestador reserva 20% bateria para punta de la tarde (OMIE a 0.15). Resto vierte.",valor:"+3.20"},
            {h:"17:00-20:00",ic:Zap,c:D,acc:"Descarga en punta",desc:"OMIE sube a 0.15-0.20/kWh. En vez de verter a 0.06, descargamos bateria y vendemos a precio punta. Diferencial: +0.12/kWh.",valor:"+2.00"},
            {h:"20:00-00:00",ic:Plug,c:A,acc:"Red valle + precarga",desc:"Sin FV. Compramos red a 0.04/kWh para consumo nocturno y precarga de bateria para el domingo.",valor:"-0.80"},
          ].map((d,i)=>{const Ic=d.ic;return(
            <div key={i} style={{padding:10,borderRadius:6,border:`1px solid ${p.bd}`,background:p.sf2}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:26,height:26,borderRadius:6,background:`${d.c}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic size={13} color={d.c}/></div>
                <div><div style={{fontSize:10,fontWeight:700,color:d.c}}>{d.h}</div><div style={{fontSize:10,fontWeight:600}}>{d.acc}</div></div>
                <span style={{marginLeft:"auto",fontSize:12,fontWeight:700,color:d.valor.startsWith("-")?D:G}}>{d.valor}</span>
              </div>
              <div style={{fontSize:9,color:p.tx2,lineHeight:1.4}}>{d.desc}</div>
            </div>
          )})}
        </div>
      </Cd>

      {/* Revenue summary + comparison */}
      <div className="g2" style={{marginBottom:8}}>
        <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Ingresos Mensuales por Excedentes</div>
          <ResponsiveContainer width="100%" height={120}><BarChart data={[
            {m:"Oct",comp:120,venta:45},{m:"Nov",comp:95,venta:35},{m:"Dic",comp:80,venta:28},
            {m:"Ene",comp:85,venta:30},{m:"Feb",comp:110,venta:42},{m:"Mar",comp:145,venta:55}
          ]}><CartesianGrid strokeDasharray="3 3" stroke={p.bd} vertical={false}/><XAxis dataKey="m" tick={{fill:p.tx2,fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:p.tx2,fontSize:8}} axisLine={false} tickLine={false} unit=" EUR"/><Tooltip {...TT(p)}/><Bar dataKey="comp" fill={G} radius={[0,0,0,0]} name="Compensacion"/><Bar dataKey="venta" fill={A} radius={[3,3,0,0]} name="Venta punta"/></BarChart></ResponsiveContainer>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:4}}>{[["Compensacion simplificada",G],["Venta en punta (bateria)",A]].map(([l,c])=><span key={l} style={{fontSize:8,display:"flex",alignItems:"center",gap:3,color:p.tx2}}><span style={{width:8,height:8,borderRadius:2,background:c,display:"inline-block"}}/>{l}</span>)}</div>
        </Cd>
        <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Resumen Anual Excedentes</div>
          {[
            {l:"Excedentes totales vertidos",v:"17,520 kWh",c:W},
            {l:"Compensacion en factura",v:"1,051 EUR",d:"17,520 kWh x 0.06 EUR/kWh medio",c:G},
            {l:"Ingreso extra por venta punta",v:"686 EUR",d:"Bateria descargada en OMIE punta fines de semana",c:A},
            {l:"Vertido evitable (a bateria)",v:"4,380 kWh",d:"Con 2a bateria capturas 250 EUR/ano mas",c:D},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<3?`1px solid ${p.bd}`:"none"}}>
              <div><div style={{fontSize:10,fontWeight:600}}>{r.l}</div>{r.d&&<div style={{fontSize:8,color:p.tx2}}>{r.d}</div>}</div>
              <span style={{fontSize:13,fontWeight:700,color:r.c}}>{r.v}</span>
            </div>
          ))}
          <div style={{marginTop:8,padding:8,borderRadius:5,background:`${G}06`,border:`1px solid ${G}12`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:11,fontWeight:700,color:G}}>Total ingresos anuales excedentes</div><div style={{fontSize:9,color:p.tx2}}>Compensacion + venta punta con bateria</div></div>
              <div style={{fontSize:22,fontWeight:800,color:G}}>1,737 EUR</div>
            </div>
          </div>
        </Cd>
      </div>

      {/* AI recommendation */}
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12,borderLeft:`4px solid ${G}`}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{width:28,height:28,borderRadius:7,background:`${G}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}><Lightbulb size={14} color={G}/></div>
          <div>
            <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>Recomendacion IA: Maximizar ingresos por excedentes</div>
            <div style={{fontSize:10,color:p.tx2,lineHeight:1.5}}>
              El analisis de 6 meses muestra que los <strong>fines de semana generas un 48-55% de excedente</strong> que actualmente se compensa a precio pool (0.06 EUR/kWh de media). Con la estrategia de Seinon de <strong>almacenar en bateria y vender en punta</strong>, el ingreso medio sube a 0.14 EUR/kWh — un <strong>133% mas por cada kWh excedente</strong>. Si instalas una 2a bateria de 5kWh (coste ~3,500 EUR), capturas 4,380 kWh adicionales de excedente que hoy se pierden a precio bajo, generando <strong>250 EUR/ano extra</strong>. Payback de la bateria extra: 14 meses considerando solo excedentes.
            </div>
          </div>
        </div>
      </Cd>
    </div>
  </>);
}

// ========== REPORTES ==========
function PgReport(p){
  const hoy=new Date();
  const fecha=hoy.toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const hora=hoy.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
  const reportes=[
    {fecha:"27/03/2026",tipo:"Diario",estado:"Enviado",canal:"Telegram + Email",ahorro:"29.40"},
    {fecha:"26/03/2026",tipo:"Diario",estado:"Enviado",canal:"Telegram + Email",ahorro:"31.20"},
    {fecha:"25/03/2026",tipo:"Diario",estado:"Enviado",canal:"Telegram + Email",ahorro:"26.80"},
    {fecha:"24/03/2026",tipo:"Diario",estado:"Enviado",canal:"Telegram + Email",ahorro:"34.10"},
    {fecha:"21/03/2026",tipo:"Semanal",estado:"Enviado",canal:"Email + PDF",ahorro:"191.20"},
    {fecha:"01/03/2026",tipo:"Mensual",estado:"Enviado",canal:"Email + PDF",ahorro:"824.00"},
  ];

  const genPDF=async()=>{
    const{jsPDF}=await import("jspdf");
    const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const w=doc.internal.pageSize.getWidth();
    const m=15;let y=0;
    const col=(r,g,b)=>doc.setTextColor(r,g,b);
    const bg=(x,yy,ww,hh,r,g,b)=>{doc.setFillColor(r,g,b);doc.rect(x,yy,ww,hh,"F")};
    const ln=(x1,yy,x2)=>{doc.setDrawColor(220,220,220);doc.setLineWidth(.3);doc.line(x1,yy,x2,yy)};

    // Header blue bar
    bg(0,0,w,38,0,120,212);
    doc.setFont("helvetica","normal");doc.setFontSize(8);col(255,255,255);
    doc.text("REPORTE DIARIO SEINON IA",m,10);
    doc.setFontSize(18);doc.setFont("helvetica","bold");
    doc.text("Buenos dias, Jordi",m,20);
    doc.setFontSize(10);doc.setFont("helvetica","normal");
    doc.text(`${fecha} - Generado a las 06:00`,m,28);
    // KPIs in header
    bg(w-65,8,55,24,255,255,255);col(0,120,212);
    doc.setFontSize(16);doc.setFont("helvetica","bold");
    doc.text("29.40 EUR",w-60,19);
    doc.setFontSize(7);doc.setFont("helvetica","normal");col(100,100,100);
    doc.text("Ahorro previsto hoy",w-60,25);
    y=45;

    // Section 1: Executive Summary
    col(0,120,212);doc.setFontSize(12);doc.setFont("helvetica","bold");
    doc.text("Resumen Ejecutivo",m,y);y+=7;
    bg(m,y,w-2*m,28,248,249,250);
    col(30,30,30);doc.setFontSize(9);doc.setFont("helvetica","normal");
    const summ="Hoy es un dia favorable para el ahorro energetico. La prevision meteorologica indica cielo despejado con produccion FV estimada de 680 kWh (92kW pico a las 13:00). Los precios OMIE muestran un spread alto de 0.18 EUR/kWh entre valle (0.03) y punta (0.21), lo que hace el arbitraje con bateria muy rentable. El orquestador ha generado un schedule optimo. Ahorro estimado: 29.40 EUR (vs 14.20 de media semanal).";
    const lines=doc.splitTextToSize(summ,w-2*m-6);
    doc.text(lines,m+3,y+5);y+=35;

    // Section 2: Strategy
    col(15,123,15);doc.setFontSize(12);doc.setFont("helvetica","bold");
    doc.text("Plan de Orquestacion para Hoy",m,y);y+=8;
    const blocks=[
      {h:"00-06h",src:"Red Valle",act:"Cargar bateria",why:"OMIE 0.03 EUR/kWh",sav:"2.40"},
      {h:"07-10h",src:"FV + Red",act:"Autoconsumo FV",why:"FV creciente",sav:"1.80"},
      {h:"10-15h",src:"100% FV",act:"FV a Consumo+Bat",why:"FV cubre demanda",sav:"8.50"},
      {h:"15-18h",src:"FV + Bat",act:"Descarga parcial",why:"FV baja OMIE sube",sav:"3.20"},
      {h:"18-22h",src:"Bateria",act:"Descarga maxima",why:"Pico OMIE 0.22",sav:"12.60"},
      {h:"22-00h",src:"Red Valle",act:"Precarga nocturna",why:"OMIE 0.05",sav:"0.90"},
    ];
    const bw=(w-2*m)/6;
    blocks.forEach((b,i)=>{
      const bx=m+i*bw;
      bg(bx,y,bw-.5,22,248,249,250);
      col(0,120,212);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text(b.h,bx+2,y+5);
      col(60,60,60);doc.setFontSize(7);doc.setFont("helvetica","normal");
      doc.text(b.act,bx+2,y+10);
      doc.text(b.src,bx+2,y+14);
      col(15,123,15);doc.setFontSize(9);doc.setFont("helvetica","bold");
      doc.text(b.sav+" EUR",bx+2,y+20);
    });
    y+=28;

    // Strategy narratives
    const narrs=[
      {t:"Madrugada (00-06h)",txt:"OMIE a 0.03 EUR/kWh. Cargar bateria de "+p.socN+"% a 95%. Coste carga: ~1.80 EUR. Esta energia valdra 12.60 EUR en punta.",clr:[0,120,212]},
      {t:"Mediodia (10-15h)",txt:"Cielo despejado, FV 92kW pico. Red desconectada. 100% autoconsumo + excedente a bateria. Ahorro vs red: 8.50 EUR.",clr:[247,99,12]},
      {t:"Pico tarde (18-22h)",txt:"OMIE previsto 0.22-0.24 EUR/kWh. Descarga total bateria. Sin orquestador: 14.20. Con orquestador: 1.60. Ahorro: 12.60 EUR.",clr:[196,43,28]},
    ];
    narrs.forEach(n=>{
      col(n.clr[0],n.clr[1],n.clr[2]);doc.setFontSize(9);doc.setFont("helvetica","bold");
      doc.text(n.t,m,y);y+=4;
      col(60,60,60);doc.setFontSize(8);doc.setFont("helvetica","normal");
      const nl=doc.splitTextToSize(n.txt,w-2*m);doc.text(nl,m,y);y+=nl.length*4+4;
    });

    // Section 3: Alerts
    y+=2;col(196,43,28);doc.setFontSize(12);doc.setFont("helvetica","bold");
    doc.text("Alertas que Requieren Atencion (3)",m,y);y+=8;
    const alts=[
      {pri:"ALTA",tit:"Consumo nocturno anomalo Linea 3",desc:"Consumo 02h-05h +34% vs media. Equipo no apagado. Impacto: +420 EUR/mes.",acc:"Revisar apagado auto linea 3."},
      {pri:"ALTA",tit:"Compresor principal: degradacion",desc:"Consumo +22% en 6m. Fallo mecanico previsto en 45-60 dias.",acc:"Inspeccion rodamientos. Presupuesto motor IE4: ~2,400 EUR."},
      {pri:"MEDIA",tit:"Cos phi bajo cuadro Compresores",desc:"Factor potencia 0.85 entre 09-14h. Penalizacion: +65 EUR/mes.",acc:"Ampliar condensadores. Coste: 800 EUR. Payback: 12m."},
    ];
    alts.forEach(a=>{
      const isAlta=a.pri==="ALTA";
      bg(m,y-.5,w-2*m,18,isAlta?255:255,isAlta?240:248,isAlta?240:240);
      col(isAlta?196:247,isAlta?43:99,isAlta?28:12);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text(`[${a.pri}] ${a.tit}`,m+2,y+4);
      col(80,80,80);doc.setFontSize(7.5);doc.setFont("helvetica","normal");
      doc.text(a.desc,m+2,y+9);
      col(15,123,15);doc.setFont("helvetica","bold");
      doc.text("Accion: "+a.acc,m+2,y+14);
      y+=20;
    });

    // Section 4: Weather
    y+=4;col(247,99,12);doc.setFontSize(12);doc.setFont("helvetica","bold");
    doc.text("Prevision Solar (5 dias)",m,y);y+=7;
    const fcst=[{d:"Hoy",t:"22C",n:"10%",pv:"680 kWh"},{d:"Manana",t:"19C",n:"40%",pv:"520 kWh"},{d:"Pasado",t:"16C",n:"80%",pv:"180 kWh"},{d:"Jueves",t:"18C",n:"55%",pv:"380 kWh"},{d:"Viernes",t:"24C",n:"5%",pv:"720 kWh"}];
    const fw=(w-2*m)/5;
    fcst.forEach((f,i)=>{
      const fx=m+i*fw;
      bg(fx,y,fw-1,18,248,249,250);
      col(60,60,60);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text(f.d,fx+2,y+5);
      doc.setFont("helvetica","normal");doc.setFontSize(7);
      doc.text(`${f.t} - Nubes ${f.n}`,fx+2,y+10);
      col(247,99,12);doc.setFontSize(9);doc.setFont("helvetica","bold");
      doc.text(f.pv,fx+2,y+15);
    });
    y+=24;

    // Section 5: KPIs
    col(180,160,255);doc.setFontSize(12);doc.setFont("helvetica","bold");
    col(80,80,80);doc.text("KPIs de la Instalacion",m,y);y+=7;
    const kpis=[{l:"Consumo ayer",v:"14,200 kWh"},{l:"Autoconsumo FV",v:"62%"},{l:"SoH Bateria",v:"96.5%"},{l:"Ahorro mes",v:"824 EUR"}];
    const kw=(w-2*m)/4;
    kpis.forEach((k,i)=>{
      const kx=m+i*kw;
      bg(kx,y,kw-1,14,248,249,250);
      col(120,120,120);doc.setFontSize(7);doc.setFont("helvetica","normal");
      doc.text(k.l,kx+2,y+5);
      col(30,30,30);doc.setFontSize(10);doc.setFont("helvetica","bold");
      doc.text(k.v,kx+2,y+11);
    });
    y+=20;

    // Section 6: Tasks
    if(y>250){doc.addPage();y=15;}
    col(15,123,15);doc.setFontSize(12);doc.setFont("helvetica","bold");
    doc.text("Tareas Recomendadas para Hoy",m,y);y+=7;
    const tasks=[
      {t:"[ ] Revisar apagado automatico Linea 3",p:"URGENTE - Produccion - 30 min"},
      {t:"[ ] Programar inspeccion compresor principal",p:"IMPORTANTE - Mantenimiento"},
      {t:"[ ] Verificar compensacion excedentes febrero",p:"NORMAL - Admin - 15 min"},
      {t:"[x] El orquestador Seinon IA se encarga del resto",p:"AUTOMATICO - 24/7"},
    ];
    tasks.forEach(tk=>{
      col(30,30,30);doc.setFontSize(9);doc.setFont("helvetica","normal");
      doc.text(tk.t,m,y);
      col(120,120,120);doc.setFontSize(7);
      doc.text(tk.p,m+5,y+4);
      y+=9;
    });

    // Total summary bar
    y+=4;bg(m,y,w-2*m,14,15,123,15);
    col(255,255,255);doc.setFontSize(11);doc.setFont("helvetica","bold");
    doc.text("AHORRO TOTAL ESTIMADO HOY: 29.40 EUR",m+4,y+9);
    y+=20;

    // Footer
    ln(m,y,w-m);y+=5;
    col(160,160,160);doc.setFontSize(7);doc.setFont("helvetica","normal");
    doc.text("Este reporte se genera automaticamente cada dia a las 06:00 por Seinon IA.",m,y);
    doc.text("Planta 4 - Certex Innova S.L. - Industrial Shields RPi PLC 21+",m,y+4);
    doc.text(`Generado: ${fecha} - ${hora}`,m,y+8);
    doc.text("Pagina 1/1",w-m-20,y+8);

    doc.save(`Reporte_Seinon_${hoy.toISOString().slice(0,10)}.pdf`);
  };

  return(<>
    <Hd t="Reportes" sub="Informes diarios, semanales y mensuales generados por IA">
      <div style={{display:"flex",gap:6}}>
        <button onClick={genPDF} style={{padding:"5px 12px",borderRadius:5,border:"none",background:A,color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><Download size={12}/> Descargar PDF</button>
        <button style={{padding:"5px 12px",borderRadius:5,border:`1px solid ${A}`,background:"transparent",color:A,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}><MessageCircle size={12}/> Enviar por Telegram</button>
      </div>
    </Hd>

    {/* DAILY REPORT - THE MAIN THING */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:0,marginBottom:12,overflow:"hidden"}}>
      {/* Report Header */}
      <div style={{background:`linear-gradient(135deg,${A},${P})`,padding:"16px 20px",color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:9,opacity:.7,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Reporte Diario Seinon IA</div>
            <div style={{fontSize:20,fontWeight:700}}>Buenos dias, Jordi</div>
            <div style={{fontSize:12,opacity:.8,marginTop:2}}>{fecha} - Generado a las 06:00</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{background:"rgba(255,255,255,.2)",borderRadius:6,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700}}>29.40</div><div style={{fontSize:8,opacity:.7}}>Ahorro previsto hoy</div></div>
            <div style={{background:"rgba(255,255,255,.2)",borderRadius:6,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:700}}>3</div><div style={{fontSize:8,opacity:.7}}>Alertas pendientes</div></div>
          </div>
        </div>
      </div>

      <div style={{padding:16}}>
        {/* Section 1: Executive Summary */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:`${A}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><Brain size={13} color={A}/></div><div style={{fontSize:13,fontWeight:700}}>Resumen Ejecutivo</div></div>
          <div style={{padding:12,borderRadius:6,background:p.sf2,border:`1px solid ${p.bd}`,fontSize:11,lineHeight:1.6}}>
            Hoy es un <strong style={{color:G}}>dia favorable para el ahorro energetico</strong>. La prevision meteorologica indica cielo despejado con produccion FV estimada de <strong>680 kWh</strong> (92kW pico a las 13:00). Los precios OMIE muestran un <strong style={{color:D}}>spread alto de 0.18/kWh</strong> entre valle (0.03) y punta (0.21), lo que hace el arbitraje con bateria muy rentable. El orquestador ha generado un schedule optimo que prioriza: carga nocturna completa, autoconsumo FV total de 10:00-15:00, y descarga de bateria en pico de 18:00-22:00. <strong>Ahorro estimado: 29.40 (vs 14.20 de media semanal).</strong>
          </div>
        </div>

        {/* Section 2: Strategy */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:`${G}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><Zap size={13} color={G}/></div><div style={{fontSize:13,fontWeight:700}}>Plan de Orquestacion para Hoy</div></div>
          <div className="gDecs" style={{gap:4,marginBottom:10}}>
            {decs.map((d,i)=>{const Ic=d.ic;return(
              <div key={i} style={{padding:8,borderRadius:6,border:`1px solid ${p.bd}`,background:p.sf2,textAlign:"center"}}>
                <Ic size={16} color={d.c} style={{margin:"0 auto 3px",display:"block"}}/>
                <div style={{fontSize:9,fontWeight:700,color:d.c}}>{d.h}</div>
                <div style={{fontSize:9,marginTop:2}}>{d.a}</div>
                <div style={{fontSize:8,color:p.tx2}}>{d.f}</div>
                <div style={{fontSize:11,fontWeight:700,color:G,marginTop:3}}>{d.s}</div>
              </div>
            )})}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{padding:10,borderRadius:6,background:`${A}06`,border:`1px solid ${A}12`,fontSize:10,lineHeight:1.5}}>
              <strong style={{color:A}}>🌙 00:00-06:00 Valle</strong><br/>
              OMIE a 0.03/kWh. Cargar bateria de {p.socN}% a 95%. Coste carga: ~1.80. Esta energia valdra 12.60 cuando la descarguemos en punta.
            </div>
            <div style={{padding:10,borderRadius:6,background:`${G}06`,border:`1px solid ${G}12`,fontSize:10,lineHeight:1.5}}>
              <strong style={{color:G}}>☀️ 10:00-15:00 Solar</strong><br/>
              FV estimada 92kW pico. Red desconectada. 100% autoconsumo + excedente a bateria. Ahorro vs red: 8.50. Cero euros pagados a comercializadora.
            </div>
            <div style={{padding:10,borderRadius:6,background:`${D}06`,border:`1px solid ${D}12`,fontSize:10,lineHeight:1.5}}>
              <strong style={{color:D}}>🔴 18:00-22:00 Pico</strong><br/>
              OMIE previsto 0.21-0.24/kWh. Descarga total bateria. Sin orquestador: 14.20. Con orquestador: 1.60. Ahorro neto en este bloque: 12.60.
            </div>
          </div>
        </div>

        {/* Section 3: Alerts to resolve */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:`${D}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><AlertTriangle size={13} color={D}/></div><div style={{fontSize:13,fontWeight:700}}>Alertas que Requieren Atencion</div><Bg text="3 pendientes" color={D}/></div>
          {[
            {pri:"ALTA",tit:"Consumo nocturno anomalo en Linea 3",desc:"Detectado por IA: consumo entre 02h-05h un 34% superior a la media. Posible equipo no apagado. Impacto: +420/mes si no se corrige.",acc:"Revisar programacion de apagado automatico de linea 3. Verificar con jefe de planta.",c:D},
            {pri:"ALTA",tit:"Compresor principal: degradacion detectada",desc:"El consumo del compresor ha subido un 22% en 6 meses. El modelo IA predice fallo mecanico en 45-60 dias si no se interviene.",acc:"Programar inspeccion de rodamientos y revision del arrancador suave. Presupuesto motor IE4: ~2,400.",c:D},
            {pri:"MEDIA",tit:"Cos phi bajo en cuadro Compresores",desc:"Factor de potencia cayendo a 0.85 entre 09h-14h. Tendencia descendente 3 semanas. Penalizacion estimada: +65/mes.",acc:"Ampliar bateria de condensadores. Coste estimado: 800. Payback: 12 meses.",c:W},
          ].map((a,i)=>(
            <div key={i} style={{padding:12,borderRadius:6,border:`1px solid ${a.c}20`,background:`${a.c}04`,marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                <Bg text={a.pri} color={a.c}/>
                <span style={{fontSize:12,fontWeight:700}}>{a.tit}</span>
              </div>
              <div style={{fontSize:10,color:p.tx2,marginBottom:6,lineHeight:1.4}}>{a.desc}</div>
              <div style={{padding:8,borderRadius:4,background:`${G}06`,border:`1px solid ${G}12`,fontSize:10}}>
                <strong style={{color:G}}>Accion recomendada:</strong> {a.acc}
              </div>
            </div>
          ))}
        </div>

        {/* Section 4: Weather + Solar forecast */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:`${W}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><CloudSun size={13} color={W}/></div><div style={{fontSize:13,fontWeight:700}}>Prevision Meteorologica y Solar</div></div>
          <div className="g5" style={{gap:6}}>
            {forecast.map(f=>{const Ic=f.ic;return(
              <div key={f.d} style={{padding:10,borderRadius:6,background:p.sf2,border:`1px solid ${p.bd}`,textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:600,marginBottom:4}}>{f.d}</div>
                <Ic size={24} color={f.c} style={{margin:"0 auto 4px",display:"block"}}/>
                <div style={{fontSize:10,color:p.tx2}}>{f.t}C - Nubes {f.n}%</div>
                <div style={{fontSize:16,fontWeight:700,color:f.c,marginTop:4}}>{f.pv} kWh</div>
                <div style={{fontSize:9,color:p.tx2}}>Produccion FV est.</div>
              </div>
            )})}
          </div>
          <div style={{marginTop:8,padding:8,borderRadius:4,background:`${W}06`,border:`1px solid ${W}12`,fontSize:10,lineHeight:1.4}}>
            <strong style={{color:W}}>Nota IA:</strong> Pasado manana se esperan nubes al 80% (solo 180 kWh). El orquestador <strong>precargara bateria manana por la noche</strong> a tarifa valle para compensar la caida de produccion FV. No se requiere accion manual.
          </div>
        </div>

        {/* Section 5: KPIs snapshot */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:`${P}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><BarChart3 size={13} color={P}/></div><div style={{fontSize:13,fontWeight:700}}>KPIs de la Instalacion</div></div>
          <div className="g4" style={{marginBottom:0}}>
            {[
              {l:"Consumo ayer",v:"14,200 kWh",c:A,sub:"vs 14,800 semana ant."},
              {l:"Autoconsumo FV",v:"62%",c:G,sub:"Objetivo: 70%"},
              {l:"SoH Bateria",v:"96.5%",c:G,sub:"Ciclos: 234/6000"},
              {l:"Ahorro acumulado mes",v:"824",c:G,sub:"Objetivo: 900"},
            ].map((k,i)=>(
              <div key={i} style={{padding:10,borderRadius:6,background:p.sf2,border:`1px solid ${p.bd}`}}>
                <div style={{fontSize:9,color:p.tx2}}>{k.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:2}}>{k.v}</div>
                <div style={{fontSize:9,color:p.tx2,marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: What to do today */}
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:24,height:24,borderRadius:6,background:`${G}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><CheckCircle size={13} color={G}/></div><div style={{fontSize:13,fontWeight:700}}>Tareas Recomendadas para Hoy</div></div>
          {[
            {tarea:"Revisar apagado automatico Linea 3",pri:"Urgente",area:"Produccion",tiempo:"30 min",c:D},
            {tarea:"Programar inspeccion compresor principal",pri:"Importante",area:"Mantenimiento",tiempo:"Llamar proveedor",c:W},
            {tarea:"Verificar compensacion excedentes febrero",pri:"Normal",area:"Admin",tiempo:"15 min",c:A},
            {tarea:"Nada mas - el orquestador se encarga del resto",pri:"Auto",area:"Seinon IA",tiempo:"24/7",c:G},
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?`1px solid ${p.bd}`:"none"}}>
              <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${t.c}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                {t.pri==="Auto"&&<CheckCircle size={14} color={G}/>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:t.pri==="Auto"?400:600,color:t.pri==="Auto"?p.tx2:p.tx}}>{t.tarea}</div>
                <div style={{fontSize:9,color:p.tx2}}>{t.area} - {t.tiempo}</div>
              </div>
              <Bg text={t.pri} color={t.c}/>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{marginTop:12,padding:10,borderRadius:6,background:p.sf2,border:`1px solid ${p.bd}`,textAlign:"center",fontSize:10,color:p.tx2}}>
          Este reporte se genera automaticamente cada dia a las 06:00 y se envia por Telegram y Email.<br/>
          <strong>Seinon IA</strong> - Orquestacion Energetica Inteligente - Planta 4 - Certex Innova S.L.
        </div>
      </div>
    </Cd>

    {/* REPORT HISTORY */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:13,fontWeight:600}}>Historico de Reportes</div>
        <div style={{display:"flex",gap:4}}>
          <Bg text="Diario" color={A}/><Bg text="Semanal" color={P}/><Bg text="Mensual" color={W}/>
        </div>
      </div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:500}}>
        <thead><tr style={{borderBottom:`2px solid ${p.bd}`}}>
          {["Fecha","Tipo","Canal","Ahorro","Estado",""].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:600,fontSize:9,color:p.tx2}}>{h}</th>)}
        </tr></thead>
        <tbody>{reportes.map((r,i)=>(
          <tr key={i} style={{borderBottom:`1px solid ${p.bd}`}}>
            <td style={{padding:"6px 8px",fontWeight:500}}>{r.fecha}</td>
            <td style={{padding:"6px 8px"}}><Bg text={r.tipo} color={r.tipo==="Diario"?A:r.tipo==="Semanal"?P:W}/></td>
            <td style={{padding:"6px 8px",color:p.tx2}}>{r.canal}</td>
            <td style={{padding:"6px 8px",fontWeight:700,color:G}}>{r.ahorro}</td>
            <td style={{padding:"6px 8px"}}><Bg text={r.estado} color={G}/></td>
            <td style={{padding:"6px 8px"}}><button style={{fontSize:9,color:A,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Ver</button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </Cd>
  </>);
}

// ========== 4. ALERTAS ==========
function Pg4(p){
  const tc={alta:D,media:W,ok:G,info:A};
  return(<>
    <Hd t="Alertas" sub="Alarmas clasicas + deteccion anomalias IA"/>
    <div className="g4" style={{marginBottom:10}}>
      <Mi ic={AlertTriangle} l="Activas" v="3" color={D} p={p}/><Mi ic={CheckCircle} l="Resueltas 7d" v="5" color={G} p={p}/><Mi ic={Brain} l="Anomalias IA" v="5" color={W} sub="mes" p={p}/><Mi ic={CircleDollarSign} l="Impacto" v="870" color={D} sub="/mes" p={p}/>
    </div>
    <div className="g2" style={{gap:10}}>
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
    <div className="g6" style={{marginBottom:10}}>
      <Mi ic={CircleDollarSign} l="Hoy" v="29.40" color={G} p={p}/><Mi ic={CircleDollarSign} l="Semana" v="191" color={A} p={p}/><Mi ic={CircleDollarSign} l="Mes" v="824" color={W} p={p}/><Mi ic={CircleDollarSign} l="Anual" v="9,894" color={P} p={p}/><Mi ic={SunMedium} l="Valor FV" v="89.52" color={W} p={p}/><Mi ic={Activity} l="Autoconsumo" v="62%" color={G} p={p}/>
    </div>
    <div className="g3" style={{marginBottom:10}}>
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
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:500}}>
        <thead><tr style={{borderBottom:`2px solid ${p.bd}`}}>{["ID","Nombre","Periodo","Tarifa","Max","Total","Validada"].map(h=><th key={h} style={{padding:"5px 8px",textAlign:"left",fontWeight:600,fontSize:9,color:p.tx2}}>{h}</th>)}</tr></thead>
        <tbody>{facturas.map(f=><tr key={f.id} style={{borderBottom:`1px solid ${p.bd}`}}>
          <td style={{padding:"5px 8px",color:p.tx2}}>{f.id}</td><td style={{padding:"5px 8px",fontWeight:500}}>{f.nom}</td><td style={{padding:"5px 8px",color:p.tx2}}>{f.per}</td><td style={{padding:"5px 8px"}}>{f.tar}</td><td style={{padding:"5px 8px"}}>{f.max}</td><td style={{padding:"5px 8px",fontWeight:600,color:A}}>{f.total}</td><td style={{padding:"5px 8px"}}>{f.val?<CheckCircle size={14} color={G}/>:<AlertTriangle size={14} color={D}/>}</td>
        </tr>)}</tbody>
      </table></div>
    </Cd>
    {/* Monthly report */}
    <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
      <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Informe Mensual - Marzo 2026</div>
      <div style={{background:p.sf2,borderRadius:6,padding:14,border:`1px solid ${p.bd}`}}>
        <div style={{textAlign:"center",marginBottom:10}}><div style={{fontSize:14,fontWeight:700}}>Certex Innova S.L.</div><div style={{fontSize:10,color:p.tx2}}>Monitorizacion + Orquestacion IA - Planta 4</div></div>
        <div className="g3" style={{marginBottom:10}}>
          {[{l:"Sin orquestador",v:"4,872",c:D},{l:"Con orq. IA",v:"4,048",c:G},{l:"AHORRO",v:"824",c:G}].map(k=><div key={k.l} style={{padding:8,borderRadius:5,background:"#fff",border:`1px solid ${p.bd}`,textAlign:"center"}}><div style={{fontSize:8,color:p.tx2}}>{k.l}</div><div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div></div>)}
        </div>
        <div className="g3" style={{fontSize:10}}>
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
    <div className="g6" style={{marginBottom:10}}>
      <Mi ic={Cpu} l="CPU" v="RPi 4" color={A} sub="ARM A72" p={p}/><Mi ic={Thermometer} l="Temp" v="42C" color={G} p={p}/><Mi ic={Clock} l="Uptime" v="47d" color={G} p={p}/><Mi ic={Heart} l="SoH" v={`${cS.toFixed(1)}%`} color={cS>90?G:W} p={p}/><Mi ic={RefreshCw} l="Ciclos" v={`${sohH[sohH.length-1].ciclos}`} color={A} p={p}/><Mi ic={Clock} l="Vida" v="12.5a" color={P} p={p}/>
    </div>
    <div className="g2" style={{marginBottom:8}}>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Puertos y Conexiones</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:500}}>
          <thead><tr style={{borderBottom:`2px solid ${p.bd}`}}>{["Puerto","Dispositivo","Proto",""].map(h=><th key={h} style={{padding:"4px 6px",textAlign:"left",fontWeight:600,fontSize:8,color:p.tx2}}>{h}</th>)}</tr></thead>
          <tbody>{ports.map((pt,i)=><tr key={i} style={{borderBottom:`1px solid ${p.bd}`}}><td style={{padding:"4px 6px",fontWeight:600}}>{pt.n}</td><td style={{padding:"4px 6px"}}>{pt.d}</td><td style={{padding:"4px 6px",color:p.tx2,fontSize:9}}>{pt.pr}</td><td style={{padding:"4px 6px"}}><Bg text={pt.s} color={pt.c}/></td></tr>)}</tbody>
        </table></div>
      </Cd>
      <Cd s={p.sf} sh={p.sh} bd={p.bd} style={{padding:12}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Integraciones</div>
        {[{n:"Fronius GEN24",st:"Conectado",c:G},{n:"BYD HVS BMS",st:"Conectado",c:G},{n:"Datadis/SIPS",st:"Conectado",c:G},{n:"OMIE API",st:"Sync diario",c:A},{n:"FlexMeasures",st:"Activo",c:G},{n:"Solcast (meteo)",st:"Activo",c:G},{n:"Telegram Bot",st:"Activo",c:G},{n:"MQTT Cloud",st:"Conectado",c:G}].map((i,idx)=>(
          <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${p.bd}`,fontSize:10}}>
            <span>{i.n}</span><Bg text={i.st} color={i.c}/>
          </div>))}
      </Cd>
    </div>
    <div className="g2">
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