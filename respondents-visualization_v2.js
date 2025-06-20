import { colorPalette, generateCategoryColors } from './styles/colors.js';

let config = {
  canvasId: 'respondents-canvas',
  tileSize: 20,
  padding: 2,
  theme: colorPalette.theme
};

let respondentsData = null;

// Load the JSON data and initialize config
async function loadRespondentsData() {
  try {
    console.log('Loading respondents data...');
    const response = await fetch('respondents_data_100.json');
    respondentsData = await response.json();
    console.log('Data loaded:', respondentsData);
    
    // Generate config from actual data
    config.totalRespondents = Object.keys(respondentsData).length;
    console.log('Total respondents:', config.totalRespondents);
    
    // Extract unique categories from data
    const generations = [...new Set(Object.values(respondentsData).map(d => d.Q3_generation))];
    const provinces = [...new Set(Object.values(respondentsData).map(d => d.Q1_province))];
    const connections = [...new Set(Object.values(respondentsData).map(d => d.Q5_identity_connection))];
    
    console.log('Categories found:', {
      generations,
      provinces,
      connections
    });
    
    // Generate color mappings for each category
    config.colors = {
      generations: generateCategoryColors(generations, colorPalette.primary),
      provinces: generateCategoryColors(provinces, colorPalette.secondary),
      connection: generateCategoryColors(connections, colorPalette.tertiary)
    };
    
    console.log('Config generated:', config);
    initRespondentsVisualization();
  } catch (error) {
    console.error('Error loading respondents data:', error);
  }
}

