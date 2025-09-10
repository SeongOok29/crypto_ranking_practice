const $ = (sel)=>document.querySelector(sel);
const tbody = $('#tbody');
const statusEl = $('#status');
const updatedEl = $('#updated');
const currencySelect = $('#currency-select');

let currentVS = (localStorage.getItem('vs') || 'USD');
currencySelect.value = currentVS;

function makeFormatters(vs){
  if (vs === 'KRW') {
    return {
      money: new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW'}),
      num: new Intl.NumberFormat('ko-KR')
    };
  }
  return {
    money: new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}),
    num: new Intl.NumberFormat('en-US')
  };
}

let fmt = makeFormatters(currentVS);

async function load(manual=false) {
  try {
    statusEl.textContent = manual ? '새로고침 중…' : '로딩 중…';
    const res = await fetch('/api/markets?vs=' + encodeURIComponent(currentVS.toLowerCase()))
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API 오류 (${res.status}): ${text.slice(0,160)}`);
    }
    const { items, source, lastUpdated, vs } = await res.json();
    render(items);
    const when = lastUpdated ? new Date(lastUpdated) : new Date();
    updatedEl.textContent = `마지막 업데이트: ${when.toLocaleString()} (${vs.toUpperCase()})`;
    statusEl.textContent = source === 'cache' ? '캐시에서 로드됨' : '실시간으로 로드됨';
  } catch (e) {
    console.error(e);
    statusEl.textContent = `데이터 로드 실패: ${e.message || e}`;
    if (!tbody.children.length) {
      tbody.innerHTML = `<tr><td colspan="5">데이터를 불러올 수 없습니다. 네트워크 상태 또는 API 제한을 확인하고 잠시 후 다시 시도하세요.</td></tr>`;
    }
  }
}

function render(items){
  tbody.innerHTML = items.map(it => {
    const change = it.change_24h ?? 0;
    const cls = change >= 0 ? 'up' : 'down';
    const sign = change >= 0 ? '+' : '';
    return `
      <tr>
        <td class="num">${it.rank}</td>
        <td>
          <div class="coin">
            <img src="${it.image}" alt="${it.symbol}" />
            <div>
              <div>${it.name}</div>
              <div class="symbol">${it.symbol}</div>
            </div>
          </div>
        </td>
        <td class="num">${fmt.money.format(it.price)}</td>
        <td class="num">${fmt.money.format(it.market_cap)}</td>
        <td class="num ${cls}">${sign}${(change).toFixed(2)}%</td>
      </tr>
    `;
  }).join('');
}

currencySelect.addEventListener('change', () => {
  currentVS = currencySelect.value;
  localStorage.setItem('vs', currentVS);
  fmt = makeFormatters(currentVS);
  // 헤더 통화 표시 갱신 (테이블 헤더 텍스트는 간단히 변경)
  document.querySelectorAll('thead th')[2].textContent = `가격 (${currentVS})`;
  document.querySelectorAll('thead th')[3].textContent = `시가총액 (${currentVS})`;
  load(true);
});

load();
setInterval(() => load(), 30000);
