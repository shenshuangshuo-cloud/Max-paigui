import * as XLSX from 'xlsx';

const HEADERS = [
  '序号', '大类', '物料名称', '厂家', '温度属性', '箱数',
  '单箱体积(CBM)', '总体积(CBM)', '单箱净重(KG)', '总净重(KG)',
  '单箱毛重(KG)', '总毛重(KG)', '柜型', '体积利用率', '重量利用率', '备注', '柜号',
];

const r2 = (v, d = 2) => {
  const n = Number(v);
  return isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : 0;
};
const pct = (v) => (v * 100).toFixed(1) + '%';

function buildRows(result) {
  if (!result) return [];
  const rows = [];
  let seq = 0;

  for (const c of result.containers) {
    const uniqueNames = [...new Set(c.items.map((it) => it.name))];
    const boxCount = c.items.reduce((s, it) => s + it.boxes, 0);
    const totalNet = c.items.reduce((s, it) => s + it.perNet * it.boxes, 0);
    const volUtil = c.usedVol / c.maxVol;
    const wtUtil = c.usedWeight / c.maxWeight;

    c.items.forEach((it) => {
      seq += 1;
      rows.push({
        type: 'item',
        cells: [
          seq, it.category, it.name, it.factory, it.temp, it.boxes,
          r2(it.perVol, 3), r2(it.perVol * it.boxes, 3),
          r2(it.perNet, 2), r2(it.perNet * it.boxes, 2),
          r2(it.perWeight, 2), r2(it.perWeight * it.boxes, 2),
          c.typeName, '', '', '',
        ],
        q: c.id,
      });
    });

    rows.push({
      type: 'subtotal',
      cells: [
        '合计', `${uniqueNames.length} 种货物`, c.typeName, '', c.temp, boxCount,
        '', r2(c.usedVol, 3), '', r2(totalNet, 2), '', r2(c.usedWeight, 2),
        c.typeName, pct(volUtil), pct(wtUtil), '',
      ],
      q: c.id,
    });
  }

  const combo = Object.entries(result.combo).map(([k, v]) => `${k} × ${v}`).join(' + ');
  rows.push({
    type: 'total',
    cells: [
      '总计', '', `柜型组合：${combo}`, '', '', result.total.boxes,
      '', r2(result.total.vol, 3), '', r2(result.total.net, 2),
      '', r2(result.total.weight, 2), '', '', '', '',
    ],
    q: '',
  });

  return rows;
}

export default function ResultTable({ result, onBack }) {
  if (!result) {
    return (
      <div className="text-center text-slate-500 py-20">
        暂无排柜结果，请先在「数据录入」中添加数据并开始排柜。
        <button onClick={onBack} className="text-blue-600 underline ml-2">
          去录入
        </button>
      </div>
    );
  }

  const rows = buildRows(result);

  const exportCsv = () => {
    const lines = [HEADERS.join(',')];
    for (const r of rows) {
      const cells = [...r.cells, r.q];
      lines.push(cells.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `排柜结果_${result.orderNo || '未命名'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXlsx = () => {
    const aoa = [HEADERS];
    for (const r of rows) aoa.push([...r.cells, r.q]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '排柜结果');
    XLSX.writeFile(wb, `排柜结果_${result.orderNo || '未命名'}.xlsx`);
  };

  const cellAlign = (type, ci) => {
    if (ci === 0) return 'center';
    if (type === 'subtotal') return ci <= 4 || ci === 12 || ci === 15 ? 'left' : 'right';
    if (type === 'total') return ci <= 2 ? 'left' : 'right';
    return ci <= 4 ? 'left' : 'right';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">排柜结果</h2>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
          >
            返回录入
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            导出 CSV
          </button>
          <button
            onClick={exportXlsx}
            className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
          >
            导出 Excel
          </button>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded p-3 text-sm">
          <div className="font-semibold mb-1">提示：</div>
          <ul className="list-disc pl-5">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-auto max-h-[70vh]">
        <table className="w-full text-sm border-collapse" style={{ minWidth: '1560px' }}>
          <thead>
            <tr>
              <th
                colSpan={17}
                style={{ backgroundColor: '#8B0000', color: '#ffffff' }}
                className="border px-3 py-3 text-lg font-bold text-left"
              >
                订单号：{result.orderNo || '（未填写）'}
              </th>
            </tr>
            <tr style={{ backgroundColor: '#FFF2CC' }}>
              {HEADERS.map((h) => (
                <th key={h} className="border px-2 py-2 font-semibold text-slate-700 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              if (r.type === 'item') {
                return (
                  <tr key={i} className="bg-white">
                    {r.cells.map((v, ci) => (
                      <td
                        key={ci}
                        className="border px-2 py-1 whitespace-nowrap"
                        style={{ textAlign: cellAlign('item', ci) }}
                      >
                        {v === '' ? '' : v}
                      </td>
                    ))}
                    <td className="border px-2 py-1 text-center font-semibold" style={{ backgroundColor: '#FFFDE7' }}>
                      {r.q}
                    </td>
                  </tr>
                );
              }
              if (r.type === 'subtotal') {
                return (
                  <tr key={i} style={{ backgroundColor: '#FFFF00' }}>
                    {r.cells.map((v, ci) => (
                      <td
                        key={ci}
                        className="border px-2 py-1 font-semibold whitespace-nowrap"
                        style={{ textAlign: cellAlign('subtotal', ci) }}
                      >
                        {v === '' ? '' : v}
                      </td>
                    ))}
                    <td className="border px-2 py-1 text-center font-bold">{r.q}</td>
                  </tr>
                );
              }
              return (
                <tr key={i} className="bg-white font-bold">
                  {r.cells.map((v, ci) => (
                    <td
                      key={ci}
                      className="border px-2 py-1 whitespace-nowrap"
                      style={{ textAlign: cellAlign('total', ci) }}
                    >
                      {v === '' ? '' : v}
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
