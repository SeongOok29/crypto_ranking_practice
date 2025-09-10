import { useEffect, useMemo, useState } from 'react';

function useFormatters(vs) {
  return useMemo(() => {
    if (vs === 'KRW') {
      return {
        money: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }),
        num: new Intl.NumberFormat('ko-KR'),
      };
    }
    return {
      money: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }),
      num: new Intl.NumberFormat('en-US'),
    };
  }, [vs]);
}

export default function Home() {
  const [vs, setVs] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('vs') || 'USD' : 'USD'));
  const [status, setStatus] = useState('로딩 중…');
  const [updated, setUpdated] = useState('');
  const [items, setItems] = useState([]);
  const fmt = useFormatters(vs);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('vs', vs);
  }, [vs]);

  async function load(manual = false) {
    try {
      setStatus(manual ? '새로고침 중…' : '로딩 중…');
      const res = await fetch('/api/markets?vs=' + encodeURIComponent(vs.toLowerCase()));
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API 오류 (${res.status}): ${text.slice(0, 160)}`);
      }
      const data = await res.json();
      setItems(data.items || []);
      const when = data.lastUpdated ? new Date(data.lastUpdated) : new Date();
      setUpdated(`마지막 업데이트: ${when.toLocaleString()} (${(data.vs || vs).toUpperCase()})`);
      setStatus(data.source === 'cache' ? '캐시에서 로드됨' : '실시간으로 로드됨');
    } catch (e) {
      console.error(e);
      setStatus(`데이터 로드 실패: ${e.message || e}`);
      if (!items.length) setItems([{ __error: true }]);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(() => load(false), 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vs]);

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1>시가총액 상위 30</h1>
          <p className="subtitle">CoinGecko 데이터 · 30초마다 자동 갱신</p>
        </div>
        <div className="toolbar">
          <label htmlFor="currency-select">통화</label>
          <select id="currency-select" aria-label="통화 선택" value={vs} onChange={(e) => setVs(e.target.value)}>
            <option value="USD">USD</option>
            <option value="KRW">KRW</option>
          </select>
        </div>
      </div>
      <div className="status">{status}</div>
      <div className="updated">{updated}</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>코인</th>
              <th>{`가격 (${vs})`}</th>
              <th>{`시가총액 (${vs})`}</th>
              <th>24h</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5}>로딩 중…</td></tr>
            )}
            {items.map((it) => {
              if (it.__error) return (<tr key="err"><td colSpan={5}>데이터를 불러올 수 없습니다.</td></tr>);
              const change = it.change_24h ?? 0;
              const cls = change >= 0 ? 'up' : 'down';
              const sign = change >= 0 ? '+' : '';
              return (
                <tr key={it.id}>
                  <td className="num">{it.rank}</td>
                  <td>
                    <div className="coin">
                      <img src={it.image} alt={it.symbol} />
                      <div>
                        <div>{it.name}</div>
                        <div className="symbol">{it.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="num">{fmt.money.format(it.price)}</td>
                  <td className="num">{fmt.money.format(it.market_cap)}</td>
                  <td className={`num ${cls}`}>{`${sign}${(change).toFixed(2)}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

