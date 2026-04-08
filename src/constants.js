export const SINIFLAR = ['101','102','103','105','109','110','117','118','119','120','121','122','123','124','127','Diğer']

export const KODLAR = {
  101: ['8888'],
  102: ['0160','0190','0195','0200','7320','8010','8040','8080','8220','8221-1200','8223','8232','8233','8235','8240','8250','8320','8400'],
  103: ['0100','0105','0110','0115','0120','0125','0130','0135','0140','0145','0171','0210','0300','1010','1011','1012','1013','1014','1015','1016','1017','1018','1030','1040','1050','1070','1080','1090','6000','6100','6320','6400','6500','6510','6600','7010','7011','7012','7020','7030','7031','7032','7036','7038','7040','7045','7055','7060','7100','7601'],
  105: ['7400','7405','7410','7420','7426','7430','7440','7441'],
  109: ['0254','1801','1812'],
  110: ['5100'],
  117: ['1010','1011','1050','1220','6666','6700','6710','6711','6740','6800','6810','6820','6900','6901','6920','6921','6922','6940','6941','6942','6950','6959','6970','6990'],
  118: ['0001','0002','0005','0006','0007','0009','0011','0012'],
  119: ['8800','8810','8820','8821','8825','8830','8831','8835','8900','8920','8921','8925'],
  120: ['1000','1005','1300','1305','7090','7099','7120','7310','7340','7380','8000','8020','9010','9012','9015','9017','9020','9025','9080','9085','9090','9095','9100','9200','9600','9700','9701','9705','9706','9720','9725'],
  121: ['9800','9801','9810','9820','9830','9840','9850','9880','9890'],
  122: ['1050','1052','9042','9061','9062','9400','9500'],
  123: ['9030','9035','9900','9901','9902','9903','9906','9910','9911','9912','9920','9921','9925','9926','9932','9933','9980','9985','9990','9995'],
  124: ['9915','9930','9935','9940','9950','9951','9960','9981','9991'],
  127: ['0100','0150','0200','0250','0260','0400','0450','0500','0550'],
  Diğer: []
}

export const KATEGORILER = ['A-Tipi','B-Tipi','C-Tipi','D-Tipi','Parça render','Çizgisel animasyon','PR-Prospektüs','Sahne görseli','Video','Short Video','Reels','W-360 (.glb)','Diğer']

export const ROLLER = { super: 'Tam Yetkili', accview: 'Muhasebe Görüntüleyici', limited: 'Sınırlı Admin', guest: 'Misafir' }

export const DURUM_RENK = { beklemede: '#c0c0c0', onayda: '#f59e0b', tamamlandi: '#4ade80', kapandi: '#38bdf8', revizyonda: '#c084fc' }
export const DURUM_LABEL = { beklemede: 'Beklemede', onayda: 'Onayda', tamamlandi: 'Tamamlandı', kapandi: 'Kapandı', revizyonda: 'Revizyonda' }

export const fmt = (n) => !n && n !== 0 || isNaN(n) ? '—' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => new Date().toISOString().slice(0, 10)

export const LOGO = "data:image/png;base64,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"

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
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
th{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:#484848;padding:10px 12px;text-align:left;border-bottom:1px solid #141414;position:sticky;top:0;background:#0b0b0b;z-index:10;white-space:nowrap;}
td{font-size:12px;padding:8px 12px;border-bottom:1px solid #111;vertical-align:middle;white-space:nowrap;}
tr:hover td{background:rgba(255,255,255,.015);}
.inp{background:#111;border:1px solid #1d1d1d;border-radius:4px;padding:7px 10px;color:#e0e0e0;font-size:12px;width:100%;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#f59e0b;}
.inp::placeholder{color:#272727;}
select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23404040'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;padding-right:26px;}
.btn{padding:6px 14px;border-radius:4px;border:none;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.04em;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.bA{background:#f59e0b;color:#000;}.bA:hover{background:#fbbf24;}
.bO{background:transparent;color:#555;border:1px solid #1e1e1e;}.bO:hover{border-color:#333;color:#e0e0e0;}.bO.on{border-color:#f59e0b;color:#f59e0b;}
.bG{background:transparent;color:#444;border:1px solid transparent;padding:3px 8px;font-size:10px;}.bG:hover{color:#e0e0e0;border-color:#1e1e1e;}
.bR{background:transparent;color:#c0392b;border:1px solid transparent;padding:3px 8px;font-size:10px;}.bR:hover{color:#f87171;border-color:rgba(239,68,68,.25);}
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
`
