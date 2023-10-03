// Environment setup
const fs = require("fs").promises;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const yaml = require("js-yaml");
const sharp = require("sharp");
const { group } = require("console");

// Function to read OSCAL YAML files to grab unique component IDs
async function readAndProcessYaml(oscalFilePath) {
  try {
    const data = await fs.readFile(oscalFilePath, "utf8");
    const content = yaml.load(data);

    let controlIds = [];

    if (
      content["component-definition"] &&
      content["component-definition"].components
    ) {
      content["component-definition"].components.forEach((component) => {
        if (component["control-implementations"]) {
          component["control-implementations"].forEach((controlImpl) => {
            if (controlImpl["implemented-requirements"]) {
              controlImpl["implemented-requirements"].forEach((req) => {
                if (req["control-id"]) {
                  controlIds.push(req["control-id"]);
                }
              });
            }
          });
        }
      });
    }

    const uniqueControlIds = [...new Set(controlIds)];
    return uniqueControlIds;
  } catch (err) {
    console.error("Error reading the file:", err);
  }
}

// Function to compare controls to baselines
function compareControls(uniqueControlIds, baseline) {
  const matchingItems = uniqueControlIds.filter((item) =>
    baseline.includes(item)
  );
  const notMatchingItems = uniqueControlIds.filter(
    (item) => !baseline.includes(item)
  );
  const baselineNotMatched = baseline.filter(
    (item) => !uniqueControlIds.includes(item)
  );

  return {
    matchingItems,
    notMatchingItems,
    baselineNotMatched,
  };
}

