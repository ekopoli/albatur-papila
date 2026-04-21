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

export const DURUM_RENK = { beklemede: '#c0c0c0', uretimde: '#fb923c', onayda: '#f59e0b', tamamlandi: '#4ade80', kapandi: '#38bdf8', revizyonda: '#c084fc' }
export const DURUM_LABEL = { beklemede: 'Beklemede', uretimde: 'Üretimde', onayda: 'Onayda', tamamlandi: 'Tamamlandı', kapandi: 'Kapandı', revizyonda: 'Revizyonda' }

export const fmt = (n) => !n && n !== 0 || isNaN(n) ? '—' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => new Date().toISOString().slice(0, 10)

export const LOGO = "data:image/png;base64,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"

export const TEMALAR = {
  dark: {
    '--bg':       '#080808',
    '--bg2':      '#0a0a0a',
    '--bg3':      '#0b0b0b',
    '--bg4':      '#0c0c0c',
    '--bg5':      '#0e0e0e',
    '--bg6':      '#111',
    '--border':   '#141414',
    '--border2':  '#1a1a1a',
    '--border3':  '#1d1d1d',
    '--border4':  '#1e1e1e',
    '--text':     '#e0e0e0',
    '--text2':    '#c0c0c0',
    '--text3':    '#888',
    '--text4':    '#555',
    '--text5':    '#333',
    '--hover':    'rgba(255,255,255,.015)',
    '--overlay':  'rgba(0,0,0,.9)',
    '--ph':       '#272727',
    '--scrollbar':'#252525',
  },
  dim: {
    '--bg':       '#1a1a2e',
    '--bg2':      '#1e1e35',
    '--bg3':      '#222240',
    '--bg4':      '#242442',
    '--bg5':      '#282850',
    '--bg6':      '#2a2a4a',
    '--border':   '#2e2e55',
    '--border2':  '#333360',
    '--border3':  '#363665',
    '--border4':  '#3a3a6a',
    '--text':     '#e8e8f0',
    '--text2':    '#c8c8e0',
    '--text3':    '#9090b8',
    '--text4':    '#6868a0',
    '--text5':    '#4848808',
    '--hover':    'rgba(255,255,255,.03)',
    '--overlay':  'rgba(0,0,10,.85)',
    '--ph':       '#404060',
    '--scrollbar':'#404070',
  },
  light: {
    '--bg':       '#f5f5f0',
    '--bg2':      '#efefea',
    '--bg3':      '#e8e8e3',
    '--bg4':      '#ffffff',
    '--bg5':      '#f0f0eb',
    '--bg6':      '#e8e8e3',
    '--border':   '#d8d8d0',
    '--border2':  '#ccccc4',
    '--border3':  '#c4c4bc',
    '--border4':  '#bbbbba',
    '--text':     '#1a1a1a',
    '--text2':    '#333333',
    '--text3':    '#666666',
    '--text4':    '#888888',
    '--text5':    '#aaaaaa',
    '--hover':    'rgba(0,0,0,.03)',
    '--overlay':  'rgba(0,0,0,.5)',
    '--ph':       '#bbbbb4',
    '--scrollbar':'#cccccc',
  }
}

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:var(--bg4);}
::-webkit-scrollbar-thumb{background:var(--scrollbar);border-radius:3px;}
input,select,textarea,button{font-family:'IBM Plex Mono',monospace;}
.tr-beklemede{color:#cccccc;}
.tr-uretimde{color:#fb923c;}
.tr-onayda{color:#f59e0b;}
.tr-tamamlandi{color:#4ade80;opacity:.8;}
.tr-kapandi{color:#38bdf8;opacity:.65;}
.tr-revizyonda{color:#c084fc;opacity:.9;}
table{border-collapse:collapse;width:100%;}
th{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:var(--text3);padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg3);z-index:10;white-space:nowrap;}
td{font-size:12px;padding:8px 12px;border-bottom:1px solid var(--border);vertical-align:middle;white-space:nowrap;color:var(--text2);}
tr:hover td{background:var(--hover);}
.inp{background:var(--bg6);border:1px solid var(--border3);border-radius:4px;padding:7px 10px;color:var(--text);font-size:12px;width:100%;outline:none;transition:border-color .15s;}
.inp:focus{border-color:#f59e0b;}
.inp::placeholder{color:var(--ph);}
select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23404040'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;padding-right:26px;}
.btn{padding:6px 14px;border-radius:4px;border:none;cursor:pointer;font-size:11px;font-weight:500;letter-spacing:.04em;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
.bA{background:#f59e0b;color:#000;}.bA:hover{background:#fbbf24;}
.bO{background:transparent;color:var(--text3);border:1px solid var(--border2);}.bO:hover{border-color:var(--text3);color:var(--text);}.bO.on{border-color:#f59e0b;color:#f59e0b;}
.bG{background:transparent;color:var(--text3);border:1px solid transparent;padding:3px 8px;font-size:10px;}.bG:hover{color:var(--text);border-color:var(--border2);}
.bR{background:transparent;color:#e05555;border:1px solid transparent;padding:3px 8px;font-size:10px;}.bR:hover{color:#ff9999;border-color:rgba(239,68,68,.25);}
.overlay{position:fixed;inset:0;background:var(--overlay);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);}
.mbox{background:var(--bg4);border:1px solid var(--border4);border-radius:8px;width:100%;max-width:660px;max-height:94vh;overflow-y:auto;}
.mhd{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--bg4);z-index:5;}
.flbl{font-family:'IBM Plex Sans',sans-serif;font-size:9px;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;display:block;margin-bottom:5px;}
.badge{display:inline-block;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
.bs{background:rgba(245,158,11,.12);color:#f59e0b;}
.ba{background:rgba(34,211,238,.1);color:#22d3ee;}
.bl{background:rgba(129,140,248,.12);color:#818cf8;}
.bg{background:rgba(100,100,100,.1);color:var(--text4);}
.acc-sep{border-left:1px solid var(--border2)!important;}
`
