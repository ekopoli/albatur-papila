import { useState, useEffect, useRef } from "react";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const SINIF_KOD_MAP = {
  "101": ["8888"],
  "102": ["0160","0190","0195","0200","7320","8010","8040","8080","8220","8221-1200","8223","8232","8233","8235","8240","8250","8320","8400"],
  "103": ["0100","0105","0110","0115","0120","0125","0130","0135","0140","0145","0171","0210","0300","1030","1040","1050","1070","1080","1090","1010","1011","1012","1013","1014","1015","1016","1017","1018","6000","6100","6320","6400","6500","6510","6600","7010","7011","7012","7100","7020","7030","7031","7032","7036","7038","7040","7045","7055","7060","7601"],
  "105": ["105-A","105-B","105-C","105-D"],
  "109": ["109-A","109-B","109-C"],
  "110": ["110-A","110-B","110-C"],
  "112": ["112-A","112-B","112-C"],
  "118": ["118-A","118-B","118-C"],
  "119": ["119-A","119-B","119-C"],
  "120": ["120-A","120-B","120-C"],
  "121": ["121-A","121-B","121-C"],
  "122": ["122-A","122-B","122-C"],
  "123": ["123-A","123-B","123-C"],
  "124": ["124-A","124-B","124-C"],
  "127": ["127-A","127-B","127-C"],
  "Diğer": [],
};
const SINIFLAR = ["101","102","103","105","109","110","112","118","119","120","121","122","123","124","127","Diğer"];
const KATEGORILER= ["A-Tipi","B-Tipi","C-Tipi","D-Tipi","Parça render","Çizgisel animasyon","PR-Prospektüs","Sahne görseli","Video","Short Video","Reels","Diğer"];
const ROLE_LBL   = { super:"Tam Yetkili", accview:"Muhasebe Görüntüleyici", limited:"Sınırlı Admin", guest:"Misafir" };
const DEMO_USERS = [
  {id:"1",username:"papila",   password:"Smtppl5862",role:"super",   displayName:"Papila"},
  {id:"2",username:"kbt",      password:"kbt123",     role:"accview", displayName:"KBT"},
  {id:"3",username:"admin",    password:"admin123",   role:"limited", displayName:"Admin"},
  {id:"4",username:"kullanici",password:"pass123",    role:"limited", displayName:"Kullanıcı"},
  {id:"5",username:"misafir",  password:"misafir",    role:"guest",   displayName:"Misafir"},
];

const LOGO_URI = "data:image/png;base64,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";



const lsGet = (k,d)  => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch{return d;} };
const lsSet = (k,v)  => { try { localStorage.setItem(k,JSON.stringify(v)); } catch{} };
const lsDel = (k)    => { try { localStorage.removeItem(k); } catch{} };
const uid   = ()     => Date.now().toString(36)+Math.random().toString(36).slice(2);
const today = ()     => new Date().toISOString().slice(0,10);
const fmt   = n      => (!n&&n!==0)||isNaN(n)?"—":Number(n).toLocaleString("tr-TR",{minimumFractionDigits:2,maximumFractionDigits:2});

// Versiyon uyumsuzluğunda kullanıcı verisini sıfırla (iş verileri korunur)
const APP_VERSION = "4";
if (lsGet("alb_ver","0") !== APP_VERSION) {
  lsSet("alb_users", DEMO_USERS);
  lsDel("alb_session");
  lsSet("alb_ver", APP_VERSION);
}

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────