// Function to trigger the comparison and stores the data
async function createComparison(uniqueControlIds) {
  // NIST Baseline controls in OSCAL format
  const nistHighBaseline = [
    "ac-2",
    "ac-2.1",
    "ac-2.2",
    "ac-2.3",
    "ac-2.4",
    "ac-2.5",
    "ac-2.11",
    "ac-2.12",
    "ac-2.13",
    "ac-3",
    "ac-4",
    "ac-4.4",
    "ac-5",
    "ac-6",
    "ac-6.1",
    "ac-6.2",
    "ac-6.3",
    "ac-6.5",
    "ac-6.7",
    "ac-6.9",
    "ac-6.10",
    "ac-7",
    "ac-8",
    "ac-10",
    "ac-12",
    "ac-17.1",
    "ac-17.2",
    "ac-17.3",
    "ac-17.4",
    "au-2",
    "au-3",
    "au-3.1",
    "au-4",
    "au-5",
    "au-5.1",
    "au-5.2",
    "au-6",
    "au-6.1",
    "au-6.3",
    "au-6.5",
    "au-6.6",
    "au-7",
    "au-7.1",
    "au-8",
    "au-9",
    "au-9.2",
    "au-9.3",
    "au-9.4",
    "au-10",
    "au-11",
    "au-12",
    "au-12.1",
    "au-12.3",
    "ca-7",
    "ca-7.4",
    "ca-9",
    "cm-2",
    "cm-2.2",
    "cm-2.3",
    "cm-3.2",
    "cm-3.6",
    "cm-4.1",
    "cm-4.2",
    "cm-5",
    "cm-5.1",
    "cm-6",
    "cm-6.1",
    "cm-6.2",
    "cm-7",
    "cm-7.2",
    "cm-7.5",
    "cm-8",
    "cm-8.1",
    "cm-8.2",
    "cm-8.3",
    "cm-11",
    "cm-12.1",
    "cp-9",
    "cp-9.1",
    "cp-9.2",
    "cp-9.3",
    "cp-9.5",
    "cp-9.8",
    "ia-2",
    "ia-2.1",
    "ia-2.2",
    "ia-2.5",
    "ia-2.8",
    "ia-2.12",
    "ia-3",
    "ia-4",
    "ia-4.4",
    "ia-5",
    "ia-5.1",
    "ia-5.2",
    "ia-5.6",
    "ia-6",
    "ia-7",
    "ia-8",
    "ia-8.1",
    "ia-8.2",
    "ia-8.4",
    "ia-11",
    "ir-4.1",
    "ir-5.1",
    "mp-2",
    "ra-5",
    "ra-5.2",
    "ra-5.5",
    "sa-10",
    "sa-11",
    "sc-2",
    "sc-3",
    "sc-4",
    "sc-5",
    "sc-7",
    "sc-7.3",
    "sc-7.4",
    "sc-7.5",
    "sc-7.7",
    "sc-7.8",
    "sc-7.18",
    "sc-7.21",
    "sc-8",
    "sc-8.1",
    "sc-10",
    "sc-12",
    "sc-12.1",
    "sc-13",
    "sc-17",
    "sc-20",
    "sc-21",
    "sc-22",
    "sc-23",
    "sc-28",
    "sc-28.1",
    "sc-39",
    "si-2",
    "si-2.2",
    "si-3",
    "si-4",
    "si-4.2",
    "si-4.4",
    "si-4.5",
    "si-4.10",
    "si-4.12",
    "si-4.20",
    "si-4.22",
    "si-7",
    "si-7.1",
    "si-7.2",
    "si-7.5",
    "si-7.7",
    "si-7.15",
    "si-10",
    "si-11",
    "si-16",
  ];
  const nistModerateBaseline = [
    "ac-2",
    "ac-2.1",
    "ac-2.2",
    "ac-2.3",
    "ac-2.4",
    "ac-2.5",
    "ac-2.13",
    "ac-3",
    "ac-4",
    "ac-5",
    "ac-6",
    "ac-6.1",
    "ac-6.2",
    "ac-6.5",
    "ac-6.7",
    "ac-6.9",
    "ac-6.10",
    "ac-7",
    "ac-8",
    "ac-12",
    "ac-17.1",
    "ac-17.2",
    "ac-17.3",
    "ac-17.4",
    "au-2",
    "au-3",
    "au-3.1",
    "au-4",
    "au-5",
    "au-6",
    "au-6.1",
    "au-6.3",
    "au-7",
    "au-7.1",
    "au-8",
    "au-9",
    "au-9.4",
    "au-11",
    "au-12",
    "ca-7",
    "ca-7.4",
    "ca-9",
    "cm-2",
    "cm-2.2",
    "cm-2.3",
    "cm-3.2",
    "cm-4.2",
    "cm-5",
    "cm-6",
    "cm-7",
    "cm-7.2",
    "cm-7.5",
    "cm-8",
    "cm-8.1",
    "cm-8.3",
    "cm-11",
    "cm-12.1",
    "cp-9",
    "cp-9.1",
    "cp-9.8",
    "ia-2",
    "ia-2.1",
    "ia-2.2",
    "ia-2.8",
    "ia-2.12",
    "ia-3",
    "ia-4",
    "ia-4.4",
    "ia-5",
    "ia-5.1",
    "ia-5.2",
    "ia-5.6",
    "ia-6",
    "ia-7",
    "ia-8",
    "ia-8.1",
    "ia-8.2",
    "ia-8.4",
    "ia-11",
    "ir-4.1",
    "mp-2",
    "ra-5",
    "ra-5.2",
    "ra-5.5",
    "sa-10",
    "sa-11",
    "sc-2",
    "sc-4",
    "sc-5",
    "sc-7",
    "sc-7.3",
    "sc-7.4",
    "sc-7.5",
    "sc-7.7",
    "sc-7.8",
    "sc-8",
    "sc-8.1",
    "sc-10",
    "sc-12",
    "sc-13",
    "sc-17",
    "sc-20",
    "sc-21",
    "sc-22",
    "sc-23",
    "sc-28",
    "sc-28.1",
    "sc-39",
    "si-2",
    "si-2.2",
    "si-3",
    "si-4",
    "si-4.2",
    "si-4.4",
    "si-4.5",
    "si-7",
    "si-7.1",
    "si-7.7",
    "si-10",
    "si-11",
    "si-16",
  ];
  const nistLowBaseline = [
    "ac-2",
    "ac-3",
    "ac-7",
    "ac-8",
    "au-2",
    "au-3",
    "au-4",
    "au-5",
    "au-6",
    "au-8",
    "au-9",
    "au-11",
    "au-12",
    "ca-7",
    "ca-7.4",
    "ca-9",
    "cm-2",
    "cm-5",
    "cm-6",
    "cm-7",
    "cm-8",
    "cm-11",
    "cp-9",
    "ia-2",
    "ia-2.1",
    "ia-2.2",
    "ia-2.8",
    "ia-2.12",
    "ia-4",
    "ia-5",
    "ia-5.1",
    "ia-6",
    "ia-7",
    "ia-8",
    "ia-8.1",
    "ia-8.2",
    "ia-8.4",
    "ia-11",
    "mp-2",
    "ra-5",
    "ra-5.2",
    "sc-5",
    "sc-7",
    "sc-12",
    "sc-13",
    "sc-20",
    "sc-21",
    "sc-22",
    "sc-39",
    "si-2",
    "si-3",
    "si-4",
  ];

  // Comparing uniqueControlIds with various NIST baselines
  const nistHighComparison = compareControls(
    uniqueControlIds,
    nistHighBaseline
  );
  const nistModerateComparison = compareControls(
    uniqueControlIds,
    nistModerateBaseline
  );
  const nistLowComparison = compareControls(uniqueControlIds, nistLowBaseline);

  return {
    nistHighComparison,
    nistModerateComparison,
    nistLowComparison,
  };
}

