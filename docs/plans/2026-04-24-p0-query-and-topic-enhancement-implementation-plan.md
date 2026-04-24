# P0 查询补全与专题增强实施计划

> For Hermes: 如进入实施，优先按本计划逐任务推进；每完成一个任务，先做最小验证，再进入下一个任务。

目标：在不改动当前 demo 主架构的前提下，把现有 `/map` + 专题页升级为“可用的业务查询前台”，补齐民族/经济情况等查询条件、URL 状态恢复、详情信息分组，以及专题页的内容组织能力。

架构：继续沿用 `pages / widgets / entities / shared` 分层，不新增重型状态管理。查询状态仍以 URL 为单一事实来源，React Query 继续负责数据读取，`entities/village` 负责 query/facets/filter 契约，`widgets/map` 负责展示组合和组件拆分。

技术栈：React 19、React Router 7、TanStack Query、TypeScript、Vitest、MapLibre、Vite。

---

一、实施前置确认结论

0. 模式
- 结论：personal flow（THS 语境下的本地轻流程）
- 理由：当前任务是本地规划与后续本地实现，不涉及 taskId、公司流水线、测试环境部署或正式 Harness 闭环。

1. 任务类型
- 结论：feature + research/spec 已确认后的 implementation plan
- 理由：本次不是直接写代码，而是把已确认的 P0 范围细化到文件级执行计划。

2. 风险等级
- 结论：L2
- 理由：涉及 query contract、URL 状态、地图/列表/详情联动和大组件拆分，但不涉及真实空间分析或后端重构。

3. 默认 workflow
- 结论：workflow-router -> ths-personal-dev-flow -> writing-plans
- 理由：已完成模式确认，当前进入个人轻流程下的详细规划阶段。

4. agent mode
- 结论：standard
- 理由：需要做代码面勘察、计划拆分、跨文件边界定义，但不需要多代理辩论。

5. 必调 superpower skills
- 结论：workflow-router、ths-personal-dev-flow、writing-plans
- 理由：任务同时涉及模式路由、THS 本地轻流程和多步骤实施计划编写。

6. 升级条件
- 结论：若发现需新增后台接口、真实坐标依赖、复杂数据归一清洗、跨专题/地图共享状态爆炸，则升级到 deep 级别并刷新计划。
- 理由：这些变化会把当前 P0 从前台补强升级为跨域改造。

7. 完成前统一验收
- 结论：必须同时通过类型检查/构建、query/filter 单测、MapPage URL 恢复测试、专题页联动回归测试。
- 理由：P0 核心风险不在样式，而在状态一致性和字段契约是否真的闭环。

---

二、当前代码基线摘要

1. 当前页面结构
- `src/app/router/AppRouter.tsx`
  - 已有 `/overview`
  - 已有 `/map`
  - 已有 `/folkways`
  - 已有 `/toponymy`
- 当前还没有 `/analytics` 和后台管理页。

2. 当前数据入口
- `src/entities/village/api/VillageRepository.ts`
  - mock 模式下读取 `public/mock/villages.json` 和 `public/mock/facets.json`
  - api 模式下请求 `GET /villages` 与 `GET /facets`
- `src/entities/village/api/types.ts`
  - 当前 query 仅支持 `city / town / q / dialectGroup / timelineEnd`
  - 当前 facets 仅支持 `cities / towns / dialectGroups / timelineRange`

3. 当前核心展示链路
- `src/pages/map/MapPage.tsx`
  - 从 URL 读取 `mode/city/town/dialect/q/year/primaryId`
  - 组装 query 调 `useVillagesQuery`
  - 通过 `MapWorkspace` 组织筛选、地图、列表、详情
- `src/widgets/map/MapWorkspace.tsx`
  - 目前 670 行，已明显承担过多职责
  - 内含 mode tabs、filter panel、village list、map canvas、detail panel

4. 当前详情与专题字段
- `src/shared/mappings/village-field-mapping.ts`
  - 已有 detailSections / highlightFields / metrics
  - 但字段组织仍偏展示，不足以覆盖“业务完整详情”