const GFONTS = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');`;
const GCSS = `
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:#0c0c0c;}
::-webkit-scrollbar-thumb{background:#252525;border-radius:3px;}
input,select,textarea,button{font-family:'IBM Plex Mono',monospace;}
.tr-beklemede{color:#cccccc;}
.tr-onayda{color:#f59e0b;}
.tr-tamamlandi{color:#4ade80;opacity:.8;}
.tr-kapandi{color:#38bdf8;opacity:.65;}
.tr-revizyonda{color:#c084fc;opacity:.9;}
table{border-collapse:collapse;width:100%;}
th{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:#484848;
  padding:10px 12px;text-align:left;border-bottom:1px solid #141414;position:sticky;top:0;background:#0b0b0b;z-index:10;white-space:nowrap;}
td{font-size:12px;padding:8px 12px;border-bottom:1px solid #111;vertical-align:middle;white-space:nowrap;}
tr:hover td{background:rgba(255,255,255,.015);}
.inp{background:#111;border:1px solid #1d1d1d;border-radius:4px;padding:7px 10px;color:#e0e0e0;font-size:12px;width:100%;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#f59e0b;}
.inp::placeholder{color:#272727;}
select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23404040'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;padding-right:26px;}
.btn{padding:6px 14px;border-radius:4px;border:none;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.04em;
  transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.bA{background:#f59e0b;color:#000;}  .bA:hover{background:#fbbf24;}
.bO{background:transparent;color:#555;border:1px solid #1e1e1e;}  .bO:hover{border-color:#333;color:#e0e0e0;}  .bO.on{border-color:#f59e0b;color:#f59e0b;}
.bG{background:transparent;color:#444;border:1px solid transparent;padding:3px 8px;font-size:10px;}  .bG:hover{color:#e0e0e0;border-color:#1e1e1e;}
.bR{background:transparent;color:#c0392b;border:1px solid transparent;padding:3px 8px;font-size:10px;}  .bR:hover{color:#f87171;border-color:rgba(239,68,68,.25);}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);}
.mbox{background:#0c0c0c;border:1px solid #1e1e1e;border-radius:8px;width:100%;max-width:660px;max-height:94vh;overflow-y:auto;}
.mhd{padding:18px 22px;border-bottom:1px solid #141414;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#0c0c0c;z-index:5;}
.flbl{font-family:'IBM Plex Sans',sans-serif;font-size:9px;color:#444;letter-spacing:.12em;text-transform:uppercase;display:block;margin-bottom:5px;}
.badge{display:inline-block;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
.bs{background:rgba(245,158,11,.12);color:#f59e0b;}
.ba{background:rgba(34,211,238,.1);color:#22d3ee;}
.bl{background:rgba(129,140,248,.12);color:#818cf8;}
.bg{background:rgba(100,100,100,.1);color:#555;}
.acc-sep{border-left:1px solid #1c1c1c!important;}
`;

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  // Kullanıcıları düzelt ve hemen kaydet (session init bunları okuyabilsin)
  const [users, setUsers] = useState(() => {
    let saved = lsGet("alb_users", DEMO_USERS);
    const hasPapila = saved.some(u => u.username === "papila");
    const fixed = hasPapila
      ? saved.map(u => u.username==="papila" ? {...u, role:"super", password:"Smtppl5862"} : u)
      : [{id:"1",username:"papila",password:"Smtppl5862",role:"super",displayName:"Papila"}, ...saved];
    lsSet("alb_users", fixed); // Hemen kaydet ki session init doğru veriyi okusun
    return fixed;
  });

  const [jobs,       setJobs      ] = useState(() => lsGet("alb_jobs", []));
  const [jobsLoaded, setJobsLoaded] = useState(true);
  const [session, setSession] = useState(null);
  const [page,   setPage  ] = useState("main");
  const [filterGroup, setFilterGroup] = useState("aktif");
  const [filterSub,   setFilterSub  ] = useState("all");
  const [accOn,  setAccOn ] = useState(false);
  const [modal,        setModal       ] = useState(null);
  const [delId,        setDelId       ] = useState(null);
  const [revizyonModal,setRevizyonModal] = useState(null);
  const [testMsg,      setTestMsg      ] = useState("");
  const [toast,        setToast        ] = useState(null); // {href, label}

  useEffect(() => lsSet("alb_users", users), [users]);
  useEffect(() => lsSet("alb_jobs",  jobs),  [jobs]);
  useEffect(() => { if (toast) { const t = setTimeout(()=>setToast(null), 10000); return ()=>clearTimeout(t); } }, [toast]);

  const saveJobs = (newJobs) => {
    setJobs(newJobs);
    lsSet("alb_jobs", newJobs);
  };

  const login  = user => {
    const fresh = users.find(u => u.username === user.username) || user;
    setSession(fresh);
  };
  const logout = () => { setSession(null); setPage("main"); setAccOn(false); };

  // ── BİLDİRİM (mailto toast) ───────────────────────────────────────────────
  const sendEmailNotification = (job) => {
    const subject = encodeURIComponent(`ALBATUR-Papila — Yeni Sipariş: ${job.kodu||""} ${job.kategori||""}`);
    const body    = encodeURIComponent(`Yeni sipariş kaydedildi.\n\nTarih: ${job.siparisTarihi||"—"}\nSınıf: ${job.sinifi||"—"}\nKod: ${job.kodu||"—"}\nKategori: ${job.kategori||"—"}\nAçıklama: ${job.aciklama||"—"}\nSiparişi Veren: ${job.siparisiVeren||"—"}\nTeslim: ${job.teslimTarihi||"—"}`);
    setToast({ href:`mailto:ipapila@gmail.com?subject=${subject}&body=${body}`, label:`📋 Yeni sipariş: ${job.kodu||""} ${job.kategori||""}` });
  };

  const sendRevizyonEmail = (job) => {
    const subject = encodeURIComponent(`↩ ALBATUR-Papila — Revizyon: ${job.kodu||""} ${job.kategori||""}`);
    const body    = encodeURIComponent(`Revizyon alındı.\n\nKod: ${job.kodu||"—"}\nKategori: ${job.kategori||"—"}\nSiparişi Veren: ${job.siparisiVeren||"—"}\n\nRevizyon Notu:\n${job.revizyonNotu||"(yok)"}`);
    setToast({ href:`mailto:ipapila@gmail.com?subject=${subject}&body=${body}`, label:`↩ Revizyon: ${job.kodu||""} ${job.kategori||""}` });
  };

  const updJob = (id, patch) => {
    const job = jobs.find(j => j.id === id);
    const newJobs = jobs.map(j => j.id===id ? {...j,...patch} : j);
    saveJobs(newJobs);
    // Revizyona geçişte e-posta gönder
    if (patch.durum === "revizyonda" && job) {
      sendRevizyonEmail({...job, ...patch});
    }
  };
  const dropJob = id => { saveJobs(jobs.filter(j => j.id!==id)); setDelId(null); };
  const saveJob = data => {
    if (data.id) saveJobs(jobs.map(j => j.id===data.id ? data : j));
    else {
      const newJob = {...data, id:uid()};
      saveJobs([...jobs, newJob]);
      sendEmailNotification(newJob); // Arka planda otomatik gönder
    }
    setModal(null);
  };

  if (!session) return <Login users={users} onLogin={login}/>;
  if (!jobsLoaded) return (
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:"#080808",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:11,letterSpacing:"0.15em"}}>
      <style>{GFONTS+GCSS}</style>
      Yükleniyor…
    </div>
  );

  const canEdit    = session.role !== "guest";
  const canAcc     = session.role === "super" || session.role === "accview";
  const canEditAcc = session.role === "super";
  const showAcc    = accOn && canAcc;

  const isAktif = d => d !== "kapandi";
  const cntG = v =>
    v==="aktif" ? jobs.filter(j => isAktif(j.durum||"beklemede")).length :
    v==="all"   ? jobs.length :
    jobs.filter(j => (j.durum||"beklemede")===v).length;
  const cntS = v =>
    v==="all"        ? jobs.filter(j => isAktif(j.durum||"beklemede") && (j.durum||"beklemede")!=="beklemede").length :
    v==="tamamlandi" ? jobs.filter(j => (j.durum||"beklemede")==="tamamlandi").length :
    v==="beklemede"  ? jobs.filter(j => (j.durum||"beklemede")==="beklemede").length :
    v==="onayda"     ? jobs.filter(j => (j.durum||"beklemede")==="onayda").length :
    v==="revizyonda" ? jobs.filter(j => (j.durum||"beklemede")==="revizyonda").length :
    jobs.filter(j => isAktif(j.durum||"beklemede")).length;

  const visJobs = jobs.filter(j => {
    const d = j.durum||"beklemede";
    if (filterGroup==="kapandi")  return d==="kapandi";
    if (filterGroup==="all")      return true;
    if (filterSub==="beklemede")  return d==="beklemede";
    if (filterSub==="onayda")     return d==="onayda";
    if (filterSub==="tamamlandi") return d==="tamamlandi";
    if (filterSub==="revizyonda") return d==="revizyonda";
    // "all" sub = Üretimde: beklemede hariç aktif
    return isAktif(d) && d !== "beklemede";
  });

  // Footer totals — Ederi: kapandı hariç tümü, Ödenen/Kalan: tümü
  const totEderi  = jobs.reduce((s,j) => j.durum!=="kapandi" ? s+parseFloat(j.birimFiyat||0)*parseFloat(j.adedi||0) : s, 0);
  const totOdenen = jobs.reduce((s,j) => s+parseFloat(j.odenen||0), 0);
  const totKalan  = jobs.reduce((s,j) => s+(parseFloat(j.birimFiyat||0)*parseFloat(j.adedi||0)-parseFloat(j.odenen||0)), 0);

  const DOT_COLORS = { beklemede:"#c0c0c0", onayda:"#f59e0b", tamamlandi:"#4ade80", kapandi:"#38bdf8", revizyonda:"#c084fc" };

  return (
    <div style={{fontFamily:"'IBM Plex Mono',monospace",background:"#080808",minHeight:"100vh",color:"#e0e0e0"}}>
      <style>{GFONTS+GCSS}</style>

      {/* ── HEADER ── */}
      <header style={{background:"#0a0a0a",borderBottom:"1px solid #141414",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO_URI} alt="ALBATUR" style={{height:28,objectFit:"contain",display:"block"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {canAcc && (
            <button className={`btn bO ${accOn?"on":""}`} onClick={()=>setAccOn(!accOn)}>
              <span>₺</span> Muhasebe
            </button>
          )}
          {(session.role==="super" || session.username==="papila") && (
            <button className={`btn bO ${page==="users"?"on":""}`} onClick={()=>setPage(p=>p==="users"?"main":"users")}>
              Kullanıcılar
            </button>
          )}
          {(session.role==="super" || session.username==="papila") && (
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {testMsg && <span style={{fontSize:10,color:testMsg.startsWith("✓")?"#4ade80":"#f87171"}}>{testMsg}</span>}
            </div>
          )}
          {(session.role==="super" || session.username==="papila") && (
            <button className="btn bO" style={{color:"#555",fontSize:10}} onClick={()=>setDelId("__reset__")}>
              ⟳ Sıfırla
            </button>
          )}
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 10px",background:"#0e0e0e",borderRadius:4,border:"1px solid #181818"}}>
            <span style={{fontSize:12,color:"#c0c0c0",fontWeight:500}}>{session.displayName}</span>
            <button className="btn bG" onClick={logout}>Çıkış</button>
          </div>
        </div>
      </header>

      <div style={{padding:"18px 20px"}}>
        {page==="users" && (session.role==="super" || session.username==="papila") ? (
          <UserMgmt users={users} setUsers={setUsers} session={session}/>
        ) : (
          <>
            {/* ── TOOLBAR ── */}
            <div style={{marginBottom:14}}>
              {/* Yeni Sipariş üstte */}
              {canEdit && (
                <div style={{marginBottom:10}}>
                  <button className="btn bA" onClick={()=>setModal("new")}>+ Yeni Sipariş</button>
                </div>
              )}

              <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8}}>
                {/* Birincil filtreler */}
                <div style={{display:"flex",alignItems:"center",background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:7,padding:3,gap:2}}>
                  {/* Aktif — grup başlığı, sub-filter aktif gösterir */}
                  <button onClick={()=>setFilterGroup(fg => fg==="aktif" ? "all" : "aktif")} style={{
                    display:"inline-flex",alignItems:"center",gap:5,
                    padding:"5px 12px",borderRadius:5,border:"none",cursor:"pointer",
                    fontSize:10,fontWeight:500,
                    fontFamily:"'IBM Plex Sans',sans-serif",
                    background:filterGroup==="aktif"?"rgba(245,158,11,.08)":"transparent",
                    color:filterGroup==="aktif"?"#f59e0b":"#444",
                    transition:"all .15s",
                  }}>
                    Aktif
                    <span style={{fontSize:9,color:filterGroup==="aktif"?"rgba(245,158,11,.5)":"#2e2e2e",fontWeight:400}}>{cntG("aktif")}</span>
                    <span style={{fontSize:8,color:filterGroup==="aktif"?"#f59e0b":"#2e2e2e",marginLeft:1}}>{filterGroup==="aktif"?"▾":"▸"}</span>
                  </button>
                  {/* Kapandı + Tümü */}
                  {[["kapandi","Kapandı"],["all","Tümü"]].map(([v,l])=>{
                    const on = filterGroup===v;
                    const dot = DOT_COLORS[v];
                    return (
                      <button key={v} onClick={()=>{setFilterGroup(v);setFilterSub("all");}} style={{
                        display:"inline-flex",alignItems:"center",gap:5,
                        padding:"5px 12px",borderRadius:5,border:"none",cursor:"pointer",
                        fontSize:10,fontWeight:on?600:400,
                        fontFamily:"'IBM Plex Sans',sans-serif",
                        background:on?"#1e1e1e":"transparent",
                        color:on?(dot||"#e0e0e0"):"#444",
                        boxShadow:on?"0 1px 3px rgba(0,0,0,.4)":"none",
                        transition:"all .15s",
                      }}>
                        {dot && <span style={{width:5,height:5,borderRadius:"50%",background:dot,display:"inline-block",opacity:on?1:0.4}}/>}
                        {l}
                        <span style={{fontSize:9,color:on?(dot||"#666"):"#2e2e2e",fontWeight:400}}>{cntG(v)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* İkincil filtreler — Aktif seçiliyken */}
              {filterGroup==="aktif" && (
                <div style={{marginTop:6,display:"flex",alignItems:"center",gap:5,paddingLeft:4}}>
                  <span style={{fontSize:9,color:"#2a2a2a",marginRight:2,fontFamily:"'IBM Plex Sans',sans-serif"}}>└</span>
                  {[
                    ["all","Üretimde",null],
                    ["beklemede","Beklemede","#c0c0c0"],
                    ["onayda","Onayda","#f59e0b"],
                    ["revizyonda","Revizyonda","#c084fc"],
                    ["tamamlandi","Tamamlandı","#4ade80"],
                  ].map(([v,l,dot])=>{
                    const on = filterSub===v;
                    return (
                      <button key={v} onClick={()=>setFilterSub(v)} style={{
                        display:"inline-flex",alignItems:"center",gap:4,
                        padding:"4px 11px",borderRadius:4,
                        border:`1px solid ${on?"#333":"transparent"}`,
                        cursor:"pointer",fontSize:10,fontWeight:on?600:400,
                        fontFamily:"'IBM Plex Sans',sans-serif",
                        background:on?"#1e1e1e":"transparent",
                        color:on?(dot||"#e0e0e0"):"#3a3a3a",
                        boxShadow:on?"0 1px 3px rgba(0,0,0,.4)":"none",
                        transition:"all .15s",
                      }}>
                        {dot && <span style={{width:5,height:5,borderRadius:"50%",background:dot,display:"inline-block",opacity:on?1:0.4}}/>}
                        {l}
                        <span style={{fontSize:9,color:on?(dot||"#777"):"#2a2a2a",fontWeight:400}}>{cntS(v)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── TABLE ── */}
            <div style={{background:"#0b0b0b",border:"1px solid #141414",borderRadius:6,overflow:"auto"}}>
              <table>
                <thead>
                  <tr>
                    <th style={{width:36}}>#</th>
                    <th>Sipariş Tarihi</th>
                    <th>Sınıfı</th>
                    <th>Kodu</th>
                    <th>Kategori</th>
                    <th style={{minWidth:160}}>Açıklama</th>
                    <th>Siparişi Veren</th>
                    <th>Onaya Gidiş</th>
                    <th>Teslim Tarihi</th>
                    <th style={{minWidth:120}}>Durum</th>
                    {canEdit && <th style={{width:128}}></th>}
                    {showAcc && <>
                      <th className="acc-sep" style={{color:"#d97706"}}>Birim Fiyat</th>
                      <th style={{color:"#d97706"}}>Adedi</th>
                      <th style={{color:"#d97706"}}>Ederi</th>
                      <th style={{color:"#d97706"}}>Ödenen</th>
                      <th style={{color:"#d97706"}}>Kalan</th>
                      <th style={{color:"#d97706"}}>Ödeme Tarihi</th>
                      <th style={{color:"#d97706",width:58,textAlign:"center"}}>Ödendi</th>
                    </>}
                  </tr>
                </thead>
                <tbody>
                  {visJobs.length===0 ? (
                    <tr><td colSpan={30} style={{textAlign:"center",padding:52,color:"#222",fontSize:11,letterSpacing:"0.12em"}}>— Kayıt bulunamadı —</td></tr>
                  ) : visJobs.map((job,i) => (
                    <JobRow key={job.id} job={job} idx={i+1}
                      canEdit={canEdit} showAcc={showAcc} canEditAcc={canEditAcc}
                      onUpdate={patch=>updJob(job.id,patch)}
                      onEdit={()=>setModal(job)}
                      onDelete={()=>setDelId(job.id)}
                      onRevizyon={()=>setRevizyonModal(job)}
                    />
                  ))}
                </tbody>
                {showAcc && visJobs.length>0 && (
                  <tfoot>
                    <tr style={{background:"#090909",borderTop:"2px solid #1e1e1e"}}>
                      <td colSpan={canEdit?13:12} style={{textAlign:"right",fontSize:9,color:"#2e2e2e",letterSpacing:"0.15em",paddingRight:14,fontFamily:"'IBM Plex Sans',sans-serif"}}>GENEL TOPLAM</td>
                      <td style={{fontWeight:600,color:"#c0c0c0",fontSize:12}}>{fmt(totEderi)}</td>
                      <td style={{fontWeight:600,color:"#4ade80",fontSize:12}}>{fmt(totOdenen)}</td>
                      <td style={{fontWeight:600,color:totKalan>0?"#f87171":"#4ade80",fontSize:12}}>{fmt(totKalan)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Accounting note */}
            {showAcc && (
              <div style={{marginTop:8,fontSize:9,color:"#2e2e2e",letterSpacing:"0.1em"}}>
                * Ederi toplamı yalnızca tamamlanmamış işleri kapsar. Ödenen ve Kalan tüm kayıtları kapsar.
              </div>
            )}
          </>
        )}
      </div>

      {/* ── JOB MODAL ── */}
      {modal && (
        <JobModal job={modal==="new"?null:modal} session={session} canAcc={canAcc}
          onSave={saveJob} onClose={()=>setModal(null)}/>
      )}

      {/* ── REVİZYON MODAL ── */}
      {revizyonModal && (
        <RevizyonModal job={revizyonModal}
          onConfirm={(revizyonNotu) => {
            updJob(revizyonModal.id, {durum:"revizyonda", revizyonNotu});
            setRevizyonModal(null);
          }}
          onClose={()=>setRevizyonModal(null)}
        />
      )}

      {/* ── TOAST BİLDİRİM ── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)",
          background:"#0e0e0e", border:"1px solid #2a2a2a", borderRadius:8,
          padding:"12px 16px", zIndex:200, display:"flex", alignItems:"center",
          gap:12, boxShadow:"0 8px 24px rgba(0,0,0,.6)", maxWidth:340, width:"90%",
        }}>
          <span style={{fontSize:11,color:"#888",flex:1,fontFamily:"'IBM Plex Sans',sans-serif"}}>{toast.label}</span>
          <a href={toast.href} onClick={()=>setToast(null)}
            style={{
              display:"inline-flex",alignItems:"center",gap:5,
              padding:"5px 12px",borderRadius:4,background:"#f59e0b",
              color:"#000",fontSize:11,fontWeight:600,textDecoration:"none",
              fontFamily:"'IBM Plex Sans',sans-serif",whiteSpace:"nowrap",
            }}>
            📧 Mail Gönder
          </a>
          <button onClick={()=>setToast(null)} style={{
            background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14,padding:"0 2px",
          }}>✕</button>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {delId && delId !== "__reset__" && (
        <div className="overlay" onClick={()=>setDelId(null)}>
          <div style={{background:"#0e0e0e",border:"1px solid #2a2a2a",borderRadius:8,padding:28,maxWidth:300,width:"100%",textAlign:"center"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:28,marginBottom:12}}>⚠</div>
            <div style={{fontSize:13,color:"#e0e0e0",marginBottom:6,fontFamily:"'IBM Plex Sans',sans-serif"}}>Kaydı silmek istiyor musunuz?</div>
            <div style={{fontSize:10,color:"#444",marginBottom:22,fontFamily:"'IBM Plex Sans',sans-serif"}}>Bu işlem geri alınamaz.</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button className="btn bO" onClick={()=>setDelId(null)}>İptal</button>
              <button className="btn" style={{background:"#c0392b",color:"#fff"}} onClick={()=>dropJob(delId)}>Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET CONFIRM ── */}
      {delId === "__reset__" && (
        <div className="overlay" onClick={()=>setDelId(null)}>
          <div style={{background:"#0e0e0e",border:"1px solid #2a2a2a",borderRadius:8,padding:28,maxWidth:320,width:"100%",textAlign:"center"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:28,marginBottom:12}}>⟳</div>
            <div style={{fontSize:13,color:"#e0e0e0",marginBottom:6,fontFamily:"'IBM Plex Sans',sans-serif"}}>Önbelleği sıfırla</div>
            <div style={{fontSize:11,color:"#555",marginBottom:6,fontFamily:"'IBM Plex Sans',sans-serif",lineHeight:1.6}}>
              Oturum önbelleği temizlenecek ve sayfa yeniden yüklenecek.<br/>
              <span style={{color:"#3a3a3a"}}>İş verileri korunur.</span>
            </div>
            <div style={{marginBottom:20,marginTop:12,padding:"10px",background:"#0a0a0a",borderRadius:6,border:"1px solid #1a1a1a"}}>
              <div style={{fontSize:10,color:"#444",marginBottom:4}}>Papila girişi:</div>
              <div style={{fontSize:12,color:"#666"}}>papila / Smtppl5862</div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button className="btn bO" onClick={()=>setDelId(null)}>İptal</button>
              <button className="btn bA" onClick={()=>{
                lsSet("alb_users", DEMO_USERS);
                lsSet("alb_ver", APP_VERSION);
                window.location.reload();
              }}>Sıfırla ve Yenile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────

function Login({ users, onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const go = () => {
    const found = users.find(x => x.username===u && x.password===p);
    if (found) onLogin(found);
    else setErr("Kullanıcı adı veya şifre hatalı.");
  };

  return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace"}}>
      <style>{GFONTS+GCSS}</style>
      <div style={{width:310}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src={LOGO_URI} alt="ALBATUR" style={{height:40,objectFit:"contain",display:"block",margin:"0 auto 14px"}}/>
        </div>

        {/* Hızlı Papila Girişi */}
        <button onClick={()=>{ const papila = users.find(u=>u.username==="papila"); if(papila) onLogin(papila); }}
          style={{
            width:"100%", marginBottom:10, padding:"11px 0",
            background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)",
            borderRadius:8, cursor:"pointer", color:"#f59e0b",
            fontSize:12, fontWeight:600, fontFamily:"'IBM Plex Sans',sans-serif",
            letterSpacing:"0.06em", transition:"all .15s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(245,158,11,.14)"; e.currentTarget.style.borderColor="rgba(245,158,11,.4)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(245,158,11,.08)"; e.currentTarget.style.borderColor="rgba(245,158,11,.2)"; }}>
          ⚡ Papila olarak giriş yap
        </button>

        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{flex:1,height:1,background:"#141414"}}/>
          <span style={{fontSize:9,color:"#2a2a2a",letterSpacing:"0.12em"}}>VEYA</span>
          <div style={{flex:1,height:1,background:"#141414"}}/>
        </div>

        <div style={{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:8,padding:22}}>
          <div style={{marginBottom:13}}>
            <label className="flbl">Kullanıcı Adı</label>
            <input className="inp" value={u} onChange={e=>{setU(e.target.value);setErr("");}} placeholder="kullanıcı adı" autoFocus/>
          </div>
          <div style={{marginBottom:16}}>
            <label className="flbl">Şifre</label>
            <input className="inp" type="password" value={p} onChange={e=>{setP(e.target.value);setErr("");}} placeholder="••••••••"
              onKeyDown={e=>e.key==="Enter"&&go()}/>
          </div>
          {err && (
            <div style={{fontSize:11,color:"#ef4444",marginBottom:14,padding:"8px 10px",background:"rgba(239,68,68,.07)",borderRadius:4,border:"1px solid rgba(239,68,68,.2)"}}>
              {err}
            </div>
          )}
          <button className="btn bA" style={{width:"100%",justifyContent:"center",padding:"9px 0"}} onClick={go}>Giriş Yap</button>
        </div>
      </div>
    </div>
  );
}

// ── MONEY CELL ────────────────────────────────────────────────────────────────

function MoneyCell({ value, onChange, onChangeCommit, width=88, placeholder="0.00" }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (editing) return (
    <input ref={ref} className="inp" type="number" step=".01"
      style={{width}} value={value||""} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onBlur={() => { setEditing(false); onChangeCommit && onChangeCommit(value); }}
      onKeyDown={e => e.key==="Enter" && ref.current?.blur()}/>
  );

  return (
    <div onClick={() => setEditing(true)} style={{
      cursor:"text", minWidth:width, fontSize:12, padding:"4px 6px",
      borderRadius:4, border:"1px solid transparent", color: value ? "inherit" : "#2a2a2a",
      transition:"border-color .15s",
    }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#252525"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
      {value ? fmt(value) : <span style={{color:"#2a2a2a"}}>{placeholder}</span>}
    </div>
  );
}

// ── JOB ROW ───────────────────────────────────────────────────────────────────

function JobRow({ job, idx, canEdit, showAcc, canEditAcc, onUpdate, onEdit, onDelete, onRevizyon }) {
  const ederi  = parseFloat(job.birimFiyat||0) * parseFloat(job.adedi||0);
  const odenen = parseFloat(job.odenen||0);
  const kalan  = ederi - odenen;
  const odendi = odenen > 0;
  const d      = job.durum||"beklemede";
  const cls    = `tr-${d}`;

  const statusColor = d==="onayda"?"#f59e0b": d==="tamamlandi"?"#4ade80": d==="kapandi"?"#38bdf8": d==="revizyonda"?"#c084fc":"#c0c0c0";
  const statusLabel = d==="beklemede"?"Beklemede": d==="onayda"?"Onayda": d==="tamamlandi"?"Tamamlandı": d==="kapandi"?"Kapandı": d==="revizyonda"?"Revizyonda":"—";

  return (
    <tr className={cls}>
      <td style={{color:"#2a2a2a",fontSize:10,fontWeight:600}}>{idx}</td>
      <td>{job.siparisTarihi||"—"}</td>
      <td>{job.sinifi||"—"}</td>
      <td style={{fontWeight:500}}>{job.kodu||"—"}</td>
      <td>{job.kategori||"—"}</td>
      <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}} title={job.aciklama}>{job.aciklama||"—"}</td>
      <td>{job.siparisiVeren||"—"}</td>
      <td>{job.onayaGidisTarihi||"—"}</td>
      <td>{job.teslimTarihi||"—"}</td>
      <td>
        {canEdit ? (
          <select className="inp" value={d}
            style={{width:120,fontSize:11,padding:"4px 22px 4px 8px",color:statusColor,background:"#0e0e0e",border:"1px solid #1a1a1a"}}
            onChange={e=>onUpdate({durum:e.target.value})}>
            <option value="beklemede">Beklemede</option>
            <option value="onayda">Onayda</option>
            <option value="revizyonda">Revizyonda</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="kapandi">Kapandı</option>
          </select>
        ) : (
          <span style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:statusColor,display:"inline-block",flexShrink:0}}/>
            {statusLabel}
          </span>
        )}
      </td>
      {canEdit && (
        <td>
          <div style={{display:"flex",gap:2,alignItems:"center"}}>
            <button className="btn bG" onClick={onEdit}>Düzenle</button>
            {/* Onayla toggle */}
            <button
              title={d==="tamamlandi" ? "Onay kaldır" : "Onayla"}
              onClick={()=>onUpdate({durum: d==="tamamlandi" ? "onayda" : "tamamlandi"})}
              style={{
                display:"inline-flex",alignItems:"center",gap:4,
                padding:"3px 8px",borderRadius:4,border:"none",cursor:"pointer",
                fontSize:10,fontWeight:500,transition:"all .15s",
                background: d==="tamamlandi" ? "rgba(74,222,128,.15)" : "rgba(255,255,255,.03)",
                color:       d==="tamamlandi" ? "#4ade80" : "#3a3a3a",
                outline:     d==="tamamlandi" ? "1px solid rgba(74,222,128,.3)" : "1px solid #1e1e1e",
              }}
              onMouseEnter={e=>{ if(d!=="tamamlandi"){ e.currentTarget.style.color="#4ade80"; e.currentTarget.style.outline="1px solid rgba(74,222,128,.25)"; }}}
              onMouseLeave={e=>{ if(d!=="tamamlandi"){ e.currentTarget.style.color="#3a3a3a"; e.currentTarget.style.outline="1px solid #1e1e1e"; }}}
            >
              {d==="tamamlandi" ? "✓ Onaylı" : "○ Onayla"}
            </button>
            {/* Revizyon toggle */}
            <button
              title={d==="revizyonda" ? "Revizyonu kaldır" : "Revizyona al"}
              onClick={()=> d==="revizyonda" ? onUpdate({durum:"onayda"}) : onRevizyon()}
              style={{
                display:"inline-flex",alignItems:"center",gap:4,
                padding:"3px 8px",borderRadius:4,border:"none",cursor:"pointer",
                fontSize:10,fontWeight:500,transition:"all .15s",
                background: d==="revizyonda" ? "rgba(192,132,252,.15)" : "rgba(255,255,255,.03)",
                color:       d==="revizyonda" ? "#c084fc" : "#3a3a3a",
                outline:     d==="revizyonda" ? "1px solid rgba(192,132,252,.3)" : "1px solid #1e1e1e",
              }}
              onMouseEnter={e=>{ if(d!=="revizyonda"){ e.currentTarget.style.color="#c084fc"; e.currentTarget.style.outline="1px solid rgba(192,132,252,.25)"; }}}
              onMouseLeave={e=>{ if(d!=="revizyonda"){ e.currentTarget.style.color="#3a3a3a"; e.currentTarget.style.outline="1px solid #1e1e1e"; }}}
            >
              {d==="revizyonda" ? "↩ Revizyonda" : "↩ Revizyon"}
            </button>
            <button className="btn bR" onClick={onDelete}>Sil</button>
          </div>
        </td>
      )}
      {showAcc && <>
        <td className="acc-sep">
          {canEditAcc
            ? <MoneyCell value={job.birimFiyat} onChange={v=>onUpdate({birimFiyat:v})} width={88}/>
            : <span style={{color:"#888"}}>{job.birimFiyat ? fmt(job.birimFiyat) : "—"}</span>}
        </td>
        <td>
          {canEditAcc
            ? <input className="inp" type="number" style={{width:54}} value={job.adedi||""} placeholder="0" onChange={e=>onUpdate({adedi:e.target.value})}/>
            : <span style={{color:"#888"}}>{job.adedi||"—"}</span>}
        </td>
        <td style={{color:odendi?"#444":"inherit"}}>
          {ederi>0?fmt(ederi):"—"}
        </td>
        <td>
          {canEditAcc
            ? <MoneyCell value={job.odenen}
                onChange={v=>{
                  const patch = {odenen: v};
                  const tutar = parseFloat(v||0);
                  if (ederi > 0 && tutar >= ederi) patch.durum = "kapandi";
                  else if (job.durum === "kapandi") patch.durum = "tamamlandi";
                  onUpdate(patch);
                }}
                width={88}/>
            : <span style={{color:"#888"}}>{job.odenen ? fmt(job.odenen) : "—"}</span>}
        </td>
        <td style={{color:ederi===0?"inherit":kalan<=0?"#4ade80":"#f87171"}}>
          {ederi>0?fmt(kalan):"—"}
        </td>
        <td>
          {canEditAcc
            ? <input className="inp" type="date" style={{width:118}} value={job.odemeTarihi||""} onChange={e=>onUpdate({odemeTarihi:e.target.value})}/>
            : <span style={{color:"#888"}}>{job.odemeTarihi||"—"}</span>}
        </td>
        <td style={{textAlign:"center"}}>
          <input type="checkbox" checked={odendi} readOnly style={{width:14,height:14,accentColor:"#4ade80",cursor:"default"}}/>
        </td>
      </>}
    </tr>
  );
}

// ── CUSTOM DROPDOWN ───────────────────────────────────────────────────────────

function DropList({ value, options, onChange, placeholder="Seçin...", specialOption }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const displayVal = value === "__custom__" ? "Manuel giriş..." : (value || placeholder);

  return (
    <div ref={ref} style={{position:"relative"}}>
      {/* Trigger */}
      <button type="button" onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", background:"#111",
        border:`1px solid ${open?"#f59e0b":"#1d1d1d"}`,
        borderRadius:4, padding:"7px 12px 7px 10px",
        color: value ? "#e0e0e0" : "#383838",
        fontSize:12, fontFamily:"'IBM Plex Mono',monospace",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        cursor:"pointer", transition:"border-color .15s", textAlign:"left",
      }}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayVal}</span>
        <svg width="9" height="6" viewBox="0 0 9 6" style={{flexShrink:0,marginLeft:8,opacity:.4,transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}>
          <path d="M0 0l4.5 6L9 0z" fill="#aaa"/>
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 5px)", left:0, right:0, zIndex:500,
          background:"#0f0f0f", border:"1px solid #222",
          borderRadius:7, boxShadow:"0 12px 32px rgba(0,0,0,.7)",
          overflow:"hidden", maxHeight:220, overflowY:"auto",
        }}>
          {options.map(opt => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={()=>{ onChange(opt); setOpen(false); }}
                style={{
                  padding:"8px 12px", fontSize:12,
                  fontFamily:"'IBM Plex Mono',monospace",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                  color: selected ? "#f59e0b" : "#b0b0b0",
                  background: selected ? "rgba(245,158,11,.07)" : "transparent",
                  borderLeft: `2px solid ${selected?"#f59e0b":"transparent"}`,
                  transition:"background .1s",
                }}
                onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background="rgba(255,255,255,.04)"; }}
                onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}>
                {selected && <span style={{fontSize:8,color:"#f59e0b"}}>✓</span>}
                {!selected && <span style={{width:12}}/>}
                {opt}
              </div>
            );
          })}
          {/* Special option (e.g. Manuel giriş) */}
          {specialOption && (
            <>
              <div style={{height:1,background:"#1a1a1a",margin:"3px 0"}}/>
              <div onClick={()=>{ specialOption.onSelect(); setOpen(false); }}
                style={{
                  padding:"8px 12px", fontSize:11,
                  fontFamily:"'IBM Plex Mono',monospace",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                  color:"#555", transition:"background .1s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.color="#e0e0e0"; e.currentTarget.style.background="rgba(255,255,255,.04)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="#555"; e.currentTarget.style.background="transparent"; }}>
                <span style={{fontSize:10}}>✏</span>
                {specialOption.label}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── REVİZYON MODAL ────────────────────────────────────────────────────────────

function RevizyonModal({ job, onConfirm, onClose }) {
  const [not, setNot] = useState("");
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mbox" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#c084fc",fontFamily:"'IBM Plex Sans',sans-serif"}}>
              ↩ Revizyona Al
            </div>
            <div style={{fontSize:10,color:"#555",marginTop:3,fontFamily:"'IBM Plex Mono',monospace"}}>
              {job.kodu||"—"} · {job.kategori||"—"}
            </div>
          </div>
          <button className="btn bG" style={{fontSize:16,padding:"3px 10px"}} onClick={onClose}>✕</button>
        </div>
        <div style={{padding:22}}>
          <label className="flbl">Revizyon Açıklaması</label>
          <textarea className="inp" rows={5} autoFocus
            placeholder="İstenilen revizyonları buraya yazın…"
            value={not} onChange={e=>setNot(e.target.value)}
            style={{resize:"vertical",lineHeight:1.6}}/>
          <div style={{marginTop:16,display:"flex",justifyContent:"flex-end",gap:8,paddingTop:14,borderTop:"1px solid #111"}}>
            <button className="btn bO" onClick={onClose}>İptal</button>
            <button className="btn" style={{background:"rgba(192,132,252,.15)",color:"#c084fc",border:"1px solid rgba(192,132,252,.3)"}}
              onClick={()=>onConfirm(not)}>
              ↩ Revizyona Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── JOB MODAL ─────────────────────────────────────────────────────────────────

const BLANK = {
  siparisTarihi:"",sinifi:"101",kodu:"101-A",kodCustom:"",
  kategori:"A-Tipi",kategoriCustom:"",aciklama:"",siparisiVeren:"",
  onayaGidisTarihi:"",teslimTarihi:"",durum:"beklemede",
  birimFiyat:"",adedi:"",odenen:"",odemeTarihi:"",
};

function JobModal({ job, session, canAcc, onSave, onClose }) {
  const initForm = () => {
    if (!job) return {...BLANK, siparisTarihi:today(), siparisiVeren:session.displayName};
    const sinifi   = SINIFLAR.includes(job.sinifi) ? job.sinifi : "Diğer";
    const inMap    = SINIF_KOD_MAP[sinifi]?.includes(job.kodu);
    const kodu     = inMap ? job.kodu : "__custom__";
    const kodCustom= inMap ? "" : (job.kodu||"");
    const inKat    = KATEGORILER.slice(0,-1).includes(job.kategori);
    return {...BLANK,...job, sinifi, kodu, kodCustom,
      kategori: inKat ? job.kategori : "Diğer",
      kategoriCustom: inKat ? "" : (job.kategori||""),
    };
  };

  const [f, setF] = useState(initForm);
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const kodOpts = SINIF_KOD_MAP[f.sinifi] || [];
  const showKodCustom = f.sinifi==="Diğer" || f.kodu==="__custom__";
  const showKatCustom = f.kategori==="Diğer";

  const changeSinifi = v => {
    const opts = SINIF_KOD_MAP[v]||[];
    setF(p=>({...p, sinifi:v, kodu:v==="Diğer"?"__custom__":(opts[0]||""), kodCustom:""}));
  };

  const ederi = parseFloat(f.birimFiyat||0)*parseFloat(f.adedi||0);
  const kalan = ederi-parseFloat(f.odenen||0);

  const submit = () => {
    const finalKod = (f.sinifi==="Diğer"||f.kodu==="__custom__") ? f.kodCustom.trim() : f.kodu;
    const finalKat = f.kategori==="Diğer" ? f.kategoriCustom.trim() : f.kategori;
    if (!f.siparisTarihi) { alert("Sipariş tarihi giriniz."); return; }
    if (!finalKod)        { alert("Kod giriniz."); return; }
    onSave({
      ...(job?{id:job.id}:{}),
      siparisTarihi:f.siparisTarihi, sinifi:f.sinifi,
      kodu:finalKod, kategori:finalKat, aciklama:f.aciklama,
      siparisiVeren:f.siparisiVeren, onayaGidisTarihi:f.onayaGidisTarihi,
      teslimTarihi:f.teslimTarihi,
      durum: ederi > 0 && parseFloat(f.odenen||0) >= ederi
               ? "kapandi"
               : (f.durum === "kapandi" && parseFloat(f.odenen||0) <= 0)
               ? "tamamlandi"
               : f.durum,
      birimFiyat:f.birimFiyat, adedi:f.adedi, odenen:f.odenen, odemeTarihi:f.odemeTarihi,
    });
  };

  const L = ({c}) => <label className="flbl">{c}</label>;

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mbox" onClick={e=>e.stopPropagation()}>
        <div className="mhd">
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#e0e0e0",fontFamily:"'IBM Plex Sans',sans-serif"}}>
              {job?"İş Kaydını Düzenle":"Yeni İş Ekle"}
            </div>
            <div style={{fontSize:8,color:"#2a2a2a",marginTop:3,letterSpacing:"0.15em"}}>ALBATUR-PAPILA İŞ TAKİP</div>
          </div>
          <button className="btn bG" style={{fontSize:16,padding:"3px 10px"}} onClick={onClose}>✕</button>
        </div>

        <div style={{padding:22}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
            {/* Sipariş Tarihi */}
            <div>
              <L c="Sipariş Tarihi"/>
              <input className="inp" type="date" value={f.siparisTarihi} onChange={e=>set("siparisTarihi",e.target.value)}/>
            </div>
            {/* Siparişi Veren */}
            <div>
              <L c="Siparişi Veren"/>
              <input className="inp" value={f.siparisiVeren} onChange={e=>set("siparisiVeren",e.target.value)}/>
            </div>
            {/* Sınıfı */}
            <div>
              <L c="Sınıfı"/>
              <DropList
                value={f.sinifi}
                options={SINIFLAR.filter(s=>s!=="Diğer")}
                onChange={changeSinifi}
                specialOption={{label:"Diğer (Manuel Giriş)", onSelect:()=>changeSinifi("Diğer")}}
              />
            </div>
            {/* Kodu */}
            <div>
              <L c="Kodu"/>
              {f.sinifi!=="Diğer" && !showKodCustom && (
                <DropList
                  value={f.kodu}
                  options={kodOpts}
                  onChange={v=>set("kodu",v)}
                  specialOption={{label:"Manuel Giriş", onSelect:()=>set("kodu","__custom__")}}
                />
              )}
              {f.sinifi!=="Diğer" && showKodCustom && (
                <div style={{display:"flex",gap:6}}>
                  <input key="kodCustom" className="inp" autoFocus
                    placeholder="Kodu buraya yazın..."
                    value={f.kodCustom}
                    onChange={e=>set("kodCustom",e.target.value)}
                    style={{flex:1}}/>
                  <button type="button" title="Listeden seç" onClick={()=>set("kodu", kodOpts[0]||"")}
                    style={{background:"#1a1a1a",border:"1px solid #252525",borderRadius:4,color:"#555",cursor:"pointer",padding:"0 10px",fontSize:10,flexShrink:0}}
                    onMouseEnter={e=>e.currentTarget.style.color="#e0e0e0"}
                    onMouseLeave={e=>e.currentTarget.style.color="#555"}>
                    ↩ Liste
                  </button>
                </div>
              )}
              {f.sinifi==="Diğer" && (
                <input key="kodCustomSinif" className="inp" autoFocus
                  placeholder="Kodu buraya yazın..."
                  value={f.kodCustom}
                  onChange={e=>set("kodCustom",e.target.value)}/>
              )}
            </div>
            {/* Kategori */}
            <div>
              <L c="Kategori"/>
              {!showKatCustom ? (
                <DropList
                  value={f.kategori}
                  options={KATEGORILER.filter(k=>k!=="Diğer")}
                  onChange={v=>set("kategori",v)}
                  specialOption={{label:"Diğer (Manuel Giriş)", onSelect:()=>set("kategori","Diğer")}}
                />
              ) : (
                <div style={{display:"flex",gap:6}}>
                  <input key="katCustom" className="inp" autoFocus
                    placeholder="Kategori buraya yazın..."
                    value={f.kategoriCustom}
                    onChange={e=>set("kategoriCustom",e.target.value)}
                    style={{flex:1}}/>
                  <button type="button" title="Listeden seç" onClick={()=>set("kategori","A-Tipi")}
                    style={{background:"#1a1a1a",border:"1px solid #252525",borderRadius:4,color:"#555",cursor:"pointer",padding:"0 10px",fontSize:10,flexShrink:0}}
                    onMouseEnter={e=>e.currentTarget.style.color="#e0e0e0"}
                    onMouseLeave={e=>e.currentTarget.style.color="#555"}>
                    ↩ Liste
                  </button>
                </div>
              )}
            </div>
            {/* Durum */}
            <div>
              <L c="Durum"/>
              <select className="inp" value={f.durum} onChange={e=>set("durum",e.target.value)}>
                <option value="beklemede">Beklemede</option>
                <option value="onayda">Onayda</option>
                <option value="revizyonda">Revizyonda</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="kapandi">Kapandı</option>
              </select>
            </div>
            {/* Tarihler */}
            <div>
              <L c="Onaya Gidiş Tarihi"/>
              <input className="inp" type="date" value={f.onayaGidisTarihi} onChange={e=>set("onayaGidisTarihi",e.target.value)}/>
            </div>
            <div>
              <L c="Teslim Tarihi"/>
              <input className="inp" type="date" value={f.teslimTarihi} onChange={e=>set("teslimTarihi",e.target.value)}/>
            </div>
            {/* Açıklama */}
            <div style={{gridColumn:"1/-1"}}>
              <L c="Açıklama"/>
              <textarea className="inp" rows={3} value={f.aciklama} onChange={e=>set("aciklama",e.target.value)}
                placeholder="İş açıklaması..." style={{resize:"vertical"}}/>
            </div>
          </div>

          {/* ── MUHASEBE ── */}
          {canAcc && (
            <>
              <div style={{margin:"18px 0 13px",paddingTop:16,borderTop:"1px solid #141414",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:8,color:"#d97706",letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600}}>₺ Muhasebe Bilgileri</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13}}>
                <div>
                  <L c="Birim Fiyat (₺)"/>
                  <input className="inp" type="number" step=".01" value={f.birimFiyat} onChange={e=>set("birimFiyat",e.target.value)} placeholder="0.00"/>
                </div>
                <div>
                  <L c="Adedi"/>
                  <input className="inp" type="number" value={f.adedi} onChange={e=>set("adedi",e.target.value)} placeholder="0"/>
                </div>
                <div>
                  <L c="Ederi (Otomatik)"/>
                  <div className="inp" style={{color:"#f59e0b",fontWeight:500}}>{fmt(ederi)}</div>
                </div>
                <div>
                  <L c="Ödenen (₺)"/>
                  <input className="inp" type="number" step=".01" value={f.odenen} onChange={e=>set("odenen",e.target.value)} placeholder="0.00"/>
                </div>
                <div>
                  <L c="Kalan (Otomatik)"/>
                  <div className="inp" style={{color:ederi>0&&kalan<=0?"#4ade80":"#f87171",fontWeight:500}}>{fmt(kalan)}</div>
                </div>
                <div>
                  <L c="Ödeme Tarihi"/>
                  <input className="inp" type="date" value={f.odemeTarihi} onChange={e=>set("odemeTarihi",e.target.value)}/>
                </div>
              </div>
            </>
          )}

          <div style={{marginTop:20,display:"flex",justifyContent:"flex-end",gap:8,paddingTop:16,borderTop:"1px solid #101010"}}>
            <button className="btn bO" onClick={onClose}>İptal</button>
            <button className="btn bA" onClick={submit}>{job?"✓ Güncelle":"+ Ekle"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── USER MANAGEMENT ───────────────────────────────────────────────────────────

const BLANK_USER = {username:"",password:"",displayName:"",role:"limited"};

function UserMgmt({ users, setUsers, session }) {
  const isSuperAdmin = session?.role === "super";
  const [editUser, setEditUser] = useState(null);  // null | user obj | "new"
  const [delId,    setDelId  ] = useState(null);
  const [form,     setForm   ] = useState(BLANK_USER);
  const [showPw,   setShowPw ] = useState({});
  const sf = (k,v) => setForm(p=>({...p,[k]:v}));

  const openEdit = u => { setForm({username:u.username,password:u.password,displayName:u.displayName,role:u.role}); setEditUser(u); };
  const openAdd  = ()  => { setForm(BLANK_USER); setEditUser("new"); };
  const closeEdit = () => setEditUser(null);

  const save = () => {
    if (!form.displayName||!form.username||!form.password) { alert("Tüm alanları doldurun."); return; }
    if (editUser === "new") setUsers(p=>[...p,{...form,id:uid()}]);
    else setUsers(p=>p.map(u=>u.id===editUser.id?{...u,...form}:u));
    closeEdit();
  };

  const ROLE_OPTS = [
    {v:"super",   l:"Tam Yetkili"},
    {v:"accview", l:"Muhasebe Görüntüleyici"},
    {v:"limited", l:"Sınırlı Admin"},
    {v:"guest",   l:"Misafir"},
  ];

  return (
    <div style={{maxWidth:780}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#e0e0e0",fontFamily:"'IBM Plex Sans',sans-serif",marginBottom:3}}>Kullanıcı Yönetimi</div>
          <div style={{fontSize:10,color:"#3a3a3a",fontFamily:"'IBM Plex Sans',sans-serif"}}>Kullanıcıları ve yetki seviyelerini yönetin.</div>
        </div>
        <button className="btn bA" onClick={openAdd}>+ Kullanıcı Ekle</button>
      </div>

      <div style={{background:"#0b0b0b",border:"1px solid #141414",borderRadius:6,overflow:"hidden"}}>
        <table>
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Kullanıcı Adı</th>
              <th>Şifre</th>
              <th>Yetki</th>
              <th style={{textAlign:"right",paddingRight:16,width:150}}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{color:"#c0c0c0"}}>
                <td style={{fontSize:12}}>{u.displayName}</td>
                <td style={{fontSize:11,color:"#666"}}>{u.username}</td>
                <td style={{fontSize:12,fontFamily:"'IBM Plex Mono',monospace"}}>
                  {isSuperAdmin ? (
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{color:showPw[u.id]?"#888":"#252525",letterSpacing:showPw[u.id]?0:3}}>
                        {showPw[u.id] ? u.password : "●".repeat(Math.min(u.password.length,8))}
                      </span>
                      <button onClick={()=>setShowPw(p=>({...p,[u.id]:!p[u.id]}))} style={{
                        background:"none",border:"none",cursor:"pointer",padding:"1px 4px",
                        fontSize:11,color:"#333",borderRadius:3,lineHeight:1,
                      }}
                        onMouseEnter={e=>e.currentTarget.style.color="#888"}
                        onMouseLeave={e=>e.currentTarget.style.color="#333"}>
                        {showPw[u.id]?"○":"◉"}
                      </button>
                    </div>
                  ) : (
                    <span style={{color:"#252525",letterSpacing:3}}>{"●".repeat(Math.min(u.password.length,8))}</span>
                  )}
                </td>
                <td><span className={`badge b${u.role[0]}`}>{ROLE_LBL[u.role]}</span></td>
                <td style={{textAlign:"right",paddingRight:12}}>
                  {delId===u.id ? (
                    <div style={{display:"inline-flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,color:"#555"}}>Silinsin mi?</span>
                      <button className="btn" style={{background:"#7f1d1d",color:"#fca5a5",fontSize:10,padding:"3px 10px"}}
                        onClick={()=>{ setUsers(p=>p.filter(x=>x.id!==u.id)); setDelId(null); }}>Evet</button>
                      <button className="btn bO" style={{fontSize:10,padding:"3px 10px"}} onClick={()=>setDelId(null)}>Hayır</button>
                    </div>
                  ) : (
                    <div style={{display:"inline-flex",gap:4}}>
                      <button className="btn bG" style={{fontSize:10,padding:"3px 10px"}} onClick={()=>openEdit(u)}>✏ Düzenle</button>
                      <button className="btn bR" style={{fontSize:10,padding:"3px 10px"}} onClick={()=>setDelId(u.id)}>Sil</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {editUser && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&closeEdit()}>
          <div className="mbox" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <div className="mhd">
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#e0e0e0",fontFamily:"'IBM Plex Sans',sans-serif"}}>
                  {editUser==="new" ? "Yeni Kullanıcı" : `Düzenle — ${editUser.displayName}`}
                </div>
                <div style={{fontSize:8,color:"#2a2a2a",marginTop:3,letterSpacing:"0.15em"}}>KULLANICI YÖNETİMİ</div>
              </div>
              <button className="btn bG" style={{fontSize:16,padding:"3px 10px"}} onClick={closeEdit}>✕</button>
            </div>
            <div style={{padding:22}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:14}}>
                <div>
                  <label className="flbl">Ad Soyad</label>
                  <input className="inp" value={form.displayName} onChange={e=>sf("displayName",e.target.value)} autoFocus/>
                </div>
                <div>
                  <label className="flbl">Kullanıcı Adı</label>
                  <input className="inp" value={form.username} onChange={e=>sf("username",e.target.value)}/>
                </div>
                <div>
                  <label className="flbl">Şifre</label>
                  <input className="inp" type={isSuperAdmin?"text":"password"} value={form.password} onChange={e=>sf("password",e.target.value)}/>
                </div>
                <div>
                  <label className="flbl">Yetki Seviyesi</label>
                  <select className="inp" value={form.role} onChange={e=>sf("role",e.target.value)}>
                    {ROLE_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:14,borderTop:"1px solid #111"}}>
                <button className="btn bO" onClick={closeEdit}>İptal</button>
                <button className="btn bA" onClick={save}>{editUser==="new"?"+ Ekle":"✓ Kaydet"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
