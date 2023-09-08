// Environment setup
const fs = require("fs").promises;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const yaml = require("js-yaml");

// Function to read OSCAL YAML files to grab unique component IDs
async function readAndProcessYaml() {
  try {
    const data = await fs.readFile("/defense-unicorns-distro/oscal-component.yaml", "utf8");
    const content = yaml.load(data);

    console.log("Parsed YAML content:", content);

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
    console.log(uniqueControlIds);
    console.log(content);
    // return uniqueControlIds
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
  console.log("Unique Control IDs:", uniqueControlIds);
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
  "ac-11",
  "ac-11.1",
  "ac-12",
  "ac-17",
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
  "ca-8",
  "ca-8.1",
  "ca-9",
  "cm-2",
  "cm-2.2",
  "cm-2.3",
  "cm-2.7",
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
  "cm-8.4",
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
  "ir-4.4",
  "ir-5.1",
  "mp-2",
  "pl-10",
  "pl-11",
  "ra-5",
  "ra-5.2",
  "ra-5.4",
  "ra-5.5",
  "ra-5.11",
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
  "sc-15",
  "sc-17",
  "sc-18",
  "sc-20",
  "sc-21",
  "sc-22",
  "sc-23",
  "sc-24",
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
  "ac-11",
  "ac-11.1",
  "ac-12",
  "ac-17",
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
  "cm-2.7",
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
  "pl-10",
  "pl-11",
  "ra-5",
  "ra-5.2",
  "ra-5.5",
  "ra-5.11",
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
  "sc-15",
  "sc-17",
  "sc-18",
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
  "ac-17",
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
  "pl-10",
  "pl-11",
  "ra-5",
  "ra-5.2",
  "ra-5.11",
  "sc-5",
  "sc-7",
  "sc-12",
  "sc-13",
  "sc-15",
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
  const nistLowComparison = compareControls(
    uniqueControlIds,
    nistLowBaseline
  );

  console.log("High Baseline Comparison", nistHighComparison);
  console.log("Moderate Baseline Comparison", nistModerateComparison);
  console.log("Low Baseline Comparison", nistLowComparison);

  return {
    nistHighComparison,
    nistModerateComparison,
    nistLowComparison
  };
}

// Function to create the pie charts
async function graph(data, baseline, totalControls) {
  console.log("Data for D3:", data, "Baseline:", baseline);

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
    // .text((d) => d.data); // This shows text as #
    // .text((d) => `${((d.data / totalControls) * 100).toFixed(2)}%`); // This shows text as %
    .text((d, i) => {
      const percentage = ((d.data / totalControls) * 100).toFixed(2);
      const label = i === 0 ? "Met" : "Not Met";
      return `${label}: ${percentage}%`;
    });

  // Get the SVG content and save it
  const svgContent = dom.window.document.querySelector("svg").outerHTML;

  await fs.writeFile(`./compliance-images/${baseline}.svg`, svgContent);

  // Remove the SVG from JSDOM to avoid appending multiple SVGs in the same DOM
  dom.window.document.querySelector("svg").remove();
}

// Function to trigger pie charts and provides the data needed for NIST 800-53 Charts
async function createGraphs(nistHighComparison, nistModerateComparison, nistLowComparison) {
  const datasets = [
    { data: nistHighComparison, baseline: "NistHighComparison", totalControls: 172 },
    { data: nistModerateComparison, baseline: "NistModerateComparison", totalControls: 130 },
    { data: nistLowComparison, baseline: "NistLowComparison", totalControls: 57 },
  ];
  for (const { data, baseline, totalControls } of datasets) {

    await graph(data, baseline, totalControls);
  }
}

// Function for grouping control families
function groupByControlFamily(uniqueControlIds) {
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
  let groupedControlIds = {};

  // Initialize arrays for each control family
  for (let family in controlFamilies) {
    groupedControlIds[family] = [];
  }

  // Populate the groupedControlIds object
  uniqueControlIds.forEach((id) => {
    let family = id.match(/^[a-z]+/i)[0].toUpperCase(); // Extract the family prefix and convert to uppercase
    if (groupedControlIds[family]) {
      groupedControlIds[family].push(id);
    }
  });

  return groupedControlIds;
}

// Function to transform data for donut chart
async function transformDonutData(groupedData) {
  return Object.keys(groupedData)
    .filter((key) => groupedData[key].length > 0) // Filter out keys with zero count
    .map((key) => ({
      name: key,
      value: groupedData[key].length,
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
    .range(
      d3
        .quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
        .reverse()
    );

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
async function generateDonutSVG(uniqueControlIds, width = 500) {
  const groupedData = groupByControlFamily(uniqueControlIds);
  const transformedData = await transformDonutData(groupedData);
  const chartNode = await createDonutChart(transformedData, width);

  // Save the SVG to a file (using Node.js for this example)
  await fs.writeFile(`./compliance-images/donutChart.svg`, chartNode);
  // fs.writeFileSync("donutChart.svg", chartNode.outerHTML);
}

// Function that orchestrates the entire process and ensures the correct data is passed between functions.
async function main() {
  try {
    const uniqueControlIds = await readAndProcessYaml();

    if (uniqueControlIds) {
      // Call the new function to get grouped control IDs by family
      const groupedControlData = groupByControlFamily(uniqueControlIds);
      console.log(groupedControlData); // To view the output (you can remove this if not needed)

      const { nistHighComparison, nistModerateComparison, nistLowComparison } =
        await createComparison(uniqueControlIds);

      await createGraphs(
        nistHighComparison,
        nistModerateComparison,
        nistLowComparison
      );

      // Generate the D3 Donut SVG
      await generateDonutSVG(uniqueControlIds);
    } else {
      console.error("uniqueControlIds is undefined");
    }
  } catch (err) {
    console.error("Failed to read and process YAML:", err);
  }
}

  // Call the main function
  main();
