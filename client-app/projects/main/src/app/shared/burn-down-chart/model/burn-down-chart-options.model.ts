import { TimeUnit } from "chart.js";

export interface BurnDownChartOptions {
  minDateISOString?: string;
  maxDateISOString?: string;
  minYValue?: number;
  maxYValue?: number;
  hideLegend?: boolean;
  timeUnit?: TimeUnit
}
