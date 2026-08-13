// 排柜规则与核心算法

// 柜型规格（策略① 硬约束：各柜体积 ≤65CBM，故 40HQ 排柜上限取 65CBM）
export const CONTAINER_TYPES = {
  '40HQ': { key: '40HQ', name: '40HQ常温大柜', specVol: 68, maxVol: 65, maxWeight: 26000, temp: '常温', size: '大柜' },
  '40RF': { key: '40RF', name: '40RF冷冻大柜', specVol: 50, maxVol: 50, maxWeight: 22000, temp: '冷冻', size: '大柜' },
  '20GP': { key: '20GP', name: '20GP常温小柜', specVol: 26, maxVol: 26, maxWeight: 17000, temp: '常温', size: '小柜' },
  '20RF': { key: '20RF', name: '20RF冷冻小柜', specVol: 20, maxVol: 20, maxWeight: 17000, temp: '冷冻', size: '小柜' },
};

const LARGE_TYPE = { '常温': '40HQ', '冷冻': '40RF' };
const SMALL_TYPE = { '常温': '20GP', '冷冻': '20RF' };

function toNum(v) {
  const n = parseFloat(String(v ?? '').replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// 解析并校验物料数据（支持中英文键名）
export function normalizeMaterials(rows) {
  const materials = [];
  const warnings = [];
  (rows || []).forEach((r, i) => {
    const name = String(r['物料名称'] ?? r.name ?? '').trim();
    if (!name) {
      warnings.push(`第 ${i + 1} 行缺少物料名称，已跳过`);
      return;
    }
    const category = String(r['大类'] ?? r.category ?? '').trim() || '未分类';
    const factory = String(r['厂家'] ?? r.factory ?? '').trim() || '未知厂家';

    let temp = String(r['温度属性'] ?? r.temp ?? '').trim();
    if (/冻|冷藏|冷/.test(temp)) temp = '冷冻';
    else if (/常温|常/.test(temp)) temp = '常温';
    else temp = '常温';

    const boxes = Math.round(toNum(r['箱数'] ?? r.boxes));
    const perVol = toNum(r['单箱体积'] ?? r.perVol);
    const perNet = toNum(r['单箱净重'] ?? r.perNet);
    const perWeight = toNum(r['单箱毛重'] ?? r.perWeight);

    if (boxes <= 0 || perVol <= 0) {
      warnings.push(`物料「${name}」的箱数或单箱体积无效，已跳过`);
      return;
    }
    materials.push({ name, category, factory, temp, boxes, perVol, perNet, perWeight });
  });
  return { materials, warnings };
}

function makeContainer(temp, typeKey) {
  const t = CONTAINER_TYPES[typeKey];
  return {
    id: '',
    type: typeKey,
    typeName: t.name,
    temp,
    maxVol: t.maxVol,
    maxWeight: t.maxWeight,
    usedVol: 0,
    usedWeight: 0,
    items: [],
  };
}

function canFit(c, item, n) {
  return (c.usedVol + item.perVol * n <= c.maxVol + 1e-6) &&
         (c.usedWeight + item.perWeight * n <= c.maxWeight + 1e-6);
}

function maxFit(c, item) {
  const byVol = Math.floor((c.maxVol - c.usedVol) / item.perVol);
  const byWeight = item.perWeight > 0
    ? Math.floor((c.maxWeight - c.usedWeight) / item.perWeight)
    : Infinity;
  return Math.max(0, Math.min(byVol, byWeight));
}

function place(c, item, n) {
  c.items.push({ ...item, boxes: n });
  c.usedVol += item.perVol * n;
  c.usedWeight += item.perWeight * n;
}

const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// 主排柜函数
export function runPaigui(rawRows, options = {}) {
  const { materials, warnings } = normalizeMaterials(rawRows);
  const orderNo = options.orderNo || '';
  const containers = [];
  let seq = 0;

  const groups = { '常温': [], '冷冻': [] };
  materials.forEach((m) => groups[m.temp].push(m));

  for (const temp of ['常温', '冷冻']) {
    const items = groups[temp];
    if (items.length === 0) continue;

    // 软约束：同厂家相邻 → 同物料尽量同柜
    items.sort((a, b) =>
      a.factory.localeCompare(b.factory, 'zh') || a.name.localeCompare(b.name, 'zh'));

    const open = [];
    const openNew = () => {
      const c = makeContainer(temp, LARGE_TYPE[temp]);
      seq += 1;
      c.id = `柜${seq}`;
      containers.push(c);
      open.push(c);
      return c;
    };

    for (const item of items) {
      let remaining = item.boxes;

      // 阶段1：尝试将整票物料装入单个已有柜（优先同厂家）
      let whole = null;
      for (const c of open) {
        if (!canFit(c, item, remaining)) continue;
        if (!whole) {
          whole = c;
        } else {
          const cSameFactory = c.items.some((x) => x.factory === item.factory);
          const wSameFactory = whole.items.some((x) => x.factory === item.factory);
          const freeC = (c.maxVol - c.usedVol) + (c.maxWeight - c.usedWeight) / 1000;
          const freeW = (whole.maxVol - whole.usedVol) + (whole.maxWeight - whole.usedWeight) / 1000;
          if (cSameFactory && !wSameFactory) whole = c;
          else if (cSameFactory === wSameFactory && freeC < freeW) whole = c;
        }
      }
      if (whole) {
        place(whole, item, remaining);
        continue;
      }

      // 阶段2：拆分为最多 2 份（先填已有柜余量，剩余入新柜）
      let best = null;
      let bestFit = 0;
      for (const c of open) {
        const f = maxFit(c, item);
        if (f > 0 && f > bestFit) {
          best = c;
          bestFit = f;
        }
      }
      if (best) {
        const n = Math.min(remaining, bestFit);
        place(best, item, n);
        remaining -= n;
      }

      if (remaining > 0) {
        const c = openNew();
        const fit = maxFit(c, item);
        if (fit >= remaining) {
          place(c, item, remaining);
        } else {
          // 单票物料体量超过单柜上限（罕见），继续拆分并告警
          place(c, item, fit);
          remaining -= fit;
          let extraParts = 1;
          while (remaining > 0) {
            const cc = openNew();
            const f2 = maxFit(cc, item);
            if (f2 <= 0) {
              warnings.push(`物料「${item.name}」单箱体积或毛重超过柜型上限，无法完整排入`);
              break;
            }
            const n2 = Math.min(remaining, f2);
            place(cc, item, n2);
            remaining -= n2;
            extraParts += 1;
          }
          if (extraParts > 1) {
            warnings.push(`物料「${item.name}」因体量过大被拆分到 ${extraParts + 1} 个柜`);
          }
        }
      }
    }

    // 末柜降档：最后开柜若可装入小柜，则降为小柜以提升利用率
    if (open.length > 0) {
      const last = open[open.length - 1];
      const small = CONTAINER_TYPES[SMALL_TYPE[temp]];
      if (last.usedVol <= small.maxVol + 1e-6 && last.usedWeight <= small.maxWeight + 1e-6) {
        last.type = small.key;
        last.typeName = small.name;
        last.maxVol = small.maxVol;
        last.maxWeight = small.maxWeight;
      }
    }
  }

  const total = containers.reduce((acc, c) => {
    acc.vol += c.usedVol;
    acc.net += c.items.reduce((s, it) => s + it.perNet * it.boxes, 0);
    acc.weight += c.usedWeight;
    acc.boxes += c.items.reduce((s, it) => s + it.boxes, 0);
    acc.items += c.items.length;
    return acc;
  }, { vol: 0, net: 0, weight: 0, boxes: 0, items: 0 });

  const combo = {};
  containers.forEach((c) => {
    combo[c.typeName] = (combo[c.typeName] || 0) + 1;
  });

  return {
    orderNo,
    containers,
    total: {
      vol: round(total.vol, 3),
      net: round(total.net, 2),
      weight: round(total.weight, 2),
      boxes: total.boxes,
      items: total.items,
    },
    combo,
    warnings,
  };
}