- `src/pages/folkways/FolkwaysPage.tsx`
  - 目前只基于单一 `folkways` 高亮字段筛出少量卡片
- `src/pages/toponymy/ToponymyPage.tsx`
  - 目前只基于 `toponymy` 字段做简单卡片

5. 当前 mock 数据约束
- `scripts/build_mock_data.py`
  - 当前 facets 只产出 cities/towns/dialectGroups/timelineRange
  - 还没有民族 facets、经济情况 facets、专题提取辅助字段
- 当前 geometry 仍是广东范围内稳定假点位，只用于 demo。

---

三、P0 范围与非范围

P0 范围
- 新增民族筛选
- 新增经济情况筛选
- 多条件组合查询
- URL 状态完整回显和恢复
- 结果为空、primaryId 失效、切筛选清 selection 的行为补齐
- 详情分组重排，突出行政/时间/语言族群/经济/专题字段
- 专题页从“静态展示卡”升级到“按字段组织的可回跳内容列表”

P0 非范围
- 不新增真实空间分析
- 不新增 nearby village 查询
- 不新增 analytics 页面
- 不新增后台 CRUD/导入导出
- 不修改 `primaryId` 生成规则
- 不改变 geometry 的 demo 属性

---

四、建议改动文件清单

高优先级直接改动
- 修改：`src/entities/village/api/types.ts`
- 修改：`src/entities/village/lib/filterVillages.ts`
- 修改：`src/entities/village/lib/filterVillages.test.ts`
- 修改：`src/entities/village/api/VillageRepository.ts`
- 修改：`src/entities/village/api/VillageRepository.test.ts`
- 修改：`src/entities/village/model/types.ts`
- 修改：`src/entities/village/model/adapter.ts`
- 修改：`src/pages/map/MapPage.tsx`
- 修改：`src/pages/map/MapPage.test.tsx`
- 修改：`src/shared/mappings/query-param-mapping.ts`
- 修改：`src/shared/mappings/village-field-mapping.ts`
- 修改：`src/shared/mappings/village-field-mapping.test.ts`
- 修改：`src/widgets/map/MapWorkspace.tsx`
- 修改：`src/pages/folkways/FolkwaysPage.tsx`
- 修改：`src/pages/toponymy/ToponymyPage.tsx`
- 修改：`scripts/build_mock_data.py`

建议新增文件
- 新增：`src/widgets/map/types.ts`
- 新增：`src/widgets/map/ModeTabs.tsx`
- 新增：`src/widgets/map/FilterPanel.tsx`
- 新增：`src/widgets/map/VillageList.tsx`
- 新增：`src/widgets/map/MapCanvas.tsx`
- 新增：`src/widgets/map/DetailPanel.tsx`
- 新增：`src/widgets/map/topic-helpers.ts`
- 新增：`src/widgets/map/filter-options.ts`
- 新增：`src/pages/folkways/topic-extractors.ts`
- 新增：`src/pages/toponymy/topic-extractors.ts`

可选新增（仅在字段归一需求明显时）
- 新增：`src/entities/village/lib/normalizeFacetValue.ts`
- 新增：`src/entities/village/lib/normalizeFacetValue.test.ts`

---

五、数据契约目标形态

1. query contract 目标

文件：`src/entities/village/api/types.ts`

目标接口：

```ts
export interface VillageQuery {
  city?: string;
  town?: string;
  q?: string;
  dialectGroup?: string;
  ethnicity?: string;
  economy?: string;
  timelineEnd?: number | null;
}
```

说明：
- `ethnicity` 对应 raw 字段 `居民民族`
- `economy` 对应 raw 字段 `村经济情况`
- 仍保持前台 query 语义平铺，不在 P0 引入复杂 DSL

2. facets contract 目标

```ts
export interface VillageFacets {
  cities: string[];
  towns: string[];
  dialectGroups: string[];
  ethnicities: string[];
  economies: string[];
  timelineRange: { min: number | null; max: number | null };
}
```

