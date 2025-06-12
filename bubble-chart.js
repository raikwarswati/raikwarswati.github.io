// Theme-aware color palettes
const themeColors = {
    light: {
        main: "#e86a1a",      // accent
        soft: "#ff944d",      // accent-soft
        highlight: "#ffc499", // highlight
        bg: "#fffaf5",        // bg-color
        text: "#000000"       // black text for light mode
    },
    dark: {
        main: "#e86a1a",      // accent
        soft: "#ff944d",      // accent-soft
        highlight: "#ffc499", // highlight
        bg: "#0f0f0f",        // bg-color
        text: "#fffaf5"       // creamish white text for dark mode
    }
};

// Generate color variations based on theme
function generateThemePalette(isDark) {
    const theme = isDark ? themeColors.dark : themeColors.light;
    const colors = [];
    
    // Main accent color variations
    colors.push(theme.main);
    colors.push(theme.soft);
    colors.push(theme.highlight);
    
    // Generate complementary colors
    const mainColor = d3.color(theme.main);
    const softColor = d3.color(theme.soft);
    const highlightColor = d3.color(theme.highlight);
    
    // Add variations with different opacity and brightness
    for (let i = 0; i < 11; i++) {
        const t = i / 10;
        const color = d3.interpolate(softColor, highlightColor)(t);
        colors.push(color);
    }
    
    return colors;
}

