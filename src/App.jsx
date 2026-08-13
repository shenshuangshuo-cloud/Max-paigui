import { useState } from 'react';
import RulesPage from './components/RulesPage.jsx';
import DataEntry from './components/DataEntry.jsx';
import ResultTable from './components/ResultTable.jsx';
import { runPaigui } from './lib/paigui.js';

const TABS = [
  ['rules', '排柜规则'],
  ['data', '数据录入'],
  ['result', '排柜结果'],
];

export default function App() {
  const [tab, setTab] = useState('rules');
  const [rows, setRows] = useState([]);
  const [orderNo, setOrderNo] = useState('');
  const [result, setResult] = useState(null);

  const handleCalc = (inputRows, inputOrderNo) => {
    setRows(inputRows);
    setOrderNo(inputOrderNo);
    if (!inputRows || !inputRows.length) {
      setResult(null);
      return;
    }
    setResult(runPaigui(inputRows, { orderNo: inputOrderNo }));
    setTab('result');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-slate-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">排柜工具</h1>
          <nav className="flex gap-2 text-sm">
            {TABS.map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-3 py-1.5 rounded ${
                  tab === k ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'rules' && <RulesPage />}
        {tab === 'data' && (
          <DataEntry initialRows={rows} initialOrderNo={orderNo} onCalc={handleCalc} />
        )}
        {tab === 'result' && <ResultTable result={result} onBack={() => setTab('data')} />}
      </main>
    </div>
  );
}
