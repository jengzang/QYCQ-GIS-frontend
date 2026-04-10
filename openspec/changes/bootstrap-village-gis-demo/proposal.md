## Why

QYCQ 项目当前只有一份村庄 Excel 数据，缺少可直接用于汇报和后续研发的前端骨架。需要先搭出一套领导可理解、后续可继续开发的 GIS 演示前端，把地图叙事、数据口径、`primaryId` 关联方式和运行模式一次性确定下来。

## What Changes

- 初始化 React + TypeScript + Tailwind + MapLibre 前端工程。
- 建立 4 个主导航入口：`课题简介`、`村庄地图`、`特色民俗`、`村名地理`。
- 将 `村庄地图` 实现为一个页面内的三种模式：`村庄检索`、`源流迁徙`、`方言分布`。
- 新增 Python 数据脚本，把 `data/Village.xlsx` 转换为前端直接消费的 mock JSON。
- 为没有坐标的数据生成稳定的广东省内 WGS84 假点位，用于地图演示。
- 统一以前端 `primaryId` 作为村庄唯一关联键，覆盖列表、地图、详情、跳转和 URL 状态。
- 建立 mock / local api / remote api 三种运行模式，以及统一的前端 repository 契约。
- 将颜色、路由、查询参数、字段展示、时间映射、方言映射等规则集中到 mapping/config 层。

## Capabilities

### New Capabilities
- `app-shell-and-orientation-layout`: 定义四个主入口、蓝白主题和只按横屏/竖屏切换的整体布局。
- `village-map-modes-and-primaryid-flow`: 定义村庄地图三模式、`primaryId` 选中链路和 URL 驱动状态。
- `mock-data-pipeline`: 定义 Excel 到 mock JSON 的转换脚本、假坐标策略和前端 mock 产物。
- `mapping-and-runtime-config`: 定义运行模式、集中 mapping 规则和前端 repository 数据源切换。

### Modified Capabilities
- None.

## Impact

- 影响前端工程初始化、页面结构、运行脚本、测试配置和构建配置。
- 新增 Python 数据处理脚本与 `public/mock/*.json` 产物。
- 新增未来后端接口口径：`GET /api/v1/villages`、`GET /api/v1/villages/:primaryid`、`GET /api/v1/villages/facets`。
- 影响后续前后端联调方式，因为前端所有实体联动都会以 `primaryId` 为准。
