## Context

当前系统已完成一套以 `primaryId` 为核心实体键、以 `/map` 为主舞台的领导演示型 GIS 前端。当前系统能够：

- 通过统一 repository 契约消费 mock / api 数据
- 在地图、列表、详情、跨页跳转之间保持 `primaryId` 一致联动
- 支持基础检索、时间轴筛选、方言分布着色
- 通过专题页承载 `特色民俗` 与 `村名地理`

但它仍有三个关键现实约束：

1. 村庄空间坐标是临时生成的广东省内稳定假点位，不是真实经纬度。
2. 当前系统更偏“展示与联动”，不是“统计、管理、空间服务”完整平台。
3. 新业务需求跨越查询、分析、后台、空间服务四个方向，若不拆阶段，容易导致架构失焦。

## Design Goals

- 在不推翻当前 demo 架构的前提下，平滑升级到更完整的业务查询能力。
- 用 capability 分层明确“先做什么、后做什么、哪些依赖真实坐标”。
- 保持 `primaryId`、repository、mapping、runtime 的稳定边界。
- 避免把后台数据管理能力直接塞进现有地图页。

## Decision 1: Keep temporary geometry explicit as a system mode, not an implicit assumption

后续能力设计必须显式承认两种空间数据状态：

- `temporary-geometry`：当前 mock 假点位模式
- `authoritative-geometry`：未来真实经纬度模式

这样做的原因：

- 当前地图交互、筛选和联动在假点位下完全可用。
- 但热力图、周边查询、距离分析、空间分布判断等需求在假点位下只能做“演示版”，不能声称业务完成。
- 把空间数据状态显式化，可以避免后续验收争议。

结论：
- 地图展示、列表联动、专题跳转：可在临时坐标下正式验收
- 热力图、周边查询、距离/邻近分析：只能在真实坐标下正式验收

## Decision 2: Split future work into four capability domains

### A. village-query-enhancement
面向查询补全与详情表达增强。

范围：
- 增加民族、经济情况等筛选维度
- 支持多条件组合查询
- 强化 facets、筛选状态与 URL 同步语义
- 强化详情字段分组与高亮表现

### B. analytics-and-reporting
面向统计分析与图表导出。

范围：
- 村庄数据聚合
- 图表页/报表页
- 统计结果导出
- 在地图上做非精确空间分析前，先以表格和普通图表为主

### C. village-data-management
面向后台运维，而非演示前台。

范围：
- 新增/编辑/删除
- 导入/导出
- 数据校验和去重
- 后台表单与管理列表

### D. special-topics-and-spatial-enhancements
面向专题页增强和真实空间分析。

范围：
- 村俗 / 村里名人 / 传统民居 / 特色产品专题组织
- 语言扩散时序演示升级
- 周边自然村查询
- 热力图、邻近关系等真实空间能力

## Decision 3: Deliver in three phases, not one combined rewrite

### P0 查询补全与专题增强
优先原因：
- 与现有 `/map` 和专题页最贴近
- 不依赖真实经纬度
- 能最快把 demo 升级为可用的业务查询系统

建议内容：
- 新增民族、经济情况筛选
- 统一 query contract 与 facets contract
- 地图结果集高亮、清空筛选、组合条件状态回显
- 专题页补充村里名人、特色产品等组织方式

### P1 统计分析与报表
优先原因：
- 当前数据字段已具备基础聚合条件
- 可在不依赖真实坐标的前提下先完成绝大多数统计图表需求

建议内容：
- 新增 `/analytics` 页面
- 生成人口、性别比、民族、语言、经济情况统计
- 导出筛选后统计结果
- 热力图列为“演示能力”或后移到真实坐标阶段

### P2 数据管理与空间服务
优先原因：
- 这是后台域，不宜混入当前前台地图主页面
- 很多需求（导入校验、去重、周边查询）都有明显独立边界

建议内容：
- 新增后台域或管理入口
- 管理接口契约
- 导入校验规则
- 真实坐标接入后的邻近查询与空间服务

## Implementation Shape

### Front-end shape for P0
- 继续沿用 `pages / widgets / entities / shared`
- 在 `entities/village/api/types.ts` 中扩展查询条件与 facets 结构
- 在 `widgets/map` 中拆分更细粒度组件，避免 `MapWorkspace.tsx` 继续膨胀
- 在 `shared/mappings/village-field-mapping.ts` 中补充面向查询与专题展示的字段映射

### Front-end shape for P1
- 新增 `pages/analytics/AnalyticsPage.tsx`
- 新增 `entities/village/lib/aggregateVillages.ts`
- 图表组件独立在 `widgets/analytics`
- 导出逻辑与地图展示分离

### Front-end / back-end boundary for P2
- 前台继续只负责展示与查询
- 后台独立承接 CRUD / import / validation
- 空间服务接口单独设计，不与当前 `GET /api/v1/villages` 列表语义混杂

## Risks / Trade-offs

- 如果继续把所有需求堆进 `/map`，当前超大组件会快速失控。
- 如果在假点位前提下直接承诺热力图和周边查询“完成”，后续验收会出现口径争议。
- 如果把数据管理混入前台，会破坏当前演示型信息架构。

## Open Questions

- `民族`、`经济情况` 当前原始数据是否已经足够干净到可以直接做 facets，还是需要轻量归一映射。
- `语言扩散时序展示` 是要做“时间筛选 + 方言变化回放”，还是要做真正的传播路径叙事。
- 未来管理后台是否需要权限模型，还是先以本地管理员模式启动。
