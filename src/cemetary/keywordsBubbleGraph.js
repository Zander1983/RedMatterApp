/* Imports */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";

import am4themes_moonrisekingdom from "@amcharts/amcharts4/themes/moonrisekingdom";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

/* THIS IS HOW YOU USE IT IN A COMPONENT
  const [chart, setChart] = React.useState(null);
  useEffect(() => {
    setChart(
      createChart()
    );
    return () => {
      if (chart != null) {
        chart.dispose();
      }
    };
  }, []);
*/

/* Chart code */
export const createChart = (arg) => {
  am4core.useTheme(am4themes_moonrisekingdom);
  am4core.useTheme(am4themes_animated);

  let chart = am4core.create(
    "chartdiv",
    am4plugins_forceDirected.ForceDirectedTree
  );

  let networkSeries = chart.series.push(
    new am4plugins_forceDirected.ForceDirectedSeries()
  );

  networkSeries.data = arg === undefined ? data : arg;
  networkSeries.dataFields.linkWith = "linkWith";
  networkSeries.dataFields.name = "name";
  networkSeries.dataFields.id = "name";
  networkSeries.dataFields.value = "value";
  networkSeries.dataFields.children = "children";
  networkSeries.links.template.distance = 1;
  networkSeries.nodes.template.tooltipText = "{name}";
  networkSeries.nodes.template.fillOpacity = 1;
  networkSeries.nodes.template.outerCircle.scale = 1;

  networkSeries.nodes.template.label.text = "{name}";
  networkSeries.fontSize = 13;
  networkSeries.nodes.template.label.hideOversized = true;
  networkSeries.nodes.template.label.truncate = true;
  networkSeries.minRadius = am4core.percent(2);
  networkSeries.manyBodyStrength = -5;
  networkSeries.links.template.strokeOpacity = 0;

  return chart;
};

const data = [
  {
    name: "cell",
    value: 260,
    children: [
      { name: "live cells", value: 27, children: [] },
      { name: "single cells", value: 18, children: [] },
    ],
  },
  {
    name: "singlets",
    value: 64,
    children: [
      { name: "singlet", value: 76, children: [] },
      { name: "single", value: 115, children: [] },
    ],
  },
  {
    name: "cd",
    value: 67,
    children: [
      { name: "cd3+", value: 43, children: [] },
      { name: "cd45", value: 39, children: [] },
      { name: "cd44", value: 37, children: [] },
      { name: "cd19", value: 21, children: [] },
    ],
  },
  { name: "monocytes", value: 12, children: [] },
  {
    name: "lymphocytes",
    value: 28,
    children: [
      { name: "lymp", value: 49, children: [] },
      { name: "lymph", value: 48, children: [] },
      { name: "lympho", value: 43, children: [] },
      { name: "lymphocyte", value: 37, children: [] },
      { name: "lymf", value: 26, children: [] },
      { name: "lymfocyter", value: 24, children: [] },
    ],
  },
  {
    name: "gate",
    value: 86,
    children: [
      { name: "gate 1", value: 27, children: [] },
      { name: "g0/g1", value: 17, children: [] },
      { name: "gate 2", value: 14, children: [] },
    ],
  },
  {
    name: "live",
    value: 118,
    children: [
      { name: "live cell", value: 28, children: [] },
      { name: "alive", value: 16, children: [] },
      { name: "living", value: 13, children: [] },
    ],
  },
  { name: "positive", value: 25, children: [] },
  { name: "mono", value: 19, children: [] },
  { name: "scatter", value: 14, children: [] },
  { name: "test", value: 12, children: [] },
];
