const cars = d3.csv("cars.csv");

cars.then(function(data) {
    data.forEach(function(d) {
        d.price = +d.price;
    });

    const width = 800, height = 400;
    const margin = {top: 30, bottom: 50, left: 80, right: 50};

    const svg = d3.select("#barplot")
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .style('background', '#e9f7f2');

    const x0 = d3.scaleBand()
      .domain([...new Set(data.map(d => d["body-style"]))])
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain([...new Set(data.map(d => d["drive-wheels"]))])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.price)])
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d["drive-wheels"]))])
      .range(["#1f77b4", "#ff7f0e"]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("text-anchor", "middle");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "12px");

    // NEW: create a hidden tooltip div 
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("padding", "6px 10px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d["body-style"])},0)`);

    barGroups.append("rect")
      .attr("x", d => x1(d["drive-wheels"]))
      .attr("y", d => y(d.price))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - margin.bottom - y(d.price))
      .attr("fill", d => color(d["drive-wheels"]))
      // NEW show tooltip on hover 
      .on("mouseover", function(event, d) {
          tooltip
            .style("opacity", 1)
            .html(`<strong>Body:</strong> ${d["body-style"]}<br>
                   <strong>Drive:</strong> ${d["drive-wheels"]}<br>
                   <strong>Price:</strong> $${d.price.toLocaleString()}`);
      })
      // NEW move tooltip with cursor 
      .on("mousemove", function(event) {
          tooltip
            .style("left", (event.pageX + 12) + "px")
            .style("top", (event.pageY - 28) + "px");
      })
      // NEW hide tooltip on mouseout
      .on("mouseout", function() {
          tooltip.style("opacity", 0);
      });

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 70}, ${margin.top})`);

    const types = [...new Set(data.map(d => d["drive-wheels"]))];

    types.forEach((type, i) => {
      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", d => color(type));

      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle");
    });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.top + 15)
      .style("text-anchor", "middle")
      .text("Body style");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", margin.left/3)
      .style("text-anchor", "middle")
      .text("Price");
});