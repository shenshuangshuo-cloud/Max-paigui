---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 321d63d690f3c9be8738872bda43d61f_aa658d4996ef11f1b799525400826444
    ReservedCode1: m+6XS7ZwzRGZtAs3ngUsifY4M9+y1mjhYiXg0KVITPt8AqNfqg1dlONm73Ggrl5N0EF3fvPpWZn2aM1/N8nnBNMATq+kcMCKLWcgL2TdsXxRlJ1W4z5QG0oaPx4ljEuwHZlhrlARhOYU4NWtNKdilj9Yf81FFzFr4nouNpfvyPzdsDFf3ITAs3ZOJLs=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 321d63d690f3c9be8738872bda43d61f_aa658d4996ef11f1b799525400826444
    ReservedCode2: m+6XS7ZwzRGZtAs3ngUsifY4M9+y1mjhYiXg0KVITPt8AqNfqg1dlONm73Ggrl5N0EF3fvPpWZn2aM1/N8nnBNMATq+kcMCKLWcgL2TdsXxRlJ1W4z5QG0oaPx4ljEuwHZlhrlARhOYU4NWtNKdilj9Yf81FFzFr4nouNpfvyPzdsDFf3ITAs3ZOJLs=
---

# 排柜工具（Paigui Tool）

一个本地可运行的排柜工具网站，基于 React + Vite + Tailwind 构建，用于按既定排柜规则自动完成货物排柜计算并渲染/导出结果。

## 功能

1. **排柜规则可视化展示**：柜型规格、排柜策略、输出格式、使用流程。
2. **货物数据录入/导入**：支持手动录入、Excel/CSV 导入，字段含物料名称、大类、厂家、温度属性、箱数、单箱体积、单箱净重、单箱毛重。
3. **自动排柜计算**：按排柜规则（硬约束、大类优先、利用率约 90%、物料最多拆 2 份、同物料同柜 > 同厂家相邻）自动计算。
4. **结果渲染与导出**：深红订单号标题、浅黄表头、黄色合计行、白色总计行、右侧 Q 列柜号序号，支持导出 CSV / Excel。

## 环境要求

- Node.js 18+（含 npm）

## 启动步骤

```bash
cd paigui
npm install
npm run dev
```

启动后，浏览器访问终端提示的地址（默认 http://localhost:5173）。

## 构建生产版本

```bash
npm run build
npm run preview
```

## 使用流程

1. 打开「数据录入」页，手动添加行，或点击「导入 Excel / CSV」上传文件，或点击「加载示例」。
2. 填写订单号，点击「开始排柜」。
3. 在「排柜结果」页查看渲染结果，点击「导出 CSV」或「导出 Excel」保存结果。

## 导入文件格式

CSV / Excel 首行应为列名（支持中文或英文键名）：

| 物料名称 | 大类 | 厂家 | 温度属性 | 箱数 | 单箱体积 | 单箱净重 | 单箱毛重 |
| --- | --- | --- | --- | --- | --- | --- | --- |

温度属性支持「常温」「冷冻」「冷藏」（冷藏按冷冻处理）。

## 目录结构

```
paigui/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── lib/
    │   └── paigui.js          # 排柜算法
    └── components/
        ├── RulesPage.jsx      # 规则展示页
        ├── DataEntry.jsx      # 数据录入/导入页
        └── ResultTable.jsx    # 结果渲染与导出
```

## 排柜算法说明

- 按温度属性将货物分为「常温」「冷冻」两组，分别开柜。
- 硬约束：各柜体积 ≤65CBM、毛重不超过柜型上限、常温/冷冻分离。
- 排序按「厂家 → 物料」，保证同厂家相邻、同物料尽量同柜。
- 每票物料优先整体装入已有柜；装不下时拆分为最多 2 份（先填已有柜余量，剩余入新柜）。
- 末柜若可装入小柜则自动降档，以提升利用率。
- 结果中展示各柜体积/重量利用率，供人工校验 85%~95% 目标区间。
*（内容由AI生成，仅供参考）*