function initBubbleChart(containerId) {
    let isDark = document.body.classList.contains('dark-theme');
    const theme = isDark ? themeColors.dark : themeColors.light;

    // Data structure
    const data = {
        name: "root",
        children: [
            {
                name: "Cultural and linguistic frameworks",
                value: 184,
                percentage: 0.0675229358
            },
            {
                name: "Regional landscape and place",
                value: 254,
                percentage: 0.0932110092
            },
            {
                name: "Work and creative contributions",
                value: 300,
                percentage: 0.1100917431
            },
            {
                name: "Heritage and ancestral connections",
                value: 325,
                percentage: 0.119266055
            },
            {
                name: "Community relationships and networks",
                value: 348,
                percentage: 0.127706422
            },
            {
                name: "Personal passions and curiosities",
                value: 529,
                percentage: 0.1941284404
            },
            {
                name: "Belief systems and core values",
                value: 754,
                percentage: 0.2766972477
            },
            {
                name: "Other (open-ended)",
                value: 31,
                percentage: 0.0113761468,
                children: [
                    { name: "Language & Unity", value: 1, percentage: 0.0333333333 },
                    { name: "Political/Critical", value: 2, percentage: 0.0666666667 },
                    { name: "Family & Relationships", value: 4, percentage: 0.1333333333 },
                    { name: "Community & Values", value: 17, percentage: 0.5666666667 },
                    { name: "Personal Freedoms & Role", value: 3, percentage: 0.1 },
                    { name: "National Pride & Critique", value: 3, percentage: 0.1 }
                ]
            }
        ]
    };

    // Create a color scale based on value
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(data.children, d => d.value)])
        .interpolator(d3.interpolate(theme.highlight, theme.main));

    const color = d => colorScale(d.value);

    // Prepare flat data for force simulation
    let nodes = [];
    let otherChildren = [];
    data.children.forEach(d => {
        if (d.name === "Other (open-ended)" && d.children) {
            d.children.forEach(child => {
                otherChildren.push({
                    ...child,
                    parent: d.name,
                    group: "other"
                });
            });
        } else {
            nodes.push({
                ...d,
                parent: "root",
                group: "main"
            });
        }
    });
    nodes = nodes.concat(otherChildren);

    // Add a virtual node for the transparent 'Other' bubble
    const otherBubble = {
        name: "Other (open-ended) Group",
        value: 60,
        parent: "root",
        group: "otherParent",
        fx: null,
        fy: null
    };
    nodes.push(otherBubble);

    // Dimensions
    const width = 900;
    const height = 700;

    // Create SVG and group for zooming
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    const g = svg.append("g");

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background", theme.bg)
        .style("color", theme.text);

    // Radius scale
    const r = d3.scaleSqrt()
        .domain([0, d3.max(nodes, d => d.value)])
        .range([20, 90]);

    // Initial positions
    nodes.forEach(d => {
        d.x = width / 2 + (d.group === "other" ? 120 * Math.cos(Math.random() * 2 * Math.PI) : 300 * Math.cos(Math.random() * 2 * Math.PI));
        d.y = height / 2 + (d.group === "other" ? 120 * Math.sin(Math.random() * 2 * Math.PI) : 200 * Math.sin(Math.random() * 2 * Math.PI));
    });
    otherBubble.x = width / 2 + 120;
    otherBubble.y = height / 2;

    // D3 force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(-80))
        .force("collision", d3.forceCollide().radius(d => r(d.value) + 4))
        .force("x", d3.forceX(d => d.group === "other" ? width / 2 + 120 : width / 2).strength(0.08))
        .force("y", d3.forceY(height / 2).strength(0.08))
        .alpha(1)
        .alphaDecay(0.02)
        .on("tick", ticked);

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    svg.call(zoom);

    // Draw transparent 'Other' parent bubble
    const otherParent = g.append("circle")
        .attr("class", "other-parent")
        .attr("fill", d3.color(theme.main).copy({opacity: 0.1}))
        .attr("stroke", d3.color(theme.main).copy({opacity: 0.2}))
        .attr("stroke-width", 2)
        .attr("pointer-events", "none");

    // Draw bubbles
    const node = g.selectAll("g.node")
        .data(nodes.filter(d => d.group !== "otherParent"))
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    node.append("circle")
        .attr("r", d => r(d.value))
        .attr("fill", d => color(d))
        .style("opacity", d => d.group === "other" ? 0.9 : 0.85)
        .attr("stroke", d => color(d))
        .attr("stroke-width", 2)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("opacity", 1)
                .attr("stroke", color(d))
                .attr("stroke-width", 2.5);
            tooltip.transition()
                .duration(200)
                .style("opacity", .95);
            tooltip.html(
                `<strong>${d.name}</strong><br/>` +
                `Value: ${d.value}<br/>` +
                (d.percentage !== undefined ? `Percentage: ${(d.percentage * 100).toFixed(2)}%<br/>` : "") +
                (d.parent && d.parent !== "root" ? `Category: ${d.parent}` : "")
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("opacity", d.group === "other" ? 0.9 : 0.85)
                .attr("stroke", color(d))
                .attr("stroke-width", 2);
            tooltip.transition()
                .duration(300)
                .style("opacity", 0);
        });

    // Helper: robustly fit and wrap text inside a circle
    function fitTextInCircle(g, text, radius) {
        let minFontSize = 4;
        let maxFontSize = Math.min(2 * radius / 3, 16);
        let fontSize = maxFontSize;
        let lines = [];
        let fits = false;
        let maxLines = 6;
        let diameter = 2 * radius * 0.95;
        while (!fits && fontSize >= minFontSize) {
            lines = [];
            let words = text.split(/\s+/);
            let line = [];
            let testLine = '';
            for (let i = 0; i < words.length; i++) {
                testLine = (line.concat(words[i])).join(' ');
                const temp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                temp.setAttribute('font-size', fontSize);
                temp.textContent = testLine;
                document.body.appendChild(temp);
                const width = temp.getComputedTextLength();
                document.body.removeChild(temp);
                if (width > diameter && line.length > 0) {
                    lines.push(line.join(' '));
                    line = [words[i]];
                } else {
                    line.push(words[i]);
                }
            }
            if (line.length) lines.push(line.join(' '));
            let allFit = true;
            for (let l of lines) {
                const temp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                temp.setAttribute('font-size', fontSize);
                temp.textContent = l;
                document.body.appendChild(temp);
                const width = temp.getComputedTextLength();
                document.body.removeChild(temp);
                if (width > diameter) {
                    allFit = false;
                    break;
                }
            }
            const totalHeight = lines.length * fontSize * 1.1;
            if (allFit && totalHeight <= diameter && lines.length <= maxLines) {
                fits = true;
                break;
            }
            fontSize -= 1;
        }
        if (!fits) {
            let last = lines[lines.length - 1] || '';
            let truncated = last;
            const temp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            temp.setAttribute('font-size', fontSize);
            while (truncated.length > 3) {
                temp.textContent = truncated + '...';
                document.body.appendChild(temp);
                const width = temp.getComputedTextLength();
                document.body.removeChild(temp);
                if (width <= diameter) break;
                truncated = truncated.slice(0, -1);
            }
            lines[lines.length - 1] = truncated + '...';
        }
        lines.forEach((line, i) => {
            g.append('text')
                .attr('y', (i - (lines.length - 1) / 2) * fontSize * 1.1)
                .attr('text-anchor', 'middle')
                .attr('fill', theme.text)
                .attr('font-size', fontSize)
                .text(line)
                .style('pointer-events', 'none');
        });
    }

    node.selectAll('text').remove();
    node.each(function(d) {
        const g = d3.select(this);
        fitTextInCircle(g, d.name, r(d.value));
    });
    node.select('circle')
        .attr('stroke', d => color(d))
        .attr('stroke-width', 2);

    function ticked() {
        const otherKids = nodes.filter(d => d.group === "other");
        const cx = d3.mean(otherKids, d => d.x);
        const cy = d3.mean(otherKids, d => d.y);
        let maxDist = 0;
        otherKids.forEach(d => {
            const dist = Math.sqrt((d.x - cx) ** 2 + (d.y - cy) ** 2) + r(d.value);
            if (dist > maxDist) maxDist = dist;
        });
        const minOtherRadius = 80;
        const otherRadius = Math.max(r(otherBubble.value) + 20, maxDist, minOtherRadius);
        otherParent
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', otherRadius);
        otherKids.forEach(d => {
            const dx = d.x - cx;
            const dy = d.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const limit = otherRadius - r(d.value) - 2;
            if (dist > limit) {
                const angle = Math.atan2(dy, dx);
                d.x = cx + limit * Math.cos(angle);
                d.y = cy + limit * Math.sin(angle);
            }
        });
        node.attr('transform', d => `translate(${d.x},${d.y})`);
        node.selectAll('text').remove();
        node.each(function(d) {
            const g = d3.select(this);
            fitTextInCircle(g, d.name, r(d.value));
        });
    }

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Add a custom force to keep non-'Other' bubbles out of the 'Other' parent circle
    simulation.force('otherKeepOut', function(alpha) {
        const otherKids = nodes.filter(d => d.group === 'other');
        const otherParentNode = nodes.find(d => d.group === 'otherParent');
        const cx = d3.mean(otherKids, d => d.x);
        const cy = d3.mean(otherKids, d => d.y);
        let maxDist = 0;
        otherKids.forEach(d => {
            const dist = Math.sqrt((d.x - cx) ** 2 + (d.y - cy) ** 2) + r(d.value);
            if (dist > maxDist) maxDist = dist;
        });
        const minOtherRadius = 80;
        const otherRadius = Math.max(r(otherBubble.value) + 20, maxDist, minOtherRadius);
        nodes.forEach(d => {
            if (d.group !== 'other' && d.group !== 'otherParent') {
                const dx = d.x - cx;
                const dy = d.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = otherRadius + r(d.value) + 2;
                if (dist < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const targetX = cx + minDist * Math.cos(angle);
                    const targetY = cy + minDist * Math.sin(angle);
                    d.x += (targetX - d.x) * 0.2 * alpha;
                    d.y += (targetY - d.y) * 0.2 * alpha;
                }
            }
        });
    });

    // Add theme change listener
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                isDark = document.body.classList.contains('dark-theme');
                const theme = isDark ? themeColors.dark : themeColors.light;
                
                // Update color scale
                colorScale.interpolator(d3.interpolate(theme.highlight, theme.main));
                
                // Update bubble colors
                node.select("circle")
                    .attr("fill", d => color(d))
                    .attr("stroke", d => color(d));
                
                // Update Other parent bubble colors
                otherParent
                    .attr("fill", d3.color(theme.main).copy({opacity: 0.1}))
                    .attr("stroke", d3.color(theme.main).copy({opacity: 0.2}));
                
                // Update tooltip colors
                tooltip
                    .style("background", theme.bg)
                    .style("color", theme.text);

                // Update text colors
                node.selectAll('text')
                    .attr('fill', theme.text);
            }
        });
    });

    observer.observe(document.body, { attributes: true });
} 