说明：
- mock facets 和 api facets 统一对齐该结构
- 如后端暂时无 `ethnicities/economies`，mock 模式先打通，api 模式保持兼容空数组

3. record view-model 目标

文件：`src/entities/village/model/types.ts`

建议在 `VillageRecord` 上增加轻量派生字段，避免 UI 到处读中文 raw key：

```ts
export interface VillageRecord {
  city?: string;
  town?: string;
  name: string;
  primaryId: string;
  dialectGroup: string;
  ethnicity?: string;
  economy?: string;
  geometry: VillageGeometry;
  raw: RawVillageFields;
  searchText: string;
  timeline: {
    rawLabel?: string;
    sortYear: number | null;
  };
}
```

说明：
- 不删除 `raw`
- 只补最常用的业务字段派生，降低 UI 直接访问 raw 的频率

---

六、实施任务拆分

### Task 1：扩展 mock facets 与 record 派生字段

目标：让 mock 数据先具备民族/经济 facets 和 record 级派生字段，为后续 query/UI 铺路。

文件：
- 修改：`scripts/build_mock_data.py`
- 修改：`src/entities/village/model/types.ts`
- 修改：`src/entities/village/model/adapter.ts`
- 测试：`src/entities/village/model/adapter.test.ts`

步骤：
1. 在 `build_mock_data.py -> build_facets()` 中增加 `ethnicities`、`economies`
2. 值来源分别取 `raw["居民民族"]` 和 `raw["村经济情况"]`
3. 先使用“去空 + 去重 + 排序”策略，不做复杂语义归一化
4. 在 `VillageRecord` 中增加 `ethnicity`、`economy`
5. 在 `adaptVillageRecord()` 中从 `raw` 派生这两个字段
6. 补 adapter test，验证空值与非空值映射

建议代码片段：

```ts
ethnicity: record.raw?.居民民族 || undefined,
economy: record.raw?.村经济情况 || undefined,
```

验证：
- 运行：`npm run test -- src/entities/village/model/adapter.test.ts`
- 预期：adapter test 通过
- 如修改了 mock 文件生成：运行 `npm run mock:build`

完成定义：
- mock facets 已含 `ethnicities/economies`
- `VillageRecord` 可以直接消费 `ethnicity/economy`

### Task 2：扩 query/facets repository 契约

目标：把新筛选维度纳入 repository 与 query string 生成逻辑。

文件：
- 修改：`src/entities/village/api/types.ts`
- 修改：`src/entities/village/api/VillageRepository.ts`
- 测试：`src/entities/village/api/VillageRepository.test.ts`

步骤：
1. 扩展 `VillageQuery` 和 `VillageFacets` 类型
2. 在 `buildQueryString()` 中追加 `ethnicity/economy`
3. mock 模式下继续走 `filterVillages()`
4. api 模式下直接把 query 参数透传给后端
5. 补 repository test，验证 query string 拼接与 mock 过滤行为

建议代码片段：

```ts
if (params?.ethnicity) {
  query.set('ethnicity', params.ethnicity);
}
if (params?.economy) {
  query.set('economy', params.economy);
}
```

验证：
- 运行：`npm run test -- src/entities/village/api/VillageRepository.test.ts`
- 预期：query string 和 facets 相关测试通过

完成定义：
- repository 层对新 query/facets 已无类型缺口

### Task 3：扩本地筛选逻辑和测试

目标：让 mock 模式下组合筛选真实可用。

文件：
- 修改：`src/entities/village/lib/filterVillages.ts`
- 修改：`src/entities/village/lib/filterVillages.test.ts`

步骤：
1. 在 `VillageQuery` 本地副本中补 `ethnicity/economy`
2. 为 `ethnicity/economy` 添加精确匹配判断
3. 保持现有 `q/city/town/dialectGroup/timelineEnd` 逻辑不变
4. 增加组合条件测试：城市 + 民族 + 经济 + 时间 + 关键词
5. 增加空值回退测试：当村记录缺民族/经济时不应误匹配

