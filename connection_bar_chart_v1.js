function initConnectionChart(containerId) {
    // Data
    const data = [
        { category: "Very connected", count: 512, color: "#e86a1a" },
        { category: "Somewhat connected", count: 297, color: "#ff944d" },
        { category: "A little connected", count: 104, color: "#ffc499" },
        { category: "Not very connected", count: 53, color: "#ffd6b3" },
        { category: "Not at all connected", count: 35, color: "#ffe6cc" }
    ];

    // Calculate total for percentages
    const total = data.reduce((sum, d) => sum + d.count, 0);

    // Set up dimensions
    const margin = { top: 40, right: 20, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, total])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, height])
        .padding(0.1);

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Connection to Canadian Identity");

    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create bars
    let currentX = 0;
    data.forEach(d => {
        const bar = svg.append("g")
            .attr("transform", `translate(${currentX},0)`);

        bar.append("rect")
            .attr("y", y(d.category))
            .attr("width", x(d.count))
            .attr("height", y.bandwidth())
            .attr("fill", d.color)
            .on("mouseover", function(event) {
                d3.select(this)
                    .attr("opacity", 0.8);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <strong>${d.category}</strong><br/>
                    Count: ${d.count}<br/>
                    Percentage: ${((d.count / total) * 100).toFixed(1)}%
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("opacity", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add percentage text
        bar.append("text")
            .attr("x", x(d.count) / 2)
            .attr("y", y(d.category) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("fill", d.count > 100 ? "white" : "black")
            .style("font-size", "12px")
            .text(`${((d.count / total) * 100).toFixed(1)}%`);

        currentX += x(d.count);
    });

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(",")))
        .selectAll("text")
        .style("font-size", "12px");
} 