export const SINIFLAR = ['101','102','103','105','109','110','112','118','119','120','121','122','123','124','127','Diğer']

export const KODLAR = {
  101: ['8888'],
  102: ['0160','0190','0195','0200','7320','8010','8040','8080','8220','8221-1200','8223','8232','8233','8235','8240','8250','8320','8400'],
  103: ['0100','0105','0110','0115','0120','0125','0130','0135','0140','0145','0171','0210','0300','1030','1040','1050','1070','1080','1090','1010','1011','1012','1013','1014','1015','1016','1017','1018','6000','6100','6320','6400','6500','6510','6600','7010','7011','7012','7100','7020','7030','7031','7032','7036','7038','7040','7045','7055','7060','7601'],
  105: ['105-A','105-B','105-C','105-D'],
  109: ['109-A','109-B','109-C'],
  110: ['110-A','110-B','110-C'],
  112: ['112-A','112-B','112-C'],
  118: ['118-A','118-B','118-C'],
  119: ['119-A','119-B','119-C'],
  120: ['120-A','120-B','120-C'],
  121: ['121-A','121-B','121-C'],
  122: ['122-A','122-B','122-C'],
  123: ['123-A','123-B','123-C'],
  124: ['124-A','124-B','124-C'],
  127: ['127-A','127-B','127-C'],
  Diğer: []
}

export const KATEGORILER = ['A-Tipi','B-Tipi','C-Tipi','D-Tipi','Parça render','Çizgisel animasyon','PR-Prospektüs','Sahne görseli','Video','Short Video','Reels','Diğer']

export const ROLLER = { super: 'Tam Yetkili', accview: 'Muhasebe Görüntüleyici', limited: 'Sınırlı Admin', guest: 'Misafir' }

export const DURUM_RENK = { beklemede: '#c0c0c0', onayda: '#f59e0b', tamamlandi: '#4ade80', kapandi: '#38bdf8', revizyonda: '#c084fc' }
export const DURUM_LABEL = { beklemede: 'Beklemede', onayda: 'Onayda', tamamlandi: 'Tamamlandı', kapandi: 'Kapandı', revizyonda: 'Revizyonda' }

export const fmt = (n) => !n && n !== 0 || isNaN(n) ? '—' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => new Date().toISOString().slice(0, 10)

export const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAA8CAYAAACXdFS3AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABDqSURBVHgB7Z3NbxtJdsBfVTdlx1lgOLdcAtNAECC5WN4EAbIBYiqLnAKMbew1G1MiqdElkbXZXDaTWJqZDHJYxHISBB6RtOjZY7AYe4A5BTOmAuSYGfqyxzX9FyznsIBGZNfb96qbdKvVn2Q3rY/6Afog+/ujXr2veiUgwE/kpU0AvAcCKnCGEIC9kjNa3QYYgMFgKBTh//ATuXSfvtmGs8sQJK58NBr1wWAwFIac/LMNpGGcbaHBlIWCB2AwGHKjtrFRqTWby/7v7Mk/Y7ArcA5AEBUwGAxzU2++y26LKh6ND0DKcr3x7gNAfNjp7D21wWAwGAKsrTVrAvHtdnvvjv/7er2522g0hkZwGAyGEwgp77bbH6+skqAQCH0hYFkIfNput+7Vm+ufSjAYDAYftVqtrBBeTD4r+kGSGkKIof4C4RujcRgMhhNICW/xXxYWl0qyd3TkwMgqTZdPw7HvgV1VlnwOBfD21avwF//8TzB8NYBL5bfht956Cz7/+x/D4XAIBTD4yDm6NvlADp79sJUQ8cXj9t4uFAhJ7oq0l2pQINQz9ME56ne73QEUSL2+fhukuEX37RW9TFfJ/n1F9u922u3ZK2+B3IRTgjP6dovu2fQFjD0/hc/YIQhzkHX/5EeoKpBVKBKlhkpCv9tu94KL2BxxRkerUpZuP37c6tZqGxXLUssOvWtW6dL9hWgc9S/+B96uXD323eE3Q/j8Rz+GwkGshX3NCWP0p1DBAbZdIcl8HwrEYtFvL7GA7FJj2ClCgLAApMA9e9QruqdBJG2VHGiN9WFq4YtYpl81OC1cvrwDnPczIeb8UMAr+jOX4Mi6fxYaRb87rFZYoIXEAB3cYQExWeSM5JZVWton4bHFn7vdRwN6D4C+e+CMxFbhPo7vk6YRFBrM9/7ub+HazT8HQ06QgLTspa/r6+t3IWdov9skKSrB7/nF1kLFcLahZyuk2K83167V3fIMiPMxdAAAAABJRU5ErkJggg=="

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