建议代码片段：

```ts
if (query.ethnicity && village.ethnicity !== query.ethnicity) {
  return false;
}
if (query.economy && village.economy !== query.economy) {
  return false;
}
```

验证：
- 运行：`npm run test -- src/entities/village/lib/filterVillages.test.ts`
- 预期：新增组合过滤场景通过

完成定义：
- mock 模式已支持多条件组合过滤

### Task 4：扩 URL 参数映射与 MapPage 状态读取

目标：把民族/经济筛选纳入 URL 单一事实来源。

文件：
- 修改：`src/shared/mappings/query-param-mapping.ts`
- 修改：`src/pages/map/MapPage.tsx`
- 测试：`src/pages/map/MapPage.test.tsx`

步骤：
1. 在 query param mapping 中新增 `ethnicity`、`economy`
2. `MapPage` 从 `searchParams` 读取这两个值
3. `useVillagesQuery()` 参数中传入这两个字段
4. `MapWorkspace.filters` 结构补这两个值
5. `onFiltersChange()` 的 URL 更新逻辑补这两个字段
6. 保持筛选变更清除 `primaryId` 的规则
7. 新增 URL restore test：直接访问带 city/town/ethnicity/economy/q 的 URL，UI 状态能恢复

建议代码片段：

```ts
const ethnicity = searchParams.get(queryParamMapping.ethnicity) ?? '';
const economy = searchParams.get(queryParamMapping.economy) ?? '';
```

验证：
- 运行：`npm run test -- src/pages/map/MapPage.test.tsx`
- 预期：已有 history 测试不回归，新增 URL 恢复测试通过

完成定义：
- 新筛选维度进入 URL 并可恢复

### Task 5：拆分 MapWorkspace 大组件

目标：把 670 行单文件拆成稳定组件边界，减少后续 P1/P2 扩展风险。

文件：
- 修改：`src/widgets/map/MapWorkspace.tsx`
- 新增：`src/widgets/map/types.ts`
- 新增：`src/widgets/map/ModeTabs.tsx`
- 新增：`src/widgets/map/FilterPanel.tsx`
- 新增：`src/widgets/map/VillageList.tsx`
- 新增：`src/widgets/map/MapCanvas.tsx`
- 新增：`src/widgets/map/DetailPanel.tsx`

拆分原则：
- `MapWorkspace.tsx` 只保留布局拼装
- `ModeTabs` 只管模式切换按钮
- `FilterPanel` 只管筛选控件
- `VillageList` 只管结果列表
- `MapCanvas` 只管地图 source/layer/sync
- `DetailPanel` 只管详情展示
- 共享 prop type 收敛到 `types.ts`

注意事项：
- 不改变现有 portrait / landscape DOM 测试标识
- 不改变 `MapCanvas` 当前 MapLibre source/layer 逻辑
- 不把 URL 或 query 解析下沉到 widget 层

验证：
- 运行：`npm run test -- src/pages/map/MapPage.test.tsx`
- 运行：`npm run build`
- 预期：布局测试和构建通过

完成定义：
- `MapWorkspace.tsx` 仅保留编排逻辑，文件长度显著下降

### Task 6：补 FilterPanel 的业务筛选和清空交互

目标：让筛选面板形成完整业务入口。

文件：
- 修改：`src/widgets/map/FilterPanel.tsx`
- 可选新增：`src/widgets/map/filter-options.ts`
- 测试：沿用 `src/pages/map/MapPage.test.tsx`

步骤：
1. 在筛选面板新增“民族”“经济情况”下拉框
2. 保持方言筛选只在 dialect 模式下显示
3. 时间轴只在 timeline 模式下显示
4. 新增“清空筛选”按钮
5. 清空时保留当前 mode，清除 city/town/q/dialect/ethnicity/economy/year/primaryId
6. 若有需要，可把 facets 到 option list 的构造收敛到 `filter-options.ts`

