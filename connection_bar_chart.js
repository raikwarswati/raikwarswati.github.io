function initConnectionChart(containerId) {
    // Data
    const data = [
        { category: "Very connected", count: 512, color: "#e86a1a" },
        { category: "Somewhat connected", count: 297, color: "#ff944d" },
        { category: "A little connected", count: 104, color: "#ffc499" },
        { category: "Not very connected", count: 53, color: "#ffd6b3" },
        { category: "Not at all connected", count: 35, color: "#ffe6cc" }
    ];

    // Emoji mapping for each category
    const emojiMap = {
        "Very connected": "😃",
        "Somewhat connected": "🙂",
        "A little connected": "😐",
        "Not very connected": "😕",
        "Not at all connected": "😞"
    };

    // Detect theme
    const isLightTheme = document.body.classList.contains('light-theme');
    const textColor = isLightTheme ? 'black' : 'white';

    // Calculate total for percentages
    const total = data.reduce((sum, d) => sum + d.count, 0);

    // Set up dimensions
    const margin = { top: 60, right: 20, bottom: 40, left: 20 };
    const width = 800 - margin.left - margin.right;
    const height = 80;

    // Remove any previous SVG
    d3.select(`#${containerId}`).selectAll("svg").remove();

    // Create SVG
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scale
    const x = d3.scaleLinear()
        .domain([0, total])
        .range([0, width]);

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add scale labels above the bar
    svg.append("text")
        .attr("x", 0)
        .attr("y", -30)
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", textColor)
        .text("Very connected");

    svg.append("text")
        .attr("x", width)
        .attr("y", -30)
        .attr("text-anchor", "end")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", textColor)
        .text("Not at all connected");

    // Draw the single stacked bar
    let currentX = 0;
    data.forEach(d => {
        const segmentWidth = x(d.count);
        const g = svg.append("g").attr("transform", `translate(${currentX},0)`);
        g.append("rect")
            .attr("width", segmentWidth)
            .attr("height", height)
            .attr("fill", d.color)
            .on("mouseover", function(event) {
                d3.select(this).attr("opacity", 0.8);
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`
                    <strong>${d.category}</strong><br/>
                    Count: ${d.count}<br/>
                    Percentage: ${((d.count / total) * 100).toFixed(1)}%
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("opacity", 1);
                tooltip.transition().duration(500).style("opacity", 0);
            });
        // Add percentage label
        g.append("text")
            .attr("x", segmentWidth / 2)
            .attr("y", height / 2 - 7)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("fill", textColor)
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`${((d.count / total) * 100).toFixed(1)}%`);
        // Add emoji label instead of text
        g.append("text")
            .attr("x", segmentWidth / 2)
            .attr("y", height / 2 + 18)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("fill", d.count > 100 ? textColor : textColor)
            .style("font-size", "24px")
            .text(emojiMap[d.category]);
        currentX += segmentWidth;
    });

    // Optionally, add a border around the bar
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1);

    // Add title above
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        // .text("Connection to Canadian Identity");
} 