// Configuration
const config = {
  canvasId: 'respondents-canvas',
  totalRespondents: 1001,
  tileSize: 20,
  padding: 2,
  colors: {
    generations: {
      'Gen Z': '#FF944D',      // Light orange
      'Millennials': '#E86A1A', // Medium orange
      'Gen X': '#CC5500',      // Dark orange
      'Boomers': '#994000',    // Very dark orange
      'Silent': '#662B00'      // Almost brown orange
    },
    provinces: {
      'Ontario': '#FF944D',
      'Quebec': '#E86A1A',
      'British Columbia': '#CC5500',
      'Alberta': '#994000',
      'Manitoba': '#662B00',
      'Saskatchewan': '#FFA666',
      'Nova Scotia': '#E87F33',
      'New Brunswick': '#CC6619',
      'PEI': '#994D19',
      'Newfoundland': '#663300',
      'Northwest Territories': '#FFB380',
      'Nunavut': '#E8994D',
      'Yukon': '#CC7733'
    },
    connection: {
      'Strong': '#FF944D',    // Light orange
      'Moderate': '#CC5500',  // Dark orange
      'Weak': '#662B00'       // Very dark orange
    }
  },
  theme: {
    background: '#0f0f0f',    // Dark background
    text: '#e0e0e0',          // Light text
    accent: '#e86a1a',        // Orange accent
    secondary: '#cc5500',     // Dark orange secondary
    muted: '#333333'          // Dark gray for muted elements
  }
};

// Initialize the visualization
function initRespondentsVisualization() {
  const container = document.querySelector('.section:nth-child(3)');
  const canvas = document.createElement('canvas');
  canvas.id = config.canvasId;
  canvas.style.width = '100%';
  canvas.style.height = '600px';
  canvas.style.backgroundColor = config.theme.background;
  
  // Add controls
  const controls = document.createElement('div');
  controls.className = 'visualization-controls';
  controls.innerHTML = `
    <button class="control-btn" data-group="generation">Group by Generation</button>
    <button class="control-btn" data-group="province">Group by Province</button>
    <button class="control-btn" data-group="connection">Group by Connection</button>
    <button class="control-btn" data-action="reset">Reset</button>
  `;
  
  // Add legend
  const legend = document.createElement('div');
  legend.className = 'visualization-legend';
  
  container.appendChild(canvas);
  container.appendChild(controls);
  container.appendChild(legend);
  
  // Initialize canvas
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  // Draw initial state
  drawTiles(ctx);
  
  // Add event listeners
  controls.addEventListener('click', (e) => {
    if (e.target.classList.contains('control-btn')) {
      const action = e.target.dataset.action;
      const group = e.target.dataset.group;
      
      if (action === 'reset') {
        drawTiles(ctx);
      } else if (group) {
        groupTiles(ctx, group);
      }
    }
  });
}

// Draw the initial tile layout
function drawTiles(ctx) {
  const { tileSize, padding, totalRespondents } = config;
  const canvas = ctx.canvas;
  const cols = Math.floor(canvas.width / (tileSize + padding));
  const rows = Math.ceil(totalRespondents / cols);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < totalRespondents; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * (tileSize + padding);
    const y = row * (tileSize + padding);
    
    ctx.fillStyle = config.theme.accent;
    ctx.fillRect(x, y, tileSize, tileSize);
  }
}

// Group tiles by category
function groupTiles(ctx, category) {
  const { tileSize, padding, totalRespondents, colors } = config;
  const canvas = ctx.canvas;
  const cols = Math.floor(canvas.width / (tileSize + padding));
  const rows = Math.ceil(totalRespondents / cols);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Simulate data (replace with actual data in production)
  const data = generateMockData(category);
  
  data.forEach((item, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * (tileSize + padding);
    const y = row * (tileSize + padding);
    
    ctx.fillStyle = colors[category][item.group] || config.theme.accent;
    ctx.fillRect(x, y, tileSize, tileSize);
  });
  
  updateLegend(category);
}

// Generate mock data (replace with actual data in production)
function generateMockData(category) {
  const data = [];
  const groups = Object.keys(config.colors[category]);
  
  for (let i = 0; i < config.totalRespondents; i++) {
    data.push({
      group: groups[Math.floor(Math.random() * groups.length)]
    });
  }
  
  return data;
}

// Update the legend
function updateLegend(category) {
  const legend = document.querySelector('.visualization-legend');
  const colors = config.colors[category];
  
  legend.innerHTML = Object.entries(colors)
    .map(([group, color]) => `
      <div class="legend-item">
        <span class="color-box" style="background-color: ${color}"></span>
        <span class="group-name">${group}</span>
      </div>
    `)
    .join('');
}

// Add styles
const styles = document.createElement('style');
styles.textContent = `
  .visualization-controls {
    margin: 1rem 0;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .control-btn {
    padding: 0.5rem 1rem;
    background: ${config.theme.accent};
    color: ${config.theme.text};
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .control-btn:hover {
    background: ${config.theme.secondary};
    transform: translateY(-1px);
  }
  
  .visualization-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
    padding: 1rem;
    background: ${config.theme.muted};
    border-radius: 8px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .color-box {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .group-name {
    font-size: 0.9rem;
    color: ${config.theme.text};
  }
`;

document.head.appendChild(styles);

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initRespondentsVisualization); 