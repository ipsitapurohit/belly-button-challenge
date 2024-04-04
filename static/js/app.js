<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Belly Button Biodiversity</title>
  <script src="https://d3js.org/d3.v6.min.js"></script>
</head>
<body>
  <div id="chart"></div>
  <div id="dropdown"></div>

  <script>
    // Load the data from samples.json
    d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then(data => {
      // Extract required data from JSON
      const samples = data.samples;
      const otuIds = samples[0].otu_ids.slice(0, 10).map(id => `OTU ${id}`).reverse();
      const sampleValues = samples[0].sample_values.slice(0, 10).reverse();
      const otuLabels = samples[0].otu_labels.slice(0, 10).reverse();

      // Create horizontal bar chart
      const svg = d3.select("#chart").append("svg")
        .attr("width", 800)
        .attr("height", 400);

      const barHeight = 30;
      const barSpacing = 5;
      const barWidthScale = d3.scaleLinear()
        .domain([0, d3.max(sampleValues)])
        .range([0, 700]);

      svg.selectAll("rect")
        .data(sampleValues)
        .enter()
        .append("rect")
        .attr("x", 150)
        .attr("y", (d, i) => i * (barHeight + barSpacing))
        .attr("width", d => barWidthScale(d))
        .attr("height", barHeight)
        .attr("fill", "steelblue");

      // Add labels to the bars
      svg.selectAll("text")
        .data(otuIds)
        .enter()
        .append("text")
        .attr("x", 140)
        .attr("y", (d, i) => i * (barHeight + barSpacing) + barHeight / 2)
        .attr("dy", ".35em")
        .text(d => d);

      // Add hovertext to the bars
      svg.selectAll("title")
        .data(otuLabels)
        .enter()
        .append("title")
        .text(d => d);

      // Create dropdown menu
      const dropdown = d3.select("#dropdown")
        .append("select");

      dropdown.selectAll("option")
        .data(samples.map(sample => sample.id))
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => `Sample ${d}`);

      // Event listener for dropdown change
      dropdown.on("change", function() {
        const selectedSampleId = this.value;
        const selectedSample = samples.find(sample => sample.id === selectedSampleId);
        const selectedOtuIds = selectedSample.otu_ids.slice(0, 10).map(id => `OTU ${id}`).reverse();
        const selectedSampleValues = selectedSample.sample_values.slice(0, 10).reverse();
        const selectedOtuLabels = selectedSample.otu_labels.slice(0, 10).reverse();

        svg.selectAll("rect")
          .data(selectedSampleValues)
          .transition()
          .duration(500)
          .attr("width", d => barWidthScale(d));

        svg.selectAll("text")
          .data(selectedOtuIds)
          .transition()
          .duration(500)
          .text(d => d);

        svg.selectAll("title")
          .data(selectedOtuLabels)
          .text(d => d);
      });
    });
  </script>
</body>
</html>
