import { TimeGranularity, ChartProps } from '@superset-ui/core';
export interface DatasourceMetric {
    label: string;
    metric_name?: string;
    d3format?: string;
}
export interface BigNumberDatum {
    [key: string]: number | null;
}
export declare type BigNumberFormData = {
    colorPicker?: {
        r: number;
        g: number;
        b: number;
    };
    metric?: {
        label: string;
    } | string;
    compareLag?: string | number;
    yAxisFormat?: string;
    timeGrainSqla?: TimeGranularity;
};
export declare type BignumberChartProps = ChartProps & {
    formData: BigNumberFormData;
    queryData: ChartProps['queryData'] & {
        data?: BigNumberDatum[];
    };
};
export default function transformProps(chartProps: BignumberChartProps): {
    width: number;
    height: number;
    bigNumber: number | null;
    bigNumberFallback: {
        x: number | null;
        y: number | null;
    } | undefined;
    className: string;
    formatNumber: import("@superset-ui/core/lib/number-format/NumberFormatter").default;
    formatTime: import("@superset-ui/core/lib/time-format/TimeFormatter").default;
    headerFontSize: any;
    subheaderFontSize: any;
    mainColor: string | undefined;
    showTrendLine: any;
    startYAxisAtZero: any;
    subheader: any;
    trendLineData: {
        x: number | null;
        y: number | null;
    }[] | undefined;
    fromDatetime: any;
    toDatetime: any;
    timeRangeFixed: any;
};
//# sourceMappingURL=transformProps.d.ts.map