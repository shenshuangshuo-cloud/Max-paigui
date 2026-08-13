export default function RulesPage() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-red-800">一、柜型规格</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-3 py-2 text-left">柜型代码</th>
              <th className="border px-3 py-2 text-left">柜型名称</th>
              <th className="border px-3 py-2 text-left">体积上限</th>
              <th className="border px-3 py-2 text-left">毛重上限</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-3 py-2">40HQ</td>
              <td className="border px-3 py-2">40HQ 常温大柜</td>
              <td className="border px-3 py-2">≤68CBM（排柜硬约束按 ≤65CBM 执行）</td>
              <td className="border px-3 py-2">≤26000KG</td>
            </tr>
            <tr>
              <td className="border px-3 py-2">40RF</td>
              <td className="border px-3 py-2">40RF 冷冻大柜</td>
              <td className="border px-3 py-2">≤50CBM</td>
              <td className="border px-3 py-2">≤22000KG</td>
            </tr>
            <tr>
              <td className="border px-3 py-2">20GP</td>
              <td className="border px-3 py-2">20GP 常温小柜</td>
              <td className="border px-3 py-2">≤26CBM</td>
              <td className="border px-3 py-2">≤17000KG</td>
            </tr>
            <tr>
              <td className="border px-3 py-2">20RF</td>
              <td className="border px-3 py-2">20RF 冷冻小柜</td>
              <td className="border px-3 py-2">≤20CBM</td>
              <td className="border px-3 py-2">≤17000KG</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-red-800">二、排柜策略（优先级从高到低）</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-6">
          <li>
            <span className="font-semibold text-red-700">硬约束：</span>
            各柜体积 ≤65CBM、毛重不超过柜型上限、常温/冷冻分离。
          </li>
          <li>
            <span className="font-semibold text-red-700">大类优先：</span>
            食材尽可能同柜，包材 / 设备 / 工装可混放。
          </li>
          <li>
            <span className="font-semibold text-red-700">利用率约 90%：</span>
            体积和重量尽量落在 85% ~ 95% 区间。
          </li>
          <li>
            <span className="font-semibold text-red-700">物料最多拆 2 份：</span>
            单个物料最多拆分到 2 个柜。
          </li>
          <li>
            <span className="font-semibold text-red-700">软约束：</span>
            同物料尽量同柜，其次同厂家相邻。
          </li>
        </ol>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-red-800">三、输出格式</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
          <li><span className="font-semibold">标题行</span>：深红色，显示订单号。</li>
          <li><span className="font-semibold">表头</span>：浅黄色背景。</li>
          <li><span className="font-semibold">合计行</span>：黄色背景，含柜型名称 / 货物数 / 箱数 / 总体积 / 总净重 / 总毛重。</li>
          <li><span className="font-semibold">总计行</span>：白色背景，汇总柜型组合与总量。</li>
          <li><span className="font-semibold">右侧 Q 列</span>：柜号序号。</li>
        </ul>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-red-800">使用流程</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm leading-6">
          <li>在「数据录入」页手动添加、导入 Excel/CSV，或加载示例数据。</li>
          <li>填写订单号，点击「开始排柜」。</li>
          <li>在「排柜结果」页查看渲染结果，并导出 CSV 或 Excel。</li>
        </ol>
      </section>
    </div>
  );
}
