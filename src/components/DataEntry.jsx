import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const FIELDS = [
  { key: '物料名称', label: '物料名称', cls: 'w-36' },
  { key: '大类', label: '大类', cls: 'w-24' },
  { key: '厂家', label: '厂家', cls: 'w-24' },
  { key: '温度属性', label: '温度属性', cls: 'w-24' },
  { key: '箱数', label: '箱数', cls: 'w-20' },
  { key: '单箱体积', label: '单箱体积(CBM)', cls: 'w-28' },
  { key: '单箱净重', label: '单箱净重(KG)', cls: 'w-28' },
  { key: '单箱毛重', label: '单箱毛重(KG)', cls: 'w-28' },
];

const SAMPLE = [
  { '物料名称': '冷冻牛肉', '大类': '食材', '厂家': 'A食品厂', '温度属性': '冷冻', '箱数': 160, '单箱体积': 0.05, '单箱净重': 15, '单箱毛重': 16.2 },
  { '物料名称': '冷冻鸡肉', '大类': '食材', '厂家': 'A食品厂', '温度属性': '冷冻', '箱数': 260, '单箱体积': 0.04, '单箱净重': 10, '单箱毛重': 11 },
  { '物料名称': '冷冻水饺', '大类': '食材', '厂家': 'B食品厂', '温度属性': '冷冻', '箱数': 300, '单箱体积': 0.035, '单箱净重': 8, '单箱毛重': 9 },
  { '物料名称': '大米', '大类': '食材', '厂家': 'C粮厂', '温度属性': '常温', '箱数': 400, '单箱体积': 0.06, '单箱净重': 20, '单箱毛重': 21 },
  { '物料名称': '食用油', '大类': '食材', '厂家': 'C粮厂', '温度属性': '常温', '箱数': 220, '单箱体积': 0.08, '单箱净重': 25, '单箱毛重': 26 },
  { '物料名称': '调味料', '大类': '食材', '厂家': 'D调味厂', '温度属性': '常温', '箱数': 180, '单箱体积': 0.03, '单箱净重': 5, '单箱毛重': 5.5 },
  { '物料名称': '包装纸箱', '大类': '包材', '厂家': 'E包材厂', '温度属性': '常温', '箱数': 300, '单箱体积': 0.02, '单箱净重': 2, '单箱毛重': 2.4 },
  { '物料名称': '不锈钢设备', '大类': '设备', '厂家': 'F设备厂', '温度属性': '常温', '箱数': 12, '单箱体积': 1.1, '单箱净重': 320, '单箱毛重': 340 },
];

export default function DataEntry({ initialRows, initialOrderNo, onCalc }) {
  const [rows, setRows] = useState(() => (initialRows && initialRows.length ? initialRows : []));
  const [orderNo, setOrderNo] = useState(initialOrderNo || '');
  const fileRef = useRef(null);

  const blank = () => ({
    '物料名称': '', '大类': '食材', '厂家': '', '温度属性': '常温',
    '箱数': '', '单箱体积': '', '单箱净重': '', '单箱毛重': '',
  });

  const addRow = () => setRows((prev) => [...prev, blank()]);
  const update = (i, key, val) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const remove = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!json.length) {
        window.alert('文件中没有数据');
        return;
      }
      setRows(json);
    } catch (err) {
      window.alert('导入失败：' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const csv =
      '物料名称,大类,厂家,温度属性,箱数,单箱体积,单箱净重,单箱毛重\n' +
      '示例物料,食材,示例厂家,常温,100,0.05,10,11\n';
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '排柜导入模板.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setRows(SAMPLE.map((r) => ({ ...r })));
    setOrderNo('PO20260813');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl shadow p-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">订单号</label>
          <input
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="如 PO20260813"
            className="border rounded px-3 py-2 text-sm w-48"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current && fileRef.current.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            导入 Excel / CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
          >
            下载模板
          </button>
          <button
            onClick={loadSample}
            className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
          >
            加载示例
          </button>
          <button
            onClick={() => setRows([])}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
          >
            清空
          </button>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => onCalc(rows, orderNo)}
            disabled={!rows.length}
            className="px-5 py-2 bg-red-700 text-white rounded text-sm font-medium hover:bg-red-800 disabled:opacity-40"
          >
            开始排柜
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-auto max-h-[70vh]">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="border px-2 py-2 w-10">#</th>
              {FIELDS.map((f) => (
                <th key={f.key} className={`border px-2 py-2 ${f.cls}`}>
                  {f.label}
                </th>
              ))}
              <th className="border px-2 py-2 w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="border px-2 py-1 text-center text-slate-400">{i + 1}</td>
                {FIELDS.map((f) => (
                  <td key={f.key} className="border p-1">
                    <input
                      value={r[f.key] ?? ''}
                      onChange={(e) => update(i, f.key, e.target.value)}
                      className="w-full px-1 py-1 border-0 focus:ring-1 focus:ring-blue-300 rounded text-sm"
                      placeholder={f.label}
                    />
                  </td>
                ))}
                <td className="border p-1 text-center">
                  <button onClick={() => remove(i)} className="text-red-600 hover:underline text-xs">
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={10} className="border p-6 text-center text-slate-400">
                  暂无数据，可手动添加、导入文件或加载示例
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="px-4 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
      >
        + 添加行
      </button>
    </div>
  );
}