// Function to create the pie charts
async function pieChart(data, baseline, totalControls) {

  // Initialize JSDOM instance
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
  const d3 = await import("d3");

  // Create an SVG canvas
  const svg = d3
    .select(dom.window.document.body)
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", 400)
    .attr("height", 400);

  // Data for pie chart
  const dataForPie = [
    data.matchingItems.length,
    data.baselineNotMatched.length,
  ];

  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2;

  const color = d3.scaleOrdinal().range(["#787ABA", "#86D4F3"]);

  const pie = d3.pie().value((d) => d);
  const arc = d3.arc().outerRadius(radius).innerRadius(0);

  // Create pie chart
  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Create paths (the pie slices)
  const arcs = g
    .selectAll("arc")
    .data(pie(dataForPie))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs
    .append("path")
    .attr("d", arc)
    .style("fill", (d) => color(d.data));

  // Add labels
  arcs
    .append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .style("font-size", "25px")
    .style("font-family", "Roboto, sans-serif")
    .text((d, i) => {
      const percentage = ((d.data / totalControls) * 100).toFixed(2);
      const label = i === 0 ? "Met" : "Not Met";
      return `${label}: ${percentage}%`;
    });

  // Get the SVG content and save it
  const svgContent = dom.window.document.querySelector("svg").outerHTML;

  await fs.writeFile(
    `./compliance-images/pie-chart-${baseline}.svg`,
    svgContent
  );

  // Remove the SVG from JSDOM to avoid appending multiple SVGs in the same DOM
  dom.window.document.querySelector("svg").remove();
}

// Function to trigger pie charts and provides the data needed for NIST 800-53 Charts
async function createGraphs(
  nistHighComparison,
  nistModerateComparison,
  nistLowComparison
) {
  const datasets = [
    {
      data: nistHighComparison,
      label: "High",
      baseline: "NistHighComparison",
      // If the # of High Tech controls change update this.
      totalControls: 157,
    },
    {
      data: nistModerateComparison,
      label: "Moderate",
      baseline: "NistModerateComparison",
      // If the # of Moderate Tech controls change update this.
      totalControls: 121,
    },
    {
      data: nistLowComparison,
      label: "Low",
      baseline: "NistLowComparison",
      // If the # of Low Tech controls change update this.
      totalControls: 52,
    },
  ];
  for (const { data, baseline, totalControls } of datasets) {
    await pieChart(data, baseline, totalControls);
  }

  const combinedDataset = datasets.map((dataset) => ({
    label: dataset.label,
    value: dataset.data.matchingItems.length,
    baseline: dataset.baseline,
    totalControls: dataset.totalControls,
  }));
  await horizontalBarGraph(combinedDataset);
}

