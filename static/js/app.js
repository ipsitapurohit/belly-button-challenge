// app.js contains the JavaScript logic for the Bellybutton Biodiversity Dashboard

// Load the data from samples.json
d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then(data => {
  // Extract required data from JSON
  const samples = data.samples;
  const metadata = data.metadata;

  // Display metadata
  const dropdown = d3.select("#selDataset");
  const demographicInfoDiv = d3.select("#demographic-info");

  dropdown.selectAll("option")
    .data(samples.map(sample => sample.id))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => `Sample ${d}`);

  // Event listener for dropdown change
  dropdown.on("change", function() {
    const selectedSampleId = this.value;
    const selectedSampleMetadata = metadata.find(entry => entry.id == selectedSampleId);

    // Display metadata
    demographicInfoDiv.html("");
    Object.entries(selectedSampleMetadata).forEach(([key, value]) => {
      demographicInfoDiv.append("p").text(`${key}: ${value}`);
    });

    // Update bar chart and bubble chart
    updateBarChart(selectedSampleId);
    updateBubbleChart(selectedSampleId);
  });

  // Initial load
  const initialSampleId = samples[0].id;
  updateBarChart(initialSampleId);
  updateBubbleChart(initialSampleId);

  function updateBarChart(sampleId) {
    const selectedSample = samples.find(sample => sample.id === sampleId);
    const otuIds = selectedSample.otu_ids.slice(0, 10).map(id => `OTU ${id}`).reverse();
    const sampleValues = selectedSample.sample_values.slice(0, 10).reverse();
    const otuLabels = selectedSample.otu_labels.slice(0, 10).reverse();

    // Create horizontal bar chart
    const svgWidth = 800;
    const svgHeight = (30 + 5) * otuIds.length; // Height based on number of bars
    const svg = d3.select("#chart").html("").append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const barHeight = 30;
    const barSpacing = 5;
    const barWidthScale = d3.scaleLinear()
      .domain([0, d3.max(sampleValues)])
      .range([0, svgWidth - 200]); // Adjust width to fit within SVG

    svg.selectAll("rect")
      .data(sampleValues)
      .enter()
      .append("rect")
      .attr("x", 200) // Adjust x-coordinate to leave space for text
      .attr("y", (d, i) => i * (barHeight + barSpacing))
      .attr("width", d => barWidthScale(d))
      .attr("height", barHeight)
      .attr("fill", "steelblue");

    // Add labels to the bars on the left-hand side
    svg.selectAll("text")
      .data(otuIds)
      .enter()
      .append("text")
      .attr("x", 190) // Adjust x-coordinate to position on the left-hand side
      .attr("y", (d, i) => i * (barHeight + barSpacing) + barHeight / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end") // Align text to the end
      .text(d => d);

    // Add hovertext to the bars
    svg.selectAll("title")
      .data(otuLabels)
      .enter()
      .append("title")
      .text(d => d);
  }

  function updateBubbleChart(sampleId) {
    const selectedSample = samples.find(sample => sample.id === sampleId);
    const otuIds = selectedSample.otu_ids;
    const sampleValues = selectedSample.sample_values;
    const otuLabels = selectedSample.otu_labels;

    // Set up bubble chart dimensions
    const margin = { top: 20, right: 20, bottom: 70, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    const svg = d3.select("#bubble-chart").html("").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleLinear()
      .domain([0, 3500])
      .range([0, width]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(7).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 200])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));

    // Add a scale for bubble size
    const z = d3.scaleLinear()
      .domain([0, d3.max(sampleValues)])
      .range([4, 40]);

    // Add dots
    svg.selectAll("dot")
      .data(sampleValues)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", function (d, i) { return x(otuIds[i]); })
      .attr("cy", function (d) { return y(d); })
      .attr("r", function (d) { return z(d); })
      .style("fill", function () { return `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`; })
      .style("fill-opacity", "0.6")
      .attr("stroke", "black")
      .append("title")
      .text(function (d, i) { return `${otuLabels[i]}`; });
  }
});
