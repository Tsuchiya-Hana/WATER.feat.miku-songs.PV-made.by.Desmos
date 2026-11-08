# WATER feat. miku — Desmos MV（发布备份 / MIT）

## 歌曲信息
曲名：[WATER(feat.miku)](https://www.bilibili.com/video/BV1tJ411m7Az)
作曲：[A-39](https://space.bilibili.com/223114367)
编曲：A-39
混音：A-39
母带：A-39
作词：沙包P
调教：沙包P
演唱：初音未来

## 说明

这是 `WATER feat.miku` 的**完整工程副本**，用于发布。  
为了版权合规，副本中删除了音频、歌词、字幕、曲绘、MIDI/乐谱等素材，并把 `index.html` 与 `src/data.js` 中的歌词替换为无意义占位文本。**其余工程文件、源码、构建工具和开发工具均保留**。

```text
WATER feat.miku_public/
├─ index.html                 发布演示（已清理，单文件）
├─ dev.html                   开发入口（已清理）
├─ src/                       源码（已清理）
├─ tools/                     构建、解析、截图、修复等工具
├─ 理解性任务/                task1–task3（不含歌词原文）
├─ 提示词1.md                 原始任务说明
├─ 素材/                      仅保留 Desmos 函数库文本与说明 PDF
├─ preview_1.png              无文字的场景预览
├─ Desmos表达式栏.txt          198 条表达式的完整导出
├─ desmos_expressions.json    同一表达式数组的 JSON
├─ README.md                  本文件
└─ LICENSE                    MIT License
```

## 因版权删除的内容

- **音频**：`素材/WATER.mp3`
- **歌词**：`素材/所有歌词.txt`；原 `index.html`、`src/data.js` 中的日文歌词与中文翻译
- **字幕**：`素材/全部字幕.srt`；原字幕时间轴与字幕文本；`素材/手动配字幕.blend`、`.blend1`
- **曲绘**：`素材/曲绘.png`、`素材/曲绘.avif`
- **乐谱 / MIDI / 节拍**：`素材/WATER.mp3.mid`、`素材/间奏卡点.md`；`tools/midi_events.json`
- **制作表**：`理解性任务/歌曲PV制作表.md`（含歌词与逐镜时间）
- **含歌词的旧 HTML**：`WATER_MV片段_弃稿.html`、`敢这么做动态图片来糊弄的现在已经被我骂死了.html`
- **含歌词的预览图**：`preview_2.png`
- **派生数据**：`tools/shots.json`（含逐镜 `lyric` 字段）

## index.html 与源码中的替换

- `<audio>` 移除 `src`，不再加载或分发原曲；保留“选择本地音频”按钮。
- 45 条歌词/字幕改为占位文本：`ABCDEFG 1234 TEXT 甲乙丙丁 输入文本`；翻译清空。
- 原 SRT 字幕时间轴替换为与歌曲无关的合成时间轴（45 段，2.0s 起，约 6.5s 一段）。
- 257 个 MIDI 击点替换为合成脉冲列表（仍为 257 个，保持 `p` 公式长度不变）。
- 日文场景名改为 `SCENE A`…`SCENE M`；代码注释、片尾歌词和默认 HUD 文案同步改为通用文本。
- `ACCENT`、`TELEMETRY`、`BREATH` 等歌词判断改为通用占位规则。
- 保留 104 个镜头的结构时间与场景划分，用于演示运镜；这些是动画自身的编排时间，不含歌词、字幕、音频或乐谱内容。

## Desmos 与非 Desmos 的边界

**由 Desmos 负责**

- Desmos API v1.10 的 `Desmos.GraphingCalculator`。
- 198 条表达式：海面、太阳、气泡、粒子、漩涡、压力表、冲击环、光束、光迹、伸手线等。
- 相机 `c_x/c_y/c_z`、104 镜相机表、脉冲 `p`、32 路缓动 `f_l`、`t_c`、`m`。

**不由 Desmos 负责（发布版必须说明）**

1. **字幕/文本层**：`#lyrics` 是 **HTML/CSS DOM 覆盖层**，由 JavaScript 逐字做 `transform/opacity/filter` 动画。  
   它**不是** Desmos 点标签，也**不是**额外的 Canvas 贴图。Desmos 自己的 canvas 只绘制表达式图形；没有自定义 Canvas 文字层。
2. **HUD、深度/压力/O₂ 读数、章节卡、标题卡、片尾卡**：DOM + CSS。
3. **播放器、进度条、静音、本地音频选择、全屏、光敏安全面板**：DOM 表单与按钮。
4. **氛围与后期**：`atmosphere` 径向渐变、暗角、颗粒、扫描线、闪白/边缘色差、场景切换黑场，均为 DOM/CSS。
5. **音频与主时钟**：`HTMLAudioElement` + `requestAnimationFrame`；无音频时回退到内部时钟。
6. **场景切换擦除**：DOM 的 `#sceneWipe` 动画。

**为什么字幕不用 Desmos 点标签**：Desmos 点标签自带白色描边，CJK 字体与排版控制有限，逐字动画也很难做干净。当前方案是“Desmos 画图形 + DOM 叠字幕”的混合实现，并非纯 Desmos。

## 构建与运行

在 `WATER feat.miku_public` 目录运行：

```bash
python tools/build.py
```

会由 `dev.html` + `src/` 生成 `index.html`。  
重新导出表达式：

```bash
node tools/export_expressions.cjs
```

本地预览：

```bash
python -m http.server 8127
```

打开 `http://127.0.0.1:8127/index.html`。Desmos API 需要联网。

本备份**不含音频**：

- 点击开始后，无音频时按内部时钟演示。
- 点击控制条 **♪**，选择你拥有合法授权的本地音频。
- `?expr=1` 显示 Desmos 表达式栏。
- `?t=119&static=1&clean=1` 定格在 119 秒并隐藏 HUD/控制条。

## 工具说明

`tools/` 保留了开发过程中使用的工具，包括：

- `build.py`：把 `dev.html`、`src/*.js`、`src/style.css` 内联成单文件 `index.html`
- `export_expressions.cjs`：导出 `setExpressions()` 的 198 条表达式
- `gen_data.py`、`parse_midi.py`、`parse_shots.py`、`gen_cue_plan.py`：素材解析与数据生成（保留代码；原 SRT/MIDI/分镜数据已删除）
- `capture.cjs`、`contact*.py`：无头截图与 contact sheet
- `fix*.py`：开发过程中的语法/布局修复记录
- `sanitize_public_source.py`：本次发布清理脚本
- `make_public.py`：早期发布清理脚本

`tools/gen_data.py` 中的歌词/翻译映射已删除；指向原 SRT/MIDI/分镜数据的脚本仍保留，但发布副本中已没有这些输入文件。

## License

本工程中由本项目编写的**代码、构建脚本与文档**采用 **MIT License**，见 [LICENSE](LICENSE)。  
MIT 授权**不覆盖**：

- 歌曲名、角色名及其相关权利；
- Desmos API 及其服务；
- `素材/基本参数 rd260925.txt`、`素材/Desmos 自定义函数库使用说明 rd‑261001.pdf` 等第三方函数库/说明材料（如无另行授权，请保留其原始条款）；
- 任何原曲音源、歌词、字幕、曲绘、MIDI/乐谱（本备份已删除）。

发布或公开播放完整版前，请自行取得音频、歌词、曲绘等权利人的授权。