async function horizontalBarGraph(data, width = 800, height = 600) {
  // Initialize JSDOM instance
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
  const d3 = await import("d3");

  // Starting point for Margin Sizes
  const marginLeft = 100;
  const marginRight = 50;
  const marginTop = 50;
  const marginBottom = 50;

  // Create the SVG container
  const svg = d3
    .select(dom.window.document.body)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr(
      "style",
      "max-width: 100%; height: auto; font: 20px Roboto, sans-serif;"
    );

  // Create the scales.
  const x = d3
    .scaleLinear()
    .domain([0, 1]) // To-Do Probably change this to 100 so 0-100
    .range([marginLeft, width - marginRight]);

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.label))
    .rangeRound([marginTop, height - marginBottom])
    .padding(0.1);

  // Append a rect for each data point.
  svg
    .append("g")
    .attr("fill", "#8a3ffc")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.label))
    .attr("width", (d) => x(d.value / d.totalControls) - x(0))
    .attr("height", y.bandwidth());

  // Append a label for each data point.
  svg
    .append("g")
    .attr("fill", "#FFFFFF")
    .attr("text-anchor", "end")
    .selectAll()
    .data(data)
    .join("text")
    .attr("x", (d) => x(d.value / d.totalControls) - 4)
    .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("dx", -4)
    .text((d) => +((d.value / d.totalControls) * 100).toFixed(2) + "%")
    .call((text) =>
      text
        .filter((d) => x(d.value / d.totalControls) - x(0) < 20)
        .attr("dx", +4)
        .attr("fill", "red")
        .attr("text-anchor", "start")
    );

  // Create the X axes.
  svg
    .append("g")
    .attr("transform", `translate(0,${marginTop})`)
    .call(d3.axisTop(x).ticks(5, "%"))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .attr("fill", "#C2C4C6") // Font color
    .style("font-family", "Roboto")
    .style("font-size", "20px"); // This updates the X Axis labels

  // Create the Y axis
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .style("font-size", "20px") // This updates the Y Axis labels
    .attr("fill", "#C2C4C6") // Font color
    .style("font-family", "Roboto");

  // Get the SVG content and save it
  const svgContent = dom.window.document.querySelector("svg").outerHTML;

  // Convert SVG to PNG buffer using svg-to-img
  const pngBuffer = await sharp(Buffer.from(svgContent)).toBuffer();
  await fs.writeFile(`./compliance-images/horizontal-bar-graph.png`, pngBuffer);

  // Use sharp to process the image and save it
  await sharp(pngBuffer)
    .png()
    .toFile("./compliance-images/horizontal-bar-graph.png");

  // Remove the SVG from JSDOM to avoid appending multiple SVGs in the same DOM
  dom.window.document.querySelector("svg").remove();
}

