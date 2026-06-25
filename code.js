"use strict";
var _a;
const TOOL_ID = "3bf35518-52b6-48b3-9e95-8552862ea85a";
const DISPLAY_NAME = "Multi-series chart generator";
const ATTACH_KEY = TOOL_ID + ':state';
const AREA_FILL_OPACITY = 0.2;
const STROKE_WEIGHT = 2;
const SIGNAL_COLOR_KEYS = {
    chart1: '0881d4a95c692d016a5bf25ee50c9bc88a5dce97',
    chart2: '69bbc347524b62c1037561fe5892c9e194e67405',
    chart3: 'db1f03cf567433a6297eaa3c1fa697c550c118a0',
    chart4: '334f0393f710285c3e593dc8e52e39b2b2b451ae',
    chart5: '6820585fc37d9324b4dd744081bfcb312e3dd42d',
    primary: 'dc36229529b915bc76a15b396306530e63695bff',
    background: 'a14fefc47d98693a8bb369bdb118eab44b505377',
    chartBg: 'aaefba61c95131b9be7bf7ba33ba9f9c08be576e',
    card: 'b5fccbf7cb3b95d95ea13364235d1366af27e1e4',
    foreground: 'db385df6c8ad9f04c23214e595099a183efc9f97',
    mutedForeground: 'd0ac1646df4795656a37feed0103dbff6f4bfd05',
    border: 'e1ed1d5a91baabc5b136148e371562f1479ec0fa',
};
const SIGNAL_FLOAT_KEYS = {
    radiusSm: 'fed6645b94717cfda76fb48ede6902ff8ebcca96',
    radiusMd: '65d9dddf8ca6d5dc579b1b1d7368089ad2b91055',
    radiusLg: '5661427e0156c0b3f059aa8fdaf3a2b0a7ba750a',
    spacing3: '3a3b960a909da44ccb1da9c6a8181c422a896ae7',
    spacing4: '9be25c821befe2dbd221c9508695d828932235c6',
    spacing5: '98fea6a50a2ca8fc36e6a25c5c66874f0b3890fb',
    spacing8: '50f568ce1c29d58779ea2e149f24269fe954c357',
    spacing12: 'eb8373a6fbb15cee2b95470c5aa6d7cf54868ee0',
    spacing14: 'ed155ec9d56dd27431f7147cde18f9e336d6b2fc',
    spacing20: 'acd7fabe43039d25904b869182f83fd7e8fe09a4',
    spacing24: '077bd4d15d379b7f66d898ab02d688954f777d3e',
    spacing32: 'f08467b4c8233bb460848fd7bcc801113d1fef21',
    borderRadius2: '103c6836cab2a1a600e303c27f2a0e704df129a5',
    borderRadius12: '22b7e82c86e14a6e2ec4617786108138f6683cdd',
    strokeWeight1: 'f947a0985937976ab89a46468695deed2b935d90',
};
const SIGNAL_TEXT_KEYS = {
    labelXs: '4f7637a239083b0e5afb6e7452db3e68446c9b3c',
    labelSm: 'e70bc0c9ac573cace62b7f3d9495b65329804912',
    titleLg: 'd3367956d0d9834ab077b29316c768a116e9a513',
};
const DEFAULT_COLORS = [
    { r: 0.918, g: 0.345, b: 0.047, a: 1 },
    { r: 0.051, g: 0.580, b: 0.533, a: 1 },
    { r: 0.086, g: 0.306, b: 0.388, a: 1 },
    { r: 0.984, g: 0.749, b: 0.141, a: 1 },
    { r: 0.24, g: 0.74, b: 0.95, a: 1 },
    { r: 0.7, g: 0.47, b: 1, a: 1 },
];
const DEFAULTS = {
    chartType: 'bar',
    chartWidth: 600,
    chartHeight: 500,
    seriesCount: 3,
    pointCount: 5,
    showLegend: true,
    showGrid: true,
    stackedMode: true,
    showChartTitle: true,
    chartTitle: 'Chart title',
    showXAxisTitle: false,
    xAxisTitle: 'X axis',
    showYAxisTitle: true,
    yAxisTitle: 'Y-Axis',
};
let latestParams = DEFAULTS;
let isExecuting = false;
function finiteNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function normalizeParams(input) {
    const value = input !== null && input !== void 0 ? input : {};
    const validTypes = ['area', 'bar', 'pie'];
    return {
        chartType: validTypes.includes(value.chartType) ? value.chartType : DEFAULTS.chartType,
        chartWidth: clamp(finiteNumber(value.chartWidth, DEFAULTS.chartWidth), 200, 1600),
        chartHeight: clamp(finiteNumber(value.chartHeight, DEFAULTS.chartHeight), 100, 1200),
        seriesCount: clamp(finiteNumber(value.seriesCount, DEFAULTS.seriesCount), 1, 6),
        pointCount: clamp(finiteNumber(value.pointCount, DEFAULTS.pointCount), 3, 20),
        showLegend: typeof value.showLegend === 'boolean' ? value.showLegend : DEFAULTS.showLegend,
        showGrid: typeof value.showGrid === 'boolean' ? value.showGrid : DEFAULTS.showGrid,
        stackedMode: typeof value.stackedMode === 'boolean' ? value.stackedMode : DEFAULTS.stackedMode,
        showChartTitle: typeof value.showChartTitle === 'boolean' ? value.showChartTitle : DEFAULTS.showChartTitle,
        chartTitle: typeof value.chartTitle === 'string' ? value.chartTitle.slice(0, 120) : DEFAULTS.chartTitle,
        showXAxisTitle: typeof value.showXAxisTitle === 'boolean' ? value.showXAxisTitle : DEFAULTS.showXAxisTitle,
        xAxisTitle: typeof value.xAxisTitle === 'string' ? value.xAxisTitle.slice(0, 120) : DEFAULTS.xAxisTitle,
        showYAxisTitle: typeof value.showYAxisTitle === 'boolean' ? value.showYAxisTitle : DEFAULTS.showYAxisTitle,
        yAxisTitle: typeof value.yAxisTitle === 'string' ? value.yAxisTitle.slice(0, 120) : DEFAULTS.yAxisTitle,
    };
}
function placeNodeCentered(node, point) {
    const positioned = node;
    positioned.x = point.x - positioned.width / 2;
    positioned.y = point.y - positioned.height / 2;
}
function htmlEscapeAttribute(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function setBooleanControl(html, id, value) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const checked = new RegExp('(<fig-switch[^>]*id="' + escaped + '"[^>]*)\\schecked(=[^\\s>]*)?', 'g');
    let next = html.replace(checked, '$1');
    if (value) {
        const target = new RegExp('(<fig-switch[^>]*id="' + escaped + '"[^>]*)(>)', 'g');
        next = next.replace(target, '$1 checked$2');
    }
    return next;
}
function solidPaintBound(color, variable, opacity = 1) {
    let paint = { type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity };
    if (variable) {
        paint = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
        if (opacity !== 1)
            paint = Object.assign(Object.assign({}, paint), { opacity });
    }
    return paint;
}
async function applyTextFill(node, variable, fallback) {
    let paint = { type: 'SOLID', color: fallback };
    if (variable)
        paint = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
    node.fills = [paint];
}
async function applyTextStyle(node, styleId, fallbackFont, fallbackSize, colorVar, colorFallback) {
    if (styleId) {
        try {
            const style = await figma.getStyleByIdAsync(styleId);
            if (style === null || style === void 0 ? void 0 : style.fontName)
                await figma.loadFontAsync(style.fontName);
            await node.setTextStyleIdAsync(styleId);
        }
        catch (_a) {
            node.fontName = fallbackFont;
            node.fontSize = fallbackSize;
        }
    }
    else {
        node.fontName = fallbackFont;
        node.fontSize = fallbackSize;
    }
    await applyTextFill(node, colorVar, colorFallback);
}
function niceGridLines(dataMax) {
    if (dataMax <= 0)
        return { max: 100, step: 10, count: 10 };
    const targetLines = 9;
    const rawStep = dataMax / targetLines;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const niceSteps = [1, 2, 2.5, 5, 10];
    let step = magnitude * niceSteps[niceSteps.length - 1];
    for (const ns of niceSteps) {
        const candidate = magnitude * ns;
        if (candidate >= rawStep) {
            step = candidate;
            break;
        }
    }
    const max = Math.ceil(dataMax / step) * step;
    const count = Math.round(max / step);
    return { max, step, count };
}
async function importSignalVars() {
    const results = {};
    const allKeys = Object.assign(Object.assign({}, SIGNAL_COLOR_KEYS), SIGNAL_FLOAT_KEYS);
    await Promise.all(Object.entries(allKeys).map(async ([key, varKey]) => {
        try {
            results[key] = await figma.variables.importVariableByKeyAsync(varKey);
        }
        catch (_a) {
            results[key] = null;
        }
    }));
    return results;
}
async function importSignalTextStyles() {
    const result = {};
    await Promise.all(Object.entries(SIGNAL_TEXT_KEYS).map(async ([key, styleKey]) => {
        try {
            const style = await figma.importStyleByKeyAsync(styleKey);
            result[key] = style.id;
        }
        catch (_a) {
            result[key] = null;
        }
    }));
    return result;
}
function seededRandom(seed) {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return ((s >>> 0) / 0xffffffff); };
}
function generateSeriesData(seriesIndex, pointCount) {
    const rng = seededRandom(seriesIndex * 997 + 42);
    const data = [];
    let val = 300 + rng() * 400;
    for (let i = 0; i < pointCount; i++) {
        val += (rng() - 0.45) * 250;
        val = Math.max(50, Math.min(950, val));
        data.push(Math.round(val));
    }
    return data;
}
function tryBind(node, field, variable) {
    if (!variable)
        return;
    try {
        node.setBoundVariable(field, variable);
    }
    catch (_a) { }
}
function catmullRomPath(points) {
    if (points.length < 2)
        return '';
    const alpha = 0.5;
    function getT(t, p0, p1) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        return Math.pow(Math.sqrt(dx * dx + dy * dy), alpha) + t;
    }
    const n = points.length;
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 0; i < n - 1; i++) {
        const p0 = i === 0 ? points[0] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i + 2 < n ? points[i + 2] : points[n - 1];
        const t0 = 0;
        const t1 = getT(t0, p0, p1);
        const t2 = getT(t1, p1, p2);
        const t3 = getT(t2, p2, p3);
        const tDiff = t2 - t1;
        const m1x = tDiff === 0 ? 0 : (p2.x - p0.x) * (t1 - t0) / (t2 - t0);
        const m1y = tDiff === 0 ? 0 : (p2.y - p0.y) * (t1 - t0) / (t2 - t0);
        const m2x = tDiff === 0 ? 0 : (p3.x - p1.x) * (t2 - t1) / (t3 - t1);
        const m2y = tDiff === 0 ? 0 : (p3.y - p1.y) * (t2 - t1) / (t3 - t1);
        const cp1x = p1.x + m1x / 3;
        const cp1y = p1.y + m1y / 3;
        const cp2x = p2.x - m2x / 3;
        const cp2y = p2.y - m2y / 3;
        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
}
function arcToCubic(cx, cy, r, startAngle, endAngle) {
    const totalSweep = endAngle - startAngle;
    const numSegments = Math.max(1, Math.ceil(Math.abs(totalSweep) / (Math.PI / 2)));
    const parts = [];
    for (let i = 0; i < numSegments; i++) {
        const a1 = startAngle + (i / numSegments) * totalSweep;
        const a2 = startAngle + ((i + 1) / numSegments) * totalSweep;
        const sweep = a2 - a1;
        const k = (4 / 3) * Math.tan(sweep / 4);
        const cos1 = Math.cos(a1), sin1 = Math.sin(a1), cos2 = Math.cos(a2), sin2 = Math.sin(a2);
        parts.push(`C ${(cx + r * (cos1 - k * sin1)).toFixed(2)} ${(cy + r * (sin1 + k * cos1)).toFixed(2)} ${(cx + r * (cos2 + k * sin2)).toFixed(2)} ${(cy + r * (sin2 - k * cos2)).toFixed(2)} ${(cx + r * cos2).toFixed(2)} ${(cy + r * sin2).toFixed(2)}`);
    }
    return parts.join(' ');
}
function pieSlicePath(cx, cy, r, startAngle, endAngle) {
    const startX = cx + r * Math.cos(startAngle);
    const startY = cy + r * Math.sin(startAngle);
    return `M ${cx.toFixed(2)} ${cy.toFixed(2)} L ${startX.toFixed(2)} ${startY.toFixed(2)} ${arcToCubic(cx, cy, r, startAngle, endAngle)} Z`;
}
async function renderBarChart(plotFrame, plotW, plotH, p, allSeries, seriesNames, categoryNames, seriesCount, pointCount, sv, chartVars, fallbackColors, ts, fontRegular, fontSemibold, affectedNodes) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    let rawMax = 0;
    for (let i = 0; i < pointCount; i++) {
        if (p.stackedMode) {
            let col = 0;
            for (let s = 0; s < seriesCount; s++) col += allSeries[s][i];
            if (col > rawMax) rawMax = col;
        } else {
            for (let s = 0; s < seriesCount; s++) if (allSeries[s][i] > rawMax) rawMax = allSeries[s][i];
        }
    }
    const { max: globalMax, count: GRID_COUNT } = niceGridLines(rawMax || 100);
    const mutedFgVar = (_a = sv.mutedForeground) !== null && _a !== void 0 ? _a : null;
    const mutedFallback = { r: 0.451, g: 0.451, b: 0.451 };
    const fgVar = (_b = sv.foreground) !== null && _b !== void 0 ? _b : null;
    const fgFallback = { r: 0.039, g: 0.039, b: 0.039 };
    const borderVar = (_c = sv.border) !== null && _c !== void 0 ? _c : null;
    const SECTION_PAD = 32;
    const YAXIS_PAD_BOTTOM = 68;
    const BAR_COL_PAD_BOTTOM = 6;
    const BAR_CONTAINER_GAP = 8;
    const BAR_WRAPPER_PAD_LEFT = 80;
    plotFrame.layoutMode = 'VERTICAL';
    plotFrame.primaryAxisSizingMode = 'FIXED';
    plotFrame.counterAxisSizingMode = 'FIXED';
    plotFrame.primaryAxisAlignItems = 'MIN';
    plotFrame.counterAxisAlignItems = 'MIN';
    plotFrame.itemSpacing = SECTION_PAD;
    plotFrame.paddingTop = SECTION_PAD;
    plotFrame.paddingBottom = SECTION_PAD;
    plotFrame.paddingLeft = SECTION_PAD;
    plotFrame.paddingRight = SECTION_PAD;
    plotFrame.resize(plotW, plotH);
    plotFrame.layoutSizingVertical = 'FILL';
    tryBind(plotFrame, 'itemSpacing', (_d = sv.spacing24) !== null && _d !== void 0 ? _d : null);
    tryBind(plotFrame, 'paddingLeft', (_e = sv.spacing32) !== null && _e !== void 0 ? _e : null);
    tryBind(plotFrame, 'paddingTop', (_f = sv.spacing32) !== null && _f !== void 0 ? _f : null);
    tryBind(plotFrame, 'paddingRight', (_g = sv.spacing32) !== null && _g !== void 0 ? _g : null);
    tryBind(plotFrame, 'paddingBottom', (_h = sv.spacing32) !== null && _h !== void 0 ? _h : null);
    const maxBarH = Math.max(10, plotH - SECTION_PAD - YAXIS_PAD_BOTTOM);
    const yAxisOuter = figma.createFrame();
    yAxisOuter.name = 'Y-Axis';
    yAxisOuter.layoutMode = 'HORIZONTAL';
    yAxisOuter.primaryAxisAlignItems = 'MIN';
    yAxisOuter.counterAxisAlignItems = 'MIN';
    yAxisOuter.primaryAxisSizingMode = 'FIXED';
    yAxisOuter.counterAxisSizingMode = 'FIXED';
    yAxisOuter.paddingTop = SECTION_PAD;
    yAxisOuter.paddingBottom = YAXIS_PAD_BOTTOM;
    yAxisOuter.paddingLeft = SECTION_PAD;
    yAxisOuter.paddingRight = SECTION_PAD;
    yAxisOuter.itemSpacing = 0;
    yAxisOuter.fills = [];
    yAxisOuter.resize(plotW, plotH);
    plotFrame.appendChild(yAxisOuter);
    yAxisOuter.layoutPositioning = 'ABSOLUTE';
    yAxisOuter.x = 0;
    yAxisOuter.y = 0;
    if ('constraints' in yAxisOuter) yAxisOuter.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    tryBind(yAxisOuter, 'paddingLeft', (_j = sv.spacing32) !== null && _j !== void 0 ? _j : null);
    tryBind(yAxisOuter, 'paddingTop', (_k = sv.spacing32) !== null && _k !== void 0 ? _k : null);
    tryBind(yAxisOuter, 'paddingRight', (_l = sv.spacing32) !== null && _l !== void 0 ? _l : null);
    const yAxisTitleCol = figma.createFrame();
    yAxisTitleCol.name = 'Y-axis';
    yAxisTitleCol.layoutMode = 'VERTICAL';
    yAxisTitleCol.primaryAxisAlignItems = 'CENTER';
    yAxisTitleCol.counterAxisAlignItems = 'CENTER';
    yAxisTitleCol.primaryAxisSizingMode = 'FIXED';
    yAxisTitleCol.counterAxisSizingMode = 'AUTO';
    yAxisTitleCol.fills = [];
    yAxisTitleCol.resize(14, 100);
    yAxisOuter.appendChild(yAxisTitleCol);
    yAxisTitleCol.layoutSizingHorizontal = 'HUG';
    yAxisTitleCol.layoutSizingVertical = 'FILL';
    if (p.showYAxisTitle) {
        const yTitleText = figma.createText();
        await applyTextStyle(yTitleText, ts.labelXs, fontRegular, 12, mutedFgVar, mutedFallback);
        yTitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
        yTitleText.characters = p.yAxisTitle || 'Y-Axis';
        yAxisTitleCol.appendChild(yTitleText);
        yTitleText.rotation = 90;
        affectedNodes.push(yTitleText);
    }
    affectedNodes.push(yAxisTitleCol);
    const labelsFrame = figma.createFrame();
    labelsFrame.name = 'Labels';
    labelsFrame.layoutMode = 'VERTICAL';
    labelsFrame.primaryAxisAlignItems = 'SPACE_BETWEEN';
    labelsFrame.counterAxisAlignItems = 'MIN';
    labelsFrame.primaryAxisSizingMode = 'FIXED';
    labelsFrame.counterAxisSizingMode = 'AUTO';
    labelsFrame.paddingLeft = 8;
    labelsFrame.paddingRight = 8;
    labelsFrame.itemSpacing = 16;
    labelsFrame.fills = [];
    yAxisOuter.appendChild(labelsFrame);
    labelsFrame.layoutSizingHorizontal = 'HUG';
    labelsFrame.layoutSizingVertical = 'FILL';
    tryBind(labelsFrame, 'paddingLeft', (_m = sv.spacing8) !== null && _m !== void 0 ? _m : null);
    tryBind(labelsFrame, 'paddingRight', (_o = sv.spacing8) !== null && _o !== void 0 ? _o : null);
    for (let g = GRID_COUNT; g >= 0; g--) {
        const yVal = Math.round((g / GRID_COUNT) * globalMax);
        const yLabel = figma.createText();
        yLabel.name = `Y Label ${g}`;
        await applyTextStyle(yLabel, ts.labelXs, fontRegular, 12, mutedFgVar, mutedFallback);
        yLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
        yLabel.textAlignHorizontal = 'LEFT';
        yLabel.characters = yVal.toLocaleString();
        labelsFrame.appendChild(yLabel);
        yLabel.layoutSizingHorizontal = 'FILL';
        yLabel.layoutSizingVertical = 'HUG';
        affectedNodes.push(yLabel);
    }
    affectedNodes.push(labelsFrame);
    const gridsFrame = figma.createFrame();
    gridsFrame.name = 'Grids';
    gridsFrame.layoutMode = 'VERTICAL';
    gridsFrame.primaryAxisAlignItems = 'SPACE_BETWEEN';
    gridsFrame.counterAxisAlignItems = 'MIN';
    gridsFrame.primaryAxisSizingMode = 'FIXED';
    gridsFrame.counterAxisSizingMode = 'FIXED';
    gridsFrame.fills = [];
    yAxisOuter.appendChild(gridsFrame);
    gridsFrame.layoutSizingHorizontal = 'FILL';
    gridsFrame.layoutSizingVertical = 'FILL';
    for (let g = GRID_COUNT; g >= 0; g--) {
        const gridWrapper = figma.createFrame();
        gridWrapper.name = 'Gridline';
        gridWrapper.layoutMode = 'HORIZONTAL';
        gridWrapper.primaryAxisAlignItems = g === GRID_COUNT ? 'CENTER' : 'MIN';
        gridWrapper.counterAxisAlignItems = 'CENTER';
        gridWrapper.primaryAxisSizingMode = 'FIXED';
        gridWrapper.counterAxisSizingMode = 'FIXED';
        gridWrapper.itemSpacing = 12;
        gridWrapper.fills = [];
        gridWrapper.resize(100, 14);
        gridsFrame.appendChild(gridWrapper);
        gridWrapper.layoutSizingHorizontal = 'FILL';
        gridWrapper.layoutSizingVertical = 'FIXED';
        tryBind(gridWrapper, 'itemSpacing', (_p = sv.spacing12) !== null && _p !== void 0 ? _p : null);
        if (p.showGrid) {
            const gridline = figma.createRectangle();
            gridline.name = 'Gridline';
            gridline.resize(100, 1);
            gridline.fills = [solidPaintBound({ r: 0.898, g: 0.898, b: 0.898, a: 1 }, borderVar)];
            gridWrapper.appendChild(gridline);
            gridline.layoutSizingHorizontal = 'FILL';
            gridline.layoutSizingVertical = 'FIXED';
            affectedNodes.push(gridline);
        }
        affectedNodes.push(gridWrapper);
    }
    affectedNodes.push(gridsFrame, yAxisOuter);
    const barWrapper = figma.createFrame();
    barWrapper.name = 'Bar Wrapper';
    barWrapper.layoutMode = 'VERTICAL';
    barWrapper.primaryAxisAlignItems = 'MIN';
    barWrapper.counterAxisAlignItems = 'MIN';
    barWrapper.primaryAxisSizingMode = 'FIXED';
    barWrapper.counterAxisSizingMode = 'FIXED';
    barWrapper.paddingLeft = BAR_WRAPPER_PAD_LEFT;
    barWrapper.itemSpacing = 0;
    barWrapper.fills = [];
    plotFrame.appendChild(barWrapper);
    barWrapper.layoutSizingHorizontal = 'FILL';
    barWrapper.layoutSizingVertical = 'FILL';
    const barColumns = figma.createFrame();
    barColumns.name = 'Bar Columns';
    barColumns.layoutMode = 'HORIZONTAL';
    barColumns.primaryAxisAlignItems = 'MIN';
    barColumns.counterAxisAlignItems = 'MAX';
    barColumns.primaryAxisSizingMode = 'FIXED';
    barColumns.counterAxisSizingMode = 'FIXED';
    barColumns.itemSpacing = 8;
    barColumns.fills = [];
    barWrapper.appendChild(barColumns);
    barColumns.layoutSizingHorizontal = 'FILL';
    barColumns.layoutSizingVertical = 'FILL';
    tryBind(barColumns, 'itemSpacing', (_q = sv.spacing8) !== null && _q !== void 0 ? _q : null);
    for (let i = 0; i < pointCount; i++) {
        const barCol = figma.createFrame();
        barCol.name = 'Bar Col';
        barCol.layoutMode = 'VERTICAL';
        barCol.primaryAxisAlignItems = 'MAX';
        barCol.counterAxisAlignItems = 'CENTER';
        barCol.primaryAxisSizingMode = 'FIXED';
        barCol.counterAxisSizingMode = 'FIXED';
        barCol.paddingBottom = BAR_COL_PAD_BOTTOM;
        barCol.itemSpacing = 0;
        barCol.fills = [];
        barColumns.appendChild(barCol);
        barCol.layoutSizingHorizontal = 'FILL';
        barCol.layoutSizingVertical = 'FILL';
        const barContainer = figma.createFrame();
        barContainer.name = 'Bar Container';
        barContainer.layoutMode = 'VERTICAL';
        barContainer.primaryAxisAlignItems = 'MAX';
        barContainer.counterAxisAlignItems = 'CENTER';
        barContainer.primaryAxisSizingMode = 'AUTO';
        barContainer.counterAxisSizingMode = 'FIXED';
        barContainer.itemSpacing = BAR_CONTAINER_GAP;
        barContainer.fills = [];
        barCol.appendChild(barContainer);
        barContainer.layoutSizingHorizontal = 'FILL';
        barContainer.layoutSizingVertical = 'HUG';
        tryBind(barContainer, 'itemSpacing', (_r = sv.spacing8) !== null && _r !== void 0 ? _r : null);
        const stack = figma.createFrame();
        stack.name = 'Stack';
        if (p.stackedMode) {
            stack.layoutMode = 'VERTICAL';
            stack.primaryAxisAlignItems = 'MAX';
            stack.counterAxisAlignItems = 'MIN';
            stack.itemSpacing = 0;
        } else {
            stack.layoutMode = 'HORIZONTAL';
            stack.primaryAxisAlignItems = 'MIN';
            stack.counterAxisAlignItems = 'MAX';
            stack.itemSpacing = 2;
        }
        stack.cornerRadius = 2;
        stack.clipsContent = true;
        stack.fills = [];
        stack.primaryAxisSizingMode = 'AUTO';
        stack.counterAxisSizingMode = 'FIXED';
        barContainer.appendChild(stack);
        stack.layoutSizingHorizontal = 'FILL';
        stack.layoutSizingVertical = 'HUG';
        tryBind(stack, 'topLeftRadius', (_s = sv.borderRadius2) !== null && _s !== void 0 ? _s : null);
        tryBind(stack, 'topRightRadius', (_t = sv.borderRadius2) !== null && _t !== void 0 ? _t : null);
        tryBind(stack, 'bottomLeftRadius', (_u = sv.borderRadius2) !== null && _u !== void 0 ? _u : null);
        tryBind(stack, 'bottomRightRadius', (_v = sv.borderRadius2) !== null && _v !== void 0 ? _v : null);
        if (p.stackedMode) {
            for (let s = seriesCount - 1; s >= 0; s--) {
                const value = allSeries[s][i];
                const color = fallbackColors[s];
                const chartVar = (_w = chartVars[s]) !== null && _w !== void 0 ? _w : null;
                const barH = Math.max(1, Math.round((value / globalMax) * maxBarH));
                const bar = figma.createFrame();
                bar.name = 'Bar';
                bar.layoutMode = 'HORIZONTAL';
                bar.primaryAxisAlignItems = 'MIN';
                bar.counterAxisAlignItems = 'CENTER';
                bar.itemSpacing = 10;
                bar.fills = [solidPaintBound(color, chartVar)];
                bar.strokes = [];
                bar.resize(10, barH);
                stack.appendChild(bar);
                bar.layoutSizingHorizontal = 'FILL';
                bar.layoutSizingVertical = 'FIXED';
                affectedNodes.push(bar);
            }
        } else {
            for (let s = 0; s < seriesCount; s++) {
                const value = allSeries[s][i];
                const color = fallbackColors[s];
                const chartVar = (_x = chartVars[s]) !== null && _x !== void 0 ? _x : null;
                const barH = Math.max(1, Math.round((value / globalMax) * maxBarH));
                const bar = figma.createFrame();
                bar.name = 'Bar';
                bar.layoutMode = 'HORIZONTAL';
                bar.primaryAxisAlignItems = 'MIN';
                bar.counterAxisAlignItems = 'CENTER';
                bar.itemSpacing = 0;
                bar.fills = [solidPaintBound(color, chartVar)];
                bar.strokes = [];
                bar.resize(10, barH);
                stack.appendChild(bar);
                bar.layoutSizingHorizontal = 'FILL';
                bar.layoutSizingVertical = 'FIXED';
                affectedNodes.push(bar);
            }
        }
        affectedNodes.push(stack);
        const valueLabel = figma.createText();
        valueLabel.name = 'Value Label';
        await applyTextStyle(valueLabel, ts.labelSm, fontRegular, 14, fgVar, fgFallback);
        valueLabel.textAlignHorizontal = 'CENTER';
        valueLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
        valueLabel.characters = categoryNames[i] || `Y${i + 1}`;
        valueLabel.textTruncation = 'ENDING';
        valueLabel.maxLines = 1;
        barContainer.appendChild(valueLabel);
        valueLabel.layoutSizingHorizontal = 'FILL';
        valueLabel.layoutSizingVertical = 'HUG';
        affectedNodes.push(valueLabel, barContainer, barCol);
    }
    affectedNodes.push(barColumns);
    const xLabel = figma.createText();
    xLabel.name = 'X-Label';
    await applyTextStyle(xLabel, ts.labelXs, fontRegular, 12, mutedFgVar, mutedFallback);
    xLabel.textAlignHorizontal = 'CENTER';
    xLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
    xLabel.characters = p.showXAxisTitle ? (p.xAxisTitle || 'X-Axis') : '';
    barWrapper.appendChild(xLabel);
    xLabel.layoutSizingHorizontal = 'FILL';
    xLabel.layoutSizingVertical = 'HUG';
    affectedNodes.push(xLabel, barWrapper);
}
async function renderAreaChart(plotFrame, plotW, plotH, p, allSeries, seriesNames, seriesCount, pointCount, sv, chartVars, fallbackColors, ts, fontRegular, affectedNodes) {
    var _a, _b, _c, _d, _e;
    const yTitleExtra = p.showYAxisTitle ? 16 : 0;
    const pad = { top: 8, right: 16, bottom: 24, left: 48 + yTitleExtra };
    const usableW = plotW - pad.left - pad.right;
    const usableH = plotH - pad.top - pad.bottom;
    const mutedFgVar = (_a = sv.mutedForeground) !== null && _a !== void 0 ? _a : null;
    const mutedFallback = { r: 0.451, g: 0.451, b: 0.451 };
    const stackedSeries = [];
    if (p.stackedMode) {
        const running = new Array(pointCount).fill(0);
        for (let s = 0; s < seriesCount; s++) {
            const row = [];
            for (let i = 0; i < pointCount; i++) { running[i] += allSeries[s][i]; row.push(running[i]); }
            stackedSeries.push(row);
        }
    }
    const dataToScale = p.stackedMode ? stackedSeries : allSeries;
    let globalMin = Infinity, globalMax = -Infinity;
    for (const series of dataToScale) for (const v of series) { if (v < globalMin) globalMin = v; if (v > globalMax) globalMax = v; }
    globalMin = Math.floor(globalMin / 10) * 10;
    globalMax = Math.ceil(globalMax / 10) * 10;
    const range = globalMax - globalMin || 1;
    const toY = (val) => pad.top + usableH - ((val - globalMin) / range) * usableH;
    const toX = (i) => pad.left + (i / Math.max(1, pointCount - 1)) * usableW;
    if (p.showGrid) {
        for (let g = 0; g <= 4; g++) {
            const y = toY(globalMin + (g / 4) * range);
            const line = figma.createLine();
            line.name = `Grid ${g}`; line.x = pad.left; line.y = Math.round(y); line.resize(usableW, 0);
            line.strokes = [solidPaintBound({ r: 0.898, g: 0.898, b: 0.898, a: 1 }, (_b = sv.border) !== null && _b !== void 0 ? _b : null)];
            line.strokeWeight = 1;
            plotFrame.appendChild(line); affectedNodes.push(line);
        }
    }
    const bgVar = (_d = (_c = sv.chartBg) !== null && _c !== void 0 ? _c : sv.card) !== null && _d !== void 0 ? _d : null;
    for (let s = seriesCount - 1; s >= 0; s--) {
        const topData = p.stackedMode ? stackedSeries[s] : allSeries[s];
        const bottomData = p.stackedMode && s > 0 ? stackedSeries[s - 1] : null;
        const color = fallbackColors[s];
        const chartVar = (_e = chartVars[s]) !== null && _e !== void 0 ? _e : null;
        const topPoints = topData.map((v, i) => ({ x: toX(i), y: toY(v) }));
        const bottomPoints = bottomData ? bottomData.map((v, i) => ({ x: toX(i), y: toY(v) })) : [];
        let fillPath = catmullRomPath(topPoints);
        if (bottomData && bottomPoints.length > 0) {
            const rev = [...bottomPoints].reverse();
            fillPath += ` L ${topPoints[pointCount - 1].x.toFixed(2)} ${bottomPoints[pointCount - 1].y.toFixed(2)}`;
            for (let i = 1; i < rev.length; i++) fillPath += ` L ${rev[i].x.toFixed(2)} ${rev[i].y.toFixed(2)}`;
            fillPath += ' Z';
        } else {
            fillPath += ` L ${toX(pointCount - 1).toFixed(2)} ${(pad.top + usableH).toFixed(2)} L ${pad.left.toFixed(2)} ${(pad.top + usableH).toFixed(2)} Z`;
        }
        const fillVec = figma.createVector();
        fillVec.name = `${seriesNames[s]} fill`; fillVec.vectorPaths = [{ windingRule: 'NONZERO', data: fillPath }];
        fillVec.fills = [solidPaintBound(color, chartVar, AREA_FILL_OPACITY)]; fillVec.strokes = [];
        plotFrame.appendChild(fillVec); affectedNodes.push(fillVec);
        const strokeVec = figma.createVector();
        strokeVec.name = `${seriesNames[s]} line`; strokeVec.vectorPaths = [{ windingRule: 'NONZERO', data: catmullRomPath(topPoints) }];
        strokeVec.fills = []; strokeVec.strokes = [solidPaintBound(color, chartVar)];
        strokeVec.strokeWeight = STROKE_WEIGHT; strokeVec.strokeCap = 'ROUND'; strokeVec.strokeJoin = 'ROUND';
        plotFrame.appendChild(strokeVec); affectedNodes.push(strokeVec);
        for (let i = 0; i < pointCount; i++) {
            const dot = figma.createEllipse(); const dotR = STROKE_WEIGHT + 1.5;
            dot.name = `${seriesNames[s]} dot ${i}`; dot.resize(dotR * 2, dotR * 2);
            dot.x = topPoints[i].x - dotR; dot.y = topPoints[i].y - dotR;
            dot.fills = [solidPaintBound(color, chartVar)];
            dot.strokes = bgVar ? [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', bgVar)] : [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            dot.strokeWeight = 2; plotFrame.appendChild(dot); affectedNodes.push(dot);
        }
    }
    for (let g = 0; g <= 4; g++) {
        const yVal = globalMin + (g / 4) * range;
        const t = figma.createText(); t.name = `Y label ${g}`; t.fontName = fontRegular; t.fontSize = 10;
        await applyTextFill(t, mutedFgVar, mutedFallback); t.textAutoResize = 'WIDTH_AND_HEIGHT'; t.characters = Math.round(yVal).toString();
        plotFrame.appendChild(t); t.x = 4; t.y = toY(yVal) - t.height / 2; affectedNodes.push(t);
    }
    const xLabelStep = Math.max(1, Math.floor(pointCount / 8));
    for (let i = 0; i < pointCount; i += xLabelStep) {
        const t = figma.createText(); t.name = `X label ${i}`; t.fontName = fontRegular; t.fontSize = 10;
        await applyTextFill(t, mutedFgVar, mutedFallback); t.textAutoResize = 'WIDTH_AND_HEIGHT'; t.characters = `W${i + 1}`;
        plotFrame.appendChild(t); t.x = toX(i) - t.width / 2; t.y = pad.top + usableH + 8; affectedNodes.push(t);
    }
}
async function renderPieChart(plotFrame, plotW, plotH, allSeries, seriesNames, seriesCount, chartVars, fallbackColors, fontRegular, affectedNodes) {
    var _a;
    const cx = plotW / 2, cy = plotH / 2, r = Math.min(cx, cy) * 0.8;
    const sliceValues = [];
    for (let s = 0; s < seriesCount; s++) sliceValues.push(Math.max(0, allSeries[s].reduce((a, b) => a + b, 0)));
    const total = sliceValues.reduce((a, b) => a + b, 0) || 1;
    let currentAngle = -Math.PI / 2;
    for (let s = 0; s < seriesCount; s++) {
        const sweep = (sliceValues[s] / total) * (Math.PI * 2);
        if (sweep < 0.001) { currentAngle += sweep; continue; }
        const color = fallbackColors[s]; const chartVar = (_a = chartVars[s]) !== null && _a !== void 0 ? _a : null;
        const slice = figma.createVector();
        slice.name = `${seriesNames[s]} slice`;
        slice.vectorPaths = [{ windingRule: 'NONZERO', data: pieSlicePath(cx, cy, r, currentAngle, currentAngle + sweep) }];
        slice.fills = [solidPaintBound(color, chartVar)]; slice.strokes = [];
        plotFrame.appendChild(slice); affectedNodes.push(slice);
        if (sweep > 0.3) {
            const midAngle = currentAngle + sweep / 2;
            const t = figma.createText(); t.name = `${seriesNames[s]} pct`; t.fontName = fontRegular; t.fontSize = 10;
            t.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            t.characters = `${Math.round((sliceValues[s] / total) * 100)}%`; t.textAutoResize = 'WIDTH_AND_HEIGHT';
            plotFrame.appendChild(t);
            t.x = cx + r * 0.62 * Math.cos(midAngle) - t.width / 2;
            t.y = cy + r * 0.62 * Math.sin(midAngle) - t.height / 2;
            affectedNodes.push(t);
        }
        currentAngle += sweep;
    }
}
function uniqueSceneNodes(nodes) { return [...new Set(nodes)].filter((node) => !node.removed); }
function attachRelaunch(nodes) {
    const unique = uniqueSceneNodes(nodes);
    if (unique.length > 0) { for (const node of unique) node.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME }); }
    else { figma.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME }); }
}
function singleSelectedTarget() { var _a; const sel = figma.currentPage.selection; return sel.length === 1 ? ((_a = sel[0]) !== null && _a !== void 0 ? _a : null) : null; }
function readAttachment(node) { var _a; try { const parsed = JSON.parse(node.getPluginData(ATTACH_KEY)); if ((parsed === null || parsed === void 0 ? void 0 : parsed.version) !== 1) return null; return { version: 1, params: normalizeParams(parsed.params), state: ((_a = parsed.state) !== null && _a !== void 0 ? _a : null) }; } catch (_b) { return null; } }
function evaluateEnabled_generate(selection) { return selection.length === 0 || (selection.length === 1 && selection[0].type === 'FRAME'); }
function selectedFrameRef() { const sel = figma.currentPage.selection; return sel.length === 1 && sel[0].type === 'FRAME' ? sel[0] : null; }
async function action_generate(params, customData, customSeriesNames, customCategoryNames) {
    const affectedNodes = [];
    await (async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
        const p = params;
        const fallbackColors = DEFAULT_COLORS;
        const [sv, ts] = await Promise.all([importSignalVars(), importSignalTextStyles()]);
        const chartVars = [(_a = sv.chart1) !== null && _a !== void 0 ? _a : null, (_b = sv.chart2) !== null && _b !== void 0 ? _b : null, (_c = sv.chart3) !== null && _c !== void 0 ? _c : null, (_d = sv.chart4) !== null && _d !== void 0 ? _d : null, (_e = sv.chart5) !== null && _e !== void 0 ? _e : null, (_f = sv.primary) !== null && _f !== void 0 ? _f : null];
        let allSeries, seriesNames, seriesCount, pointCount, categoryNames;
        if (customData && customData.length > 0) {
            seriesCount = Math.min(customData.length, 6);
            pointCount = Math.max(...customData.slice(0, seriesCount).map((s) => s.length));
            allSeries = customData.slice(0, seriesCount).map((s) => { var _a; const last = (_a = s[s.length - 1]) !== null && _a !== void 0 ? _a : 0; return s.length < pointCount ? [...s, ...new Array(pointCount - s.length).fill(last)] : s.slice(0, pointCount); });
            seriesNames = Array.from({ length: seriesCount }, (_, i) => customSeriesNames && customSeriesNames[i] ? customSeriesNames[i] : `Series ${String.fromCharCode(65 + i)}`);
            categoryNames = Array.from({ length: pointCount }, (_, i) => customCategoryNames && customCategoryNames[i] ? customCategoryNames[i] : `Y${i + 1}`);
        } else {
            seriesCount = p.seriesCount; pointCount = p.pointCount;
            allSeries = Array.from({ length: seriesCount }, (_, s) => generateSeriesData(s, pointCount));
            seriesNames = ['Services 1', 'B2B License', 'B2B Consumption', 'Product D', 'Product E', 'Product F'];
            categoryNames = Array.from({ length: pointCount }, (_, i) => `Y${i + 1}`);
        }
        let fontRegular = { family: 'Inter', style: 'Regular' };
        let fontSemibold = { family: 'Inter', style: 'SemiBold' };
        try {
            await figma.loadFontAsync({ family: 'SF Pro', style: 'Regular' });
            await figma.loadFontAsync({ family: 'SF Pro', style: 'Semibold' });
            fontRegular = { family: 'SF Pro', style: 'Regular' };
            fontSemibold = { family: 'SF Pro', style: 'Semibold' };
        } catch (_4) {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            await figma.loadFontAsync({ family: 'Inter', style: 'SemiBold' });
            await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
        }
        const chartBgVar = (_g = sv.chartBg) !== null && _g !== void 0 ? _g : null;
        const borderVar = (_h = sv.border) !== null && _h !== void 0 ? _h : null;
        const fgVar = (_j = sv.foreground) !== null && _j !== void 0 ? _j : null;
        const fgFallback = { r: 0.039, g: 0.039, b: 0.039 };
        const refFrame = selectedFrameRef();
        const chartWidth = refFrame ? Math.round(refFrame.width) : p.chartWidth;
        const chartHeight = refFrame ? Math.round(refFrame.height) : p.chartHeight;
        const root = figma.createFrame();
        root.name = p.chartType === 'bar' ? 'Bar chart' : p.chartType === 'pie' ? 'Pie chart' : 'Area chart';
        root.layoutMode = 'VERTICAL';
        root.primaryAxisSizingMode = 'FIXED';
        root.counterAxisSizingMode = 'FIXED';
        root.resize(chartWidth, chartHeight);
        root.itemSpacing = 0;
        root.paddingTop = 0; root.paddingBottom = 0; root.paddingLeft = 0; root.paddingRight = 0;
        root.clipsContent = true;
        root.cornerRadius = 12;
        tryBind(root, 'topLeftRadius', (_k = sv.borderRadius12) !== null && _k !== void 0 ? _k : null);
        tryBind(root, 'topRightRadius', (_l = sv.borderRadius12) !== null && _l !== void 0 ? _l : null);
        tryBind(root, 'bottomLeftRadius', (_m = sv.borderRadius12) !== null && _m !== void 0 ? _m : null);
        tryBind(root, 'bottomRightRadius', (_o = sv.borderRadius12) !== null && _o !== void 0 ? _o : null);
        root.fills = chartBgVar ? [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.961, g: 0.961, b: 0.961 } }, 'color', chartBgVar)] : [{ type: 'SOLID', color: { r: 0.961, g: 0.961, b: 0.961 } }];
        root.strokes = borderVar ? [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.898, g: 0.898, b: 0.898 } }, 'color', borderVar)] : [{ type: 'SOLID', color: { r: 0.898, g: 0.898, b: 0.898 } }];
        root.strokeWeight = 1; root.strokeAlign = 'INSIDE';
        tryBind(root, 'strokeTopWeight', (_p = sv.strokeWeight1) !== null && _p !== void 0 ? _p : null);
        tryBind(root, 'strokeBottomWeight', (_q = sv.strokeWeight1) !== null && _q !== void 0 ? _q : null);
        tryBind(root, 'strokeLeftWeight', (_r = sv.strokeWeight1) !== null && _r !== void 0 ? _r : null);
        tryBind(root, 'strokeRightWeight', (_s = sv.strokeWeight1) !== null && _s !== void 0 ? _s : null);
        const SECTION_PAD = 32;
        const showHeader = p.showChartTitle || p.showLegend;
        let headerNode = null;
        if (showHeader) {
            const header = figma.createFrame();
            header.name = 'Header'; header.layoutMode = 'HORIZONTAL'; header.itemSpacing = SECTION_PAD;
            header.paddingTop = SECTION_PAD; header.paddingBottom = SECTION_PAD; header.paddingLeft = SECTION_PAD; header.paddingRight = SECTION_PAD;
            header.primaryAxisAlignItems = 'MIN'; header.counterAxisAlignItems = 'MIN'; header.fills = [];
            root.appendChild(header); header.layoutSizingHorizontal = 'FILL'; header.layoutSizingVertical = 'HUG';
            tryBind(header, 'paddingLeft', (_t = sv.spacing32) !== null && _t !== void 0 ? _t : null);
            tryBind(header, 'paddingTop', (_u = sv.spacing32) !== null && _u !== void 0 ? _u : null);
            tryBind(header, 'paddingRight', (_v = sv.spacing32) !== null && _v !== void 0 ? _v : null);
            tryBind(header, 'paddingBottom', (_w = sv.spacing32) !== null && _w !== void 0 ? _w : null);
            tryBind(header, 'itemSpacing', (_x = sv.spacing32) !== null && _x !== void 0 ? _x : null);
            if (p.showChartTitle) {
                const titleText = figma.createText();
                await applyTextStyle(titleText, ts.titleLg, fontSemibold, 18, fgVar, fgFallback);
                titleText.characters = p.chartTitle || 'Chart title';
                header.appendChild(titleText); titleText.layoutSizingHorizontal = 'FILL'; titleText.layoutSizingVertical = 'HUG';
                affectedNodes.push(titleText);
            }
            if (p.showLegend) {
                const legendFrame = figma.createFrame();
                legendFrame.name = 'Legend'; legendFrame.layoutMode = 'HORIZONTAL'; legendFrame.layoutWrap = 'WRAP';
                legendFrame.itemSpacing = 16; legendFrame.primaryAxisAlignItems = 'MAX'; legendFrame.counterAxisAlignItems = 'CENTER'; legendFrame.counterAxisSpacing = 8; legendFrame.fills = [];
                header.appendChild(legendFrame); legendFrame.layoutSizingHorizontal = 'FILL'; legendFrame.layoutSizingVertical = 'HUG';
                for (let s = 0; s < seriesCount; s++) {
                    const color = fallbackColors[s]; const chartVar = (_y = chartVars[s]) !== null && _y !== void 0 ? _y : null;
                    const itemFrame = figma.createFrame();
                    itemFrame.name = `Legend Item ${s + 1}`; itemFrame.layoutMode = 'HORIZONTAL'; itemFrame.itemSpacing = 8;
                    itemFrame.primaryAxisAlignItems = 'MIN'; itemFrame.counterAxisAlignItems = 'CENTER'; itemFrame.fills = [];
                    legendFrame.appendChild(itemFrame); itemFrame.layoutSizingHorizontal = 'HUG'; itemFrame.layoutSizingVertical = 'HUG';
                    tryBind(itemFrame, 'itemSpacing', (_z = sv.spacing8) !== null && _z !== void 0 ? _z : null);
                    const dot = figma.createRectangle();
                    dot.resize(12, 12); dot.cornerRadius = 2; dot.fills = [solidPaintBound(color, chartVar)]; dot.strokes = [];
                    tryBind(dot, 'topLeftRadius', (_0 = sv.borderRadius2) !== null && _0 !== void 0 ? _0 : null);
                    tryBind(dot, 'topRightRadius', (_1 = sv.borderRadius2) !== null && _1 !== void 0 ? _1 : null);
                    tryBind(dot, 'bottomLeftRadius', (_2 = sv.borderRadius2) !== null && _2 !== void 0 ? _2 : null);
                    tryBind(dot, 'bottomRightRadius', (_3 = sv.borderRadius2) !== null && _3 !== void 0 ? _3 : null);
                    itemFrame.appendChild(dot);
                    const lt = figma.createText();
                    await applyTextStyle(lt, ts.labelSm, fontRegular, 14, fgVar, fgFallback);
                    lt.textAutoResize = 'WIDTH_AND_HEIGHT'; lt.characters = seriesNames[s];
                    itemFrame.appendChild(lt); affectedNodes.push(itemFrame, dot, lt);
                }
                affectedNodes.push(legendFrame);
            }
            affectedNodes.push(header); headerNode = header;
        }
        const actualHeaderHeight = headerNode ? headerNode.height : 0;
        const plotFrame = figma.createFrame();
        plotFrame.name = 'Plot Area'; plotFrame.fills = []; plotFrame.clipsContent = false;
        root.appendChild(plotFrame); plotFrame.layoutSizingHorizontal = 'FILL'; plotFrame.layoutSizingVertical = 'FILL';
        const plotW = chartWidth;
        const plotH = Math.max(100, chartHeight - actualHeaderHeight);
        plotFrame.resize(plotW, plotH);
        plotFrame.layoutSizingVertical = 'FILL';
        if (p.chartType === 'bar') { await renderBarChart(plotFrame, plotW, plotH, p, allSeries, seriesNames, categoryNames, seriesCount, pointCount, sv, chartVars, fallbackColors, ts, fontRegular, fontSemibold, affectedNodes); }
        else if (p.chartType === 'pie') { await renderPieChart(plotFrame, plotW, plotH, allSeries, seriesNames, seriesCount, chartVars, fallbackColors, fontRegular, affectedNodes); }
        else { await renderAreaChart(plotFrame, plotW, plotH, p, allSeries, seriesNames, seriesCount, pointCount, sv, chartVars, fallbackColors, ts, fontRegular, affectedNodes); }
        affectedNodes.push(plotFrame, root);
        placeNodeCentered(root, figma.viewport.center);
    })();
    return { affectedNodes, state: null };
}
async function runAction_generate(notify, customData, customSeriesNames, customCategoryNames) {
    isExecuting = true;
    try {
        const result = await action_generate(latestParams, customData, customSeriesNames, customCategoryNames);
        attachRelaunch(result.affectedNodes);
        pushActionStates();
        if (notify) {
            const created = result.affectedNodes.filter((n) => !n.removed);
            if (created.length > 0) { figma.currentPage.selection = created; figma.viewport.scrollAndZoomIntoView(created); }
            figma.notify(DISPLAY_NAME + ' generated');
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        figma.notify(message, { error: true }); throw error;
    } finally { isExecuting = false; }
}
function pushActionStates() {
    const sel = figma.currentPage.selection;
    const enabled = evaluateEnabled_generate(sel);
    const ref = selectedFrameRef();
    const label = enabled ? ref ? `Generate into ${Math.round(ref.width)}×${Math.round(ref.height)}` : 'Generate chart' : 'Select a frame or deselect all';
    figma.ui.postMessage({ type: 'action-state', actions: { generate: { enabled, label, status: undefined } } });
}
function refreshSelection() {
    var _a;
    if (isExecuting) return;
    const target = singleSelectedTarget();
    const attachment = target != null ? readAttachment(target) : null;
    latestParams = (_a = attachment === null || attachment === void 0 ? void 0 : attachment.params) !== null && _a !== void 0 ? _a : DEFAULTS;
    figma.ui.postMessage({ type: 'params-change', params: latestParams });
    pushActionStates();
}
const initialTarget = singleSelectedTarget();
const initialAttachment = initialTarget != null ? readAttachment(initialTarget) : null;
const initialParams = (_a = initialAttachment === null || initialAttachment === void 0 ? void 0 : initialAttachment.params) !== null && _a !== void 0 ? _a : DEFAULTS;
latestParams = initialParams;
let html = __html__;
html = html.replace(/(id="chartType"[^>]*\bvalue=")[^"]*(")/g, '$1' + htmlEscapeAttribute(String(initialParams.chartType)) + '$2');
html = setBooleanControl(html, 'showLegend', initialParams.showLegend);
html = setBooleanControl(html, 'showGrid', initialParams.showGrid);
html = setBooleanControl(html, 'stackedMode', initialParams.stackedMode);
html = setBooleanControl(html, 'showChartTitle', initialParams.showChartTitle);
html = html.replace(/(id="chartTitle"[^>]*\bvalue=")[^"]*(")/g, '$1' + htmlEscapeAttribute(initialParams.chartTitle) + '$2');
html = setBooleanControl(html, 'showXAxisTitle', initialParams.showXAxisTitle);
html = html.replace(/(id="xAxisTitle"[^>]*\bvalue=")[^"]*(")/g, '$1' + htmlEscapeAttribute(initialParams.xAxisTitle) + '$2');
html = setBooleanControl(html, 'showYAxisTitle', initialParams.showYAxisTitle);
html = html.replace(/(id="yAxisTitle"[^>]*\bvalue=")[^"]*(")/g, '$1' + htmlEscapeAttribute(initialParams.yAxisTitle) + '$2');
figma.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME });
figma.showUI(html, { width: 480, height: 384 });
pushActionStates();
figma.on('selectionchange', refreshSelection);
figma.ui.onmessage = (msg) => {
    if (msg.type === 'ready') { pushActionStates(); return; }
    if (msg.type === 'resize') { return; }
    if (msg.type === 'window-resize') { const w = Math.max(380, Math.min(1400, Math.round(msg.width))); const h = Math.max(260, Math.min(1000, Math.round(msg.height))); figma.ui.resize(w, h); return; }
    if (msg.type === 'action' && msg.id === 'generate') { latestParams = normalizeParams(msg.params); void runAction_generate(true, msg.customData, msg.seriesNames, msg.categoryNames); }
};