建议交互约束：
- `q` 仍走 replaceState
- 离散筛选仍走 pushState
- 清空筛选走 pushState

验证：
- 运行：`npm run test -- src/pages/map/MapPage.test.tsx`
- 手工检查：切换模式后无无效字段残留

完成定义：
- 筛选入口完整，清空行为可预期

### Task 7：重构 DetailPanel 的分组展示和高亮字段策略

目标：把当前“模式说明 + 字段罗列”升级为更可读的业务详情。

文件：
- 修改：`src/shared/mappings/village-field-mapping.ts`
- 修改：`src/widgets/map/DetailPanel.tsx`
- 测试：`src/shared/mappings/village-field-mapping.test.ts`

建议 detailSections 目标分组：
- 行政与定位：`归属市 / 归属镇 / 位置`
- 建村与沿革：`建村时间 / 村历史沿革 / 村名来源`
- 人口与族群：`居民总人数 / 男性人数 / 女性人数 / 居民民族 / 世居村民姓氏`
- 语言与方言：`村居民使用语言情况`
- 经济与治理：`村经济情况 / 村规民约`
- 专题内容：`村俗或传统民居或村特色产品 / 村里名人`

额外建议：
- `DetailPanel` 顶部标签区可同时显示 `dialectGroup / ethnicity / economy`
- `模式说明` 卡片可降级为简短说明，不应压过业务详情

验证：
- 运行：`npm run test -- src/shared/mappings/village-field-mapping.test.ts`
- 运行：`npm run build`

完成定义：
- 详情卡阅读顺序更贴近业务，而非 demo 说明

### Task 8：增强结果列表的信息密度和选中反馈

目标：让列表承担“快速判别 + 精确选中”的职责。

文件：
- 修改：`src/widgets/map/VillageList.tsx`
- 可选修改：`src/widgets/map/DetailPanel.tsx`

建议改动：
1. 列表项增加民族/经济标签（有值时展示）
2. 保留方言标签和时间不详标签
3. 空结果时展示明确空态提示
4. 可选：将 `selectedPrimaryId` 对应卡片滚动到可视区域

验证：
- 运行：`npm run build`
- 手工检查：组合筛选后列表信息密度足以支持人工挑选

完成定义：
- 列表不再只显示名字 + 城镇 + primaryId

### Task 9：升级专题页的数据组织方式

目标：让专题页从静态展示升级为“从真实字段抽取内容 + 回跳地图”的专题索引页。

文件：
- 修改：`src/pages/folkways/FolkwaysPage.tsx`
- 修改：`src/pages/toponymy/ToponymyPage.tsx`
- 新增：`src/pages/folkways/topic-extractors.ts`
- 新增：`src/pages/toponymy/topic-extractors.ts`
- 可选新增：`src/widgets/map/topic-helpers.ts`

folkways 页目标：
- 把 `村俗或传统民居或村特色产品` 进一步拆成“村俗 / 民居 / 产品”三类展示块
- 若 raw 文本无法精确结构化，先做轻量关键词切分 + 原文保留
- 增加 `村里名人` 关联入口，形成“专题内容 + 代表村庄 + 回地图”闭环

toponymy 页目标：
- 保留当前地名解释框架
- 但 featured list 改为更明确地显示 `村名来源 + 建村时间 + 所在地`
- 链接继续回到 `/map?mode=search&primaryId=...`

验证：
- 运行：`npm run build`
- 手工检查：专题卡片来自真实字段，不是纯文案占位

完成定义：
- 专题页和 map 详情形成同源内容闭环

### Task 10：补全回归测试与验收脚本

目标：把 P0 最核心风险点全部固化成测试。

文件：
- 修改：`src/pages/map/MapPage.test.tsx`
- 修改：`src/entities/village/lib/filterVillages.test.ts`
- 修改：`src/entities/village/model/adapter.test.ts`
- 修改：`src/entities/village/api/VillageRepository.test.ts`
- 可选修改：`src/app/App.test.tsx`