// Function for grouping control families
function groupByControlFamily(
  uniqueControlIds,
  nistHighComparisonMatchingItems,
  nistModerateComparisonMatchingItems,
  nistLowComparisonMatchingItems
) {
  // Define the control families
  const controlFamilies = {
    AC: "Access Control",
    AT: "Awareness and Training",
    AU: "Audit and Accountability",
    CA: "Assessment, Authorization, and Monitoring",
    CM: "Configuration Management",
    CP: "Contingency Planning",
    IA: "Identification and Authentication",
    IR: "Incident Response",
    MA: "Maintenance",
    MP: "Media Protection",
    PE: "Physical and Environmental Protection",
    PL: "Planning",
    PM: "Program Management",
    PS: "Personnel Security",
    PT: "Personally Identifiable Information Processing and Transparency",
    RA: "Risk Assessment",
    SA: "System and Services Acquisition",
    SC: "System and Communications Protection",
    SI: "System and Information Integrity",
    SR: "Supply Chain Risk Management",
  };

  // Initialize an object to store grouped control IDs
  let groupedControlData = {};
  let groupedNistHighComparison = {};
  let groupedNistModerateComparison = {};
  let groupedNistLowComparison = {};

  // Initialize arrays for each control family
  for (let family in controlFamilies) {
    groupedControlData[family] = [];
    groupedNistHighComparison[family] = [];
    groupedNistModerateComparison[family] = [];
    groupedNistLowComparison[family] = [];
  }

  // Populate the groupedControlData object
  uniqueControlIds.forEach((id) => {
    let family = id.match(/^[a-z]+/i)[0].toUpperCase(); // Extract the family prefix and convert to uppercase
    if (groupedControlData[family]) {
      groupedControlData[family].push(id);
    }
  });

  // Populate the groupedNistHighComparison object
  nistHighComparisonMatchingItems.forEach((id) => {
    let family = id.match(/^[a-z]+/i)[0].toUpperCase(); // Extract the family prefix and convert to uppercase
    if (groupedNistHighComparison[family]) {
      groupedNistHighComparison[family].push(id);
    }
  });

  // Populate the groupedNistModerateComparison object
  nistModerateComparisonMatchingItems.forEach((id) => {
    let family = id.match(/^[a-z]+/i)[0].toUpperCase(); // Extract the family prefix and convert to uppercase
    if (groupedNistModerateComparison[family]) {
      groupedNistModerateComparison[family].push(id);
    }
  });

  // Populate the groupedNistLowComparison object
  nistLowComparisonMatchingItems.forEach((id) => {
    let family = id.match(/^[a-z]+/i)[0].toUpperCase(); // Extract the family prefix and convert to uppercase
    if (groupedNistLowComparison[family]) {
      groupedNistLowComparison[family].push(id);
    }
  });

  return {
    groupedControlData,
    groupedNistHighComparison,
    groupedNistModerateComparison,
    groupedNistLowComparison,
  };
}

