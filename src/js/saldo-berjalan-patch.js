
/*
TEMPATKAN file ini SETELAH script utama kamu:
<script src="saldo-berjalan-patch.js"></script>

Patch:
- UI tidak berubah
- Saldo akhir bulan lalu -> saldo awal bulan ini
*/

function getPrevMonth(ym){
 const [y,m]=ym.split('-').map(Number);
 const d=new Date(y,m-2,1);
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
}

function hitungSaldoSampai(bulan){
 let masuk=0;
 let keluar=0;

 Object.entries(data.bayar||{}).forEach(([ym,rows])=>{
   if(ym<=bulan){
     Object.keys(rows||{}).forEach(id=>{
       masuk += (data.warga[id]?.iuran||0);
     });
   }
 });

 Object.values(data.keluar||{}).forEach(k=>{
   if(k.date?.slice(0,7)<=bulan){
     keluar += (k.amt||0);
   }
 });

 return masuk-keluar;
}

function getSaldoAwal(bulan){
 return hitungSaldoSampai(
   getPrevMonth(bulan)
 );
}

const _renderRekap = renderRekap;

renderRekap = function(){

 _renderRekap();

 const bulan=getBulan();

 const saldoAwal=getSaldoAwal(bulan);

 const bayarBulan=data.bayar[bulan]||{};

 const pemasukan=
 Object.keys(bayarBulan)
 .reduce((s,id)=>
   s+(data.warga[id]?.iuran||0)
 ,0);

 const pengeluaran=
 Object.values(data.keluar)
 .filter(x=>x.date?.slice(0,7)===bulan)
 .reduce((a,b)=>a+(b.amt||0),0);

 const saldoAkhir=
 saldoAwal+
 pemasukan-
 pengeluaran;

 const target=
 document.querySelector(
 "#rekap-content .rekap-card"
 );

 if(target){

 const block=
 document.createElement("div");

 block.className=
 "rekap-card";

 block.innerHTML=
 `
 <div class="rekap-title">
 Saldo Berjalan
 </div>

 <div class="rekap-row">
 <span>Saldo Awal</span>
 <span>${fmt(saldoAwal)}</span>
 </div>

 <div class="rekap-row">
 <span>Pemasukan</span>
 <span>${fmt(pemasukan)}</span>
 </div>

 <div class="rekap-row">
 <span>Pengeluaran</span>
 <span>-${fmt(pengeluaran)}</span>
 </div>

 <div class="rekap-row">
 <span>Saldo Akhir</span>
 <span>${fmt(saldoAkhir)}</span>
 </div>
 `;

 target.before(block);

 }

};

const _updateMetrics=
updateMetrics;

updateMetrics=
function(){

 _updateMetrics();

 const saldo=
 hitungSaldoSampai(
   getBulan()
 );

 const el=
 document.getElementById(
 "m-saldo"
 );

 if(el)
  el.textContent=
  fmt(saldo);

};

renderAll();