至少新增的测试场景：
1. URL 含 `ethnicity/economy` 时，筛选控件正确回显
2. 组合筛选改变后，`primaryId` 被清空
3. 组合筛选为空结果时，详情区出现正确空态
4. 清空筛选后，URL 中相关参数被移除
5. mock facets 含 `ethnicities/economies`
6. adapter 能派生 `ethnicity/economy`

最终验证命令：
- `npm run test`
- `npm run build`

如果 e2e 环境稳定，可补充：
- `npm run test:e2e`

完成定义：
- P0 的核心状态闭环有自动化保护

---

七、执行顺序建议

建议严格按以下顺序做，避免反复返工：

1. Task 1 mock facets + record 派生
2. Task 2 query/facets repository 契约
3. Task 3 filter 逻辑
4. Task 4 URL 参数与 MapPage
5. Task 5 MapWorkspace 拆分
6. Task 6 FilterPanel 业务筛选
7. Task 7 DetailPanel 分组重构
8. Task 8 VillageList 信息增强
9. Task 9 专题页升级
10. Task 10 回归测试收口

理由：
- 先把数据契约打通，再动 UI
- 先把 URL 单一事实来源打稳，再拆大组件
- 专题页最后做，避免前面字段映射未稳定时重复修改

---

八、关键风险与处理策略

1. 风险：民族/经济字段原始值脏，直接 facets 会产生很多碎片值
- 处理：P0 先按原值去重；若发现碎片明显，再进入 `normalizeFacetValue.ts` 轻量归一化，不在第一轮预先设计过度。

2. 风险：MapWorkspace 拆分时破坏现有测试选择器或 DOM 结构
- 处理：保留 `map-portrait-layout`、`map-drawer`、`map-landscape-sidebar` 等测试标识不变。

3. 风险：新筛选加入后 URL 更新逻辑复杂，容易残留旧参数
- 处理：把“构造 next search params”的规则收拢到单一函数，避免散落在多个组件里。

4. 风险：专题页为了结构化文本而过度引入复杂 NLP/规则
- 处理：P0 只做轻量关键词切分 + 原文保留，不做重型抽取引擎。

5. 风险：mock facets 结构升级后与 API 模式短期不一致
- 处理：类型允许空数组，但 contract 名称先统一；如果未来接 API，再补后端适配或空值兜底。

---

九、验收门槛

功能验收
- `/map` 可同时按 city/town/q/dialect/ethnicity/economy/year 进行有效组合筛选
- 带参数 URL 可刷新恢复筛选状态
- 选择村庄后详情可展示业务分组字段
- 筛选变化后不会保留无效 `primaryId`
- 专题页卡片来自真实字段并能回跳地图

技术验收
- `npm run test` 通过
- `npm run build` 通过
- 不引入新的全局状态管理依赖
- `MapWorkspace.tsx` 只保留布局装配职责

口径验收
- 所有地图点位相关描述仍明确属于 demo geometry
- 不对热力图、周边查询、真实邻近分析做任何完成承诺

---

十、实施后紧接的下一份计划

P0 完成后，下一份计划建议直接进入：
- `docs/plans/2026-04-24-p1-analytics-and-reporting-implementation-plan.md`

其输入前提：
- P0 的 query/facets/view-model 已稳定
- `VillageRecord` 已能稳定提供 ethnicity/economy 等聚合字段
- 专题内容和地图详情的字段组织已固定

---

十一、建议的首个实施切片

如果下一步直接开始写代码，建议先做这 3 个最稳的切片：

1. `scripts/build_mock_data.py` + `types.ts` + `adapter.ts`
2. `filterVillages.ts` + `filterVillages.test.ts`
3. `query-param-mapping.ts` + `MapPage.tsx` + `MapPage.test.tsx`

原因：
- 这是最小闭环
- 风险最可控
- 完成后能立刻验证民族/经济筛选是不是通了