async function createStackedBarChart(
  groupedNistHighComparison,
  groupedNistModerateComparison,
  groupedNistLowComparison,
  width = 800,
  height = 600
) {
  // Initialize JSDOM instance
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
  const d3 = await import("d3");

  // Starting point for Margin Sizes
  const marginLeft = 150; // <------- To-Do May remove, don't think I want to do it this way
  const marginRight = 50;
  const marginTop = 50;
  const marginBottom = 200;

  // Create the SVG container
  const svg = d3
    .select(dom.window.document.body)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "font: 20px Roboto, sans-serif;");

  const data = [
    groupedNistHighComparison,
    groupedNistModerateComparison,
    groupedNistLowComparison,
  ].map((groupObject) => {
    const counts = {};
    Object.values(groupObject).forEach((groupArray) => {
      groupArray.forEach((control) => {
        const family = control.split("-")[0];
        counts[family] = (counts[family] || 0) + 1; // <----- To-Do check if splitting correct
      });
    });
    return counts;
  });

  // Grabs unique family names, IE AC, AU, etc
  const families = Array.from(new Set(data.flatMap((d) => Object.keys(d))));

  // Created the data for the stacked bars
  const stack = d3.stack().keys(families);
  const stackedData = stack(data);
  console.log(JSON.stringify(stackedData, null, 2));

  const x = d3
    .scaleBand()
    .domain(["High", "Moderate", "Low"]) // To-Do Maybe update?
    .range([marginLeft, width - marginRight]) // To-Do Maybe update?
    .padding(0.4); // To-Do Maybe update?

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])]) // To-Do Maybe update?
    .range([height - marginBottom, marginTop]); // To-Do Maybe update?
  
  const colorPalette = [
    "#8a3ffc",
    "#33b1ff",
    "#007d79",
    "#ff7eb6",
    "#fa4d56",
    "#fff1f1",
    "#6fdc8c",
    "#4589ff",
    "#d12771",
    "#d2a106",
    "#08bdba",
    "#bae6ff",
    "#ba4e00",
    "#d4bbff",
  ];

  const color = d3.scaleOrdinal(colorPalette).domain(families);
  console.log(color.domain());

  const layers = svg
    .selectAll("g.layer")
    .data(stackedData)
    .enter()
    .append("g")
    // .append("g") To-Do: Remove?
    .attr("fill", (d) => color(d.key));

  layers
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d, i) => x(["High", "Moderate", "Low"][i]))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .each(function (d, i) {
      // the 'nodes' parameter gives you access to all rectangles in the layer
      const bar = d3.select(this);
      const [y1, y2] = d;
      const height = y(y1) - y(y2);
      const parentData = d3.select(this.parentNode).datum();
      const familyName = parentData.key; // this retrieves the correct family name based on the rectangle index
      if (height > 15) {
        // Adjust this value if needed
        svg
          .append("text")
          .attr("x", +bar.attr("x") + x.bandwidth() / 2)
          .attr("y", +bar.attr("y") + height / 2)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text(familyName)
          .attr("fill", "white") // You can adjust the color as needed
          .style("font-size", "14px");
      }
    });

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text, path, line") // Selects all text elements in the x-axis
    .style("font-size", "18px") // Set the desired font size
    .style("stroke", "#ffffff")
    .style("fill", "#ffffff"); // Set the desired font color

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text, path, line") // Selects all text elements in the x-axis
    .style("font-size", "18px") // Set the desired font size
    .style("stroke", "#ffffff")
    .style("fill", "#ffffff"); // Set the desired font color
  
  const legend = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width - marginRight}, ${height - marginBottom + 40})`
    ); // Adjust the 40 based on how far from the bottom you want the legend

  families.forEach((family, i) => {
    const legendItem = legend
      .append("g")
      .attr("transform", `translate(0,${i * 20})`); // Adjust the 20 based on spacing between legend items

    // Add color box
    legendItem
      .append("rect")
      .attr("width", 15) // Rectangle width
      .attr("height", 15) // Rectangle height
      .style("fill", color(family));

    // Add label
    legendItem
      .append("text")
      .attr("x", 20) // Position the text 20 units to the right of the rectangle
      .attr("y", 10) // Adjust this based on desired vertical alignment
      .text(family)
      .style("font-size", "14px")
      .style("fill", "#ffffff") // Font color, adjust as needed
      .attr("alignment-baseline", "middle");
  });

  const svgContent = dom.window.document.querySelector("svg").outerHTML;

  // Convert SVG to PNG buffer using svg-to-img
  const pngBuffer = await sharp(Buffer.from(svgContent)).toBuffer();
  await fs.writeFile(
    `./compliance-images/vertical-stacked-bar-graph.png`,
    pngBuffer
  );

  // Use sharp to process the image and save it
  await sharp(pngBuffer)
    .png()
    .toFile("./compliance-images/vertical-stacked-bar-graph.png");

  // Remove the SVG from JSDOM to avoid appending multiple SVGs in the same DOM
  dom.window.document.querySelector("svg").remove();
}

// Function to transform data for donut chart
async function transformDonutData(groupedControlData) {
  return Object.keys(groupedControlData)
    .filter((key) => groupedControlData[key].length > 0) // Filter out keys with zero count
    .map((key) => ({
      name: key,
      value: groupedControlData[key].length,
    }));
}

// Function to create donut chart
async function createDonutChart(data, width = 500) {
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
  const d3 = await import("d3"); // make sure to extract the default from the import

  const height = Math.min(width, 500);
  const radius = height / 2;

  // Create an SVG canvas
  const svg = d3
    .select(dom.window.document.body)
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  const arc = d3
    .arc()
    .innerRadius(radius * 0.67)
    .outerRadius(radius - 1);

  const pie = d3
    .pie()
    .padAngle(1 / radius)
    .sort(null)
    .value((d) => d.value);

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range([
      "#8a3ffc", // Purple 60
      "#33b1ff", // Cyan 40
      "#007d79", // Teal 60
      "#ff7eb6", // Magenta 40
      "#fa4d56", // Red 50
      "#fff1f1", // Red 10
      "#6fdc8c", // Green 30
      "#4589ff", // Blue 50
      "#d12771", // Magenta 60
      "#d2a106", // Yellow 40
      "#08bdba", // Teal 40
      "#bae6ff", // Cyan 20
      "#ba4e00", // Orange 60
      "#d4bbff", // Purple 30
    ]);

  svg
    .append("g")
    .selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("fill", (d) => color(d.data.name))
    .attr("d", arc)
    .append("title")
    .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);

  svg
    .append("g")
    .attr("font-family", "Roboto", "sans-serif")
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(pie(data))
    .join("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .call((text) =>
      text
        .append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text((d) => d.data.name)
    )
    .call((text) =>
      text
        .filter((d) => d.endAngle - d.startAngle > 0.08)
        .append("tspan")
        .attr("x", 0)
        .attr("y", "0.7em")
        .attr("fill-opacity", 0.7)
        .text((d) => d.data.value.toLocaleString("en-US"))
    );

  return svg.node().outerHTML; // Return the SVG as a string
}

// Create SVG image of donut chart
async function generateDonutSVG(groupedControlData, width = 500) {
  // const groupedData = groupByControlFamily(uniqueControlIds); 
  const transformedData = await transformDonutData(groupedControlData);
  const chartNode = await createDonutChart(transformedData, width);

  // Save the SVG to a file (using Node.js for this example)
  await fs.writeFile(`./compliance-images/donutChart.svg`, chartNode);
  // fs.writeFileSync("donutChart.svg", chartNode.outerHTML);
}

// Function that orchestrates the entire process and ensures the correct data is passed between functions.
async function main() {
  try {
    // The first two values in argv are the path to node and the path to your script.
    const args = process.argv.slice(2);

    // Set the default file path
    const defaultOscalFilePath =
      "./defense-unicorns-distro/oscal-component.yaml";

    const oscalFilePath = args.length > 0 ? args[0] : defaultOscalFilePath;

    const uniqueControlIds = await readAndProcessYaml(oscalFilePath);

    if (uniqueControlIds) {
      const { nistHighComparison, nistModerateComparison, nistLowComparison } =
        await createComparison(uniqueControlIds);

      // Call the function to get grouped control IDs by family
      const nistHighComparisonMatchingItems =
        nistHighComparison.matchingItems || [];
      const nistModerateComparisonMatchingItems =
        nistModerateComparison.matchingItems || [];
      const nistLowComparisonMatchingItems =
        nistLowComparison.matchingItems || [];

      const {
        groupedControlData,
        groupedNistHighComparison,
        groupedNistModerateComparison,
        groupedNistLowComparison,
      } = groupByControlFamily(
        uniqueControlIds,
        nistHighComparisonMatchingItems,
        nistModerateComparisonMatchingItems,
        nistLowComparisonMatchingItems
      );

      // At this point, you can run the createStackedBarChart function, assuming you have defined it elsewhere.
      await createStackedBarChart(
        groupedNistHighComparison,
        groupedNistModerateComparison,
        groupedNistLowComparison
      );

      await createGraphs(
        nistHighComparison,
        nistModerateComparison,
        nistLowComparison
      );

      // Generate the D3 Donut SVG
      await generateDonutSVG(groupedControlData)
    } else {
      console.error("uniqueControlIds is undefined");
    }
  } catch (err) {
    console.error("Failed to read and process YAML:", err);
  }
}

// Call the main function
main();

const args = process.argv.slice(2); // The first two values in argv are the path to node and the path to your script.

// Set the default file path
const defaultOscalFilePath = "./defense-unicorns-distro/oscal-component.yaml";

const oscalFilePath = args.length > 0 ? args[0] : defaultOscalFilePath;