// Initialize the visualization
function initRespondentsVisualization() {
  console.log('Initializing visualization...');
  const container = document.getElementById('respondents-visualization');
  if (!container) {
    console.error('Container element not found!');
    return;
  }
  
  const canvas = document.createElement('canvas');
  canvas.id = config.canvasId;
  canvas.style.width = '100%';
  canvas.style.height = '600px';
  canvas.style.backgroundColor = config.theme.background;
  
  // Add tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.style.display = 'none';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = config.theme.muted;
  tooltip.style.padding = '10px';
  tooltip.style.borderRadius = '5px';
  tooltip.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  tooltip.style.zIndex = '1000';
  tooltip.style.color = config.theme.text;
  tooltip.style.fontSize = '14px';
  tooltip.style.pointerEvents = 'none';

  // Add modal element
  const modal = document.createElement('div');
  modal.className = 'respondent-modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.zIndex = '2000';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.backgroundColor = config.theme.background;
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '10px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.overflowY = 'auto';
  modalContent.style.position = 'relative';

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.right = '10px';
  closeButton.style.top = '10px';
  closeButton.style.border = 'none';
  closeButton.style.background = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.color = config.theme.text;
  
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  
  // Add controls
  const controls = document.createElement('div');
  controls.className = 'visualization-controls';
  controls.innerHTML = `
    <button class="control-btn" data-group="generations">Group by Generation</button>
    <button class="control-btn" data-group="provinces">Group by Province</button>
    <button class="control-btn" data-group="connection">Group by Connection</button>
    <button class="control-btn" data-action="reset">Reset</button>
  `;
  
  // Add legend
  const legend = document.createElement('div');
  legend.className = 'visualization-legend';
  
  container.appendChild(canvas);
  container.appendChild(controls);
  container.appendChild(legend);
  container.appendChild(tooltip);
  document.body.appendChild(modal);
  
  // Initialize canvas
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  console.log('Canvas dimensions:', {
    width: canvas.width,
    height: canvas.height
  });
  
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

  // Add hover event listeners
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { tileSize, padding } = config;
    const cols = Math.floor(canvas.width / (tileSize + padding));
    
    const col = Math.floor(x / (tileSize + padding));
    const row = Math.floor(y / (tileSize + padding));
    const index = row * cols + col;
    
    if (index >= 0 && index < config.totalRespondents) {
      const respondent = respondentsData[index];
      if (respondent) {
        const tooltipContent = `
          <div><strong>Province:</strong> ${respondent.Q1_province}</div>
          <div><strong>Urban/Rural:</strong> ${respondent.Q1a_urban_rural}</div>
          <div><strong>Canadian Tenure:</strong> ${respondent.Q2_canadian_tenure}</div>
          <div><strong>Generation:</strong> ${respondent.Q3_generation}</div>
        `;
        tooltip.innerHTML = tooltipContent;
        tooltip.style.display = 'block';
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY + 10}px`;
      }
    } else {
      tooltip.style.display = 'none';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  // Add click handler for modal
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { tileSize, padding } = config;
    const cols = Math.floor(canvas.width / (tileSize + padding));
    
    const col = Math.floor(x / (tileSize + padding));
    const row = Math.floor(y / (tileSize + padding));
    const index = row * cols + col;
    
    if (index >= 0 && index < config.totalRespondents) {
      const respondent = respondentsData[index];
      if (respondent) {
        // Create detailed content
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.style.marginTop = '20px';
        
        // Create header
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '20px';
        header.style.paddingBottom = '15px';
        header.style.borderBottom = `2px solid ${config.theme.accent}`;
        
        const title = document.createElement('h2');
        title.textContent = 'Respondent Information';
        title.style.color = config.theme.accent;
        title.style.margin = '0';
        title.style.fontSize = '24px';
        
        header.appendChild(title);
        modalBody.appendChild(header);
        
        // Create biodata container
        const biodataContainer = document.createElement('div');
        biodataContainer.style.display = 'flex';
        biodataContainer.style.flexDirection = 'column';
        biodataContainer.style.gap = '15px';
        
        // Get all properties from the respondent object
        const properties = Object.entries(respondent);
        
        // Group properties by category
        const categories = {
          'Demographics': ['Q1_province', 'Q1a_urban_rural', 'Q2_canadian_tenure', 'Q3_generation'],
          'Identity': ['Q5_identity_connection'],
          'Other': [] // For any remaining properties
        };
        
        // Add remaining properties to 'Other' category
        properties.forEach(([key]) => {
          if (!Object.values(categories).flat().includes(key)) {
            categories['Other'].push(key);
          }
        });
        
        // Create sections for each category
        Object.entries(categories).forEach(([category, props]) => {
          if (props.length > 0) {
            const section = document.createElement('div');
            section.style.backgroundColor = config.theme.muted;
            section.style.borderRadius = '8px';
            section.style.padding = '15px';
            
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = category;
            sectionTitle.style.color = config.theme.accent;
            sectionTitle.style.margin = '0 0 15px 0';
            sectionTitle.style.fontSize = '18px';
            sectionTitle.style.borderBottom = `1px solid ${config.theme.accent}`;
            sectionTitle.style.paddingBottom = '8px';
            
            section.appendChild(sectionTitle);
            
            const propertiesGrid = document.createElement('div');
            propertiesGrid.style.display = 'grid';
            propertiesGrid.style.gridTemplateColumns = '200px 1fr';
            propertiesGrid.style.gap = '10px';
            
            props.forEach(prop => {
              const value = respondent[prop];
              if (value !== undefined) {
                const keyDiv = document.createElement('div');
                keyDiv.style.fontWeight = 'bold';
                keyDiv.style.color = config.theme.text;
                keyDiv.style.padding = '8px';
                keyDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                keyDiv.style.borderRadius = '4px';
                keyDiv.textContent = prop.replace(/_/g, ' ').replace(/Q\d+_/g, '');
                
                const valueDiv = document.createElement('div');
                valueDiv.style.padding = '8px';
                valueDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                valueDiv.style.borderRadius = '4px';
                valueDiv.textContent = value;
                
                propertiesGrid.appendChild(keyDiv);
                propertiesGrid.appendChild(valueDiv);
              }
            });
            
            section.appendChild(propertiesGrid);
            biodataContainer.appendChild(section);
          }
        });
        
        modalBody.appendChild(biodataContainer);
        
        // Clear previous content and add new content
        while (modalContent.children.length > 1) {
          modalContent.removeChild(modalContent.lastChild);
        }
        modalContent.appendChild(modalBody);
        
        // Show modal
        modal.style.display = 'flex';
      }
    }
  });

  // Close modal when clicking the close button or outside the modal
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Draw the initial tile layout
function drawTiles(ctx) {
  console.log('Drawing tiles...');
  const { tileSize, padding, totalRespondents } = config;
  const canvas = ctx.canvas;
  const cols = Math.floor(canvas.width / (tileSize + padding));
  const rows = Math.ceil(totalRespondents / cols);
  
  console.log('Tile layout:', {
    cols,
    rows,
    totalTiles: totalRespondents
  });
  
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
  console.log('Grouping tiles by:', category);
  const { tileSize, padding, totalRespondents, colors } = config;
  const canvas = ctx.canvas;
  const cols = Math.floor(canvas.width / (tileSize + padding));
  const rows = Math.ceil(totalRespondents / cols);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  Object.entries(respondentsData).forEach(([index, data], i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * (tileSize + padding);
    const y = row * (tileSize + padding);
    
    let color = config.theme.accent;
    
    switch(category) {
      case 'generations':
        color = colors.generations[data.Q3_generation] || config.theme.accent;
        break;
      case 'provinces':
        color = colors.provinces[data.Q1_province] || config.theme.accent;
        break;
      case 'connection':
        color = colors.connection[data.Q5_identity_connection] || config.theme.accent;
        break;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, tileSize, tileSize);
  });
  
  updateLegend(category);
}

// Update the legend
function updateLegend(category) {
  console.log('Updating legend for:', category);
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
document.addEventListener('DOMContentLoaded', loadRespondentsData); 