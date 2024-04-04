<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Belly Button Biodiversity</title>
  <script src="https://d3js.org/d3.v6.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
  <style>
    /* CSS to style the header with a specific font */
    .dashboard-header {
      font-family: Arial, sans-serif; /* Specify the desired font */
    }

    /* CSS to style the grey box for the dropdown */
    #dropdown-container {
      background-color: #f0f0f0; /* Grey background */
      padding: 10px; /* Add padding */
      border-radius: 5px; /* Add border radius */
      margin-bottom: 20px; /* Add some bottom margin */
    }

    /* CSS to style the heading of the dropdown */
    #dropdown-heading {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    /* CSS to style the dropdown */
    #selDataset {
      width: 100%; /* Make dropdown full width */
    }

    /* CSS to style the demographic info box */
    #demographic-info-container {
      background-color: #f9f9f9; /* Light grey background */
      padding: 10px; /* Add padding */
      border-radius: 5px; /* Add border radius */
      margin-bottom: 20px; /* Add some bottom margin */
    }

    /* CSS to style the heading of the demographic info box */
    #demographic-info-heading {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    /* CSS for the bubble chart */
    #bubble-chart-container {
      text-align: center; /* Center align the bubble chart */
    }

    .bubble {
      fill-opacity: 0.7;
    }

  </style>
</head>
<body>
  <!-- Add the header with the specified font -->
  <div class="col-md-12 p-5 text-center bg-light dashboard-header">
    <h1>Belly Button Biodiversity Dashboard</h1>
    <p>Use the interactive charts below to explore the dataset</p>
  </div>
  
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <!-- Grey box for dropdown -->
        <div id="dropdown-container">
          <!-- Dropdown heading -->
          <h6 id="dropdown-heading">Test Subject ID No.:</h6>
          <!-- Dropdown -->
          <select id="selDataset"></select>
        </div>
        <!-- Demographic Info box -->
        <div id="demographic-info-container">
          <h6 id="demographic-info-heading">Demographic Info:</h6>
          <div id="demographic-info"></div>
        </div>
      </div>
      <div class="col-md-6 offset-md-2">
        <!-- Chart containers -->
        <div id="chart"></div>
      </div>
    </div>
    <!-- Bubble chart container -->
    <div class="row">
      <div class="col-md-12" id="bubble-chart-container">
        <div id="bubble-chart"></div>
      </div>
    </div>
  </div>

  <script>
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
  </script>
</body>
</html>
