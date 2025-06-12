import { colorPalette, generateCategoryColors } from './styles/colors.js';
import { Q5_CONNECTION_ORDER, Q3_GENERATION_ORDER } from './categoryRules.js';

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
    // Use the custom order for generations and connections
    const generations = Q3_GENERATION_ORDER;
    const provinces = [...new Set(Object.values(respondentsData).map(d => d.Q1_province))];
    const connections = Q5_CONNECTION_ORDER;
    
    console.log('Categories found:', {
      generations,
      provinces,
      connections
    });
    
    // Generate color mappings for each category
    config.colors = {
      generations: generateCategoryColors(generations, colorPalette.primary, Q3_GENERATION_ORDER),
      provinces: generateCategoryColors(provinces, colorPalette.secondary),
      connection: generateCategoryColors(connections, colorPalette.tertiary, Q5_CONNECTION_ORDER)
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

  // Add modal header with navigation and close icons
  const modalHeader = document.createElement('div');
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'flex-end';
  modalHeader.style.alignItems = 'center';
  modalHeader.style.gap = '12px';
  modalHeader.style.marginBottom = '10px';

  // Previous icon
  const prevIcon = document.createElement('div');
  prevIcon.innerHTML = '&lt;';
  prevIcon.style.fontSize = '28px';
  prevIcon.style.color = config.theme.text;
  prevIcon.style.cursor = 'pointer';
  prevIcon.style.width = '30px';
  prevIcon.style.height = '30px';
  prevIcon.style.display = 'flex';
  prevIcon.style.alignItems = 'center';
  prevIcon.style.justifyContent = 'center';
  prevIcon.style.borderRadius = '50%';
  prevIcon.style.transition = 'all 0.3s ease';
  prevIcon.style.userSelect = 'none';

  // Next icon
  const nextIcon = document.createElement('div');
  nextIcon.innerHTML = '&gt;';
  nextIcon.style.fontSize = '28px';
  nextIcon.style.color = config.theme.text;
  nextIcon.style.cursor = 'pointer';
  nextIcon.style.width = '30px';
  nextIcon.style.height = '30px';
  nextIcon.style.display = 'flex';
  nextIcon.style.alignItems = 'center';
  nextIcon.style.justifyContent = 'center';
  nextIcon.style.borderRadius = '50%';
  nextIcon.style.transition = 'all 0.3s ease';
  nextIcon.style.userSelect = 'none';

  // Add hover effect for icons
  function iconHover(icon) {
    icon.addEventListener('mouseover', () => {
      if (!icon.classList.contains('disabled')) {
        icon.style.backgroundColor = config.theme.muted;
        icon.style.transform = 'scale(1.1)';
      }
    });
    icon.addEventListener('mouseout', () => {
      icon.style.backgroundColor = 'transparent';
      icon.style.transform = 'scale(1)';
    });
  }
  iconHover(prevIcon);
  iconHover(nextIcon);

  // Add close icon
  const closeIcon = document.createElement('div');
  closeIcon.innerHTML = '×';
  closeIcon.style.fontSize = '28px';
  closeIcon.style.color = config.theme.text;
  closeIcon.style.cursor = 'pointer';
  closeIcon.style.width = '30px';
  closeIcon.style.height = '30px';
  closeIcon.style.display = 'flex';
  closeIcon.style.alignItems = 'center';
  closeIcon.style.justifyContent = 'center';
  closeIcon.style.borderRadius = '50%';
  closeIcon.style.transition = 'all 0.3s ease';
  closeIcon.style.userSelect = 'none';
  closeIcon.style.marginLeft = '8px';
  closeIcon.style.marginRight = '8px';
  closeIcon.style.zIndex = '2002';

  closeIcon.addEventListener('mouseover', () => {
    closeIcon.style.backgroundColor = config.theme.muted;
    closeIcon.style.transform = 'scale(1.1)';
  });
  closeIcon.addEventListener('mouseout', () => {
    closeIcon.style.backgroundColor = 'transparent';
    closeIcon.style.transform = 'scale(1)';
  });
  closeIcon.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modalHeader.appendChild(prevIcon);
  modalHeader.appendChild(nextIcon);
  modalHeader.appendChild(closeIcon);

  modalContent.appendChild(modalHeader);

  // Function to update icon states
  function updateIconStates(currentIndex) {
    // Previous
    if (currentIndex === 0) {
      prevIcon.classList.add('disabled');
      prevIcon.style.opacity = '0.4';
      prevIcon.style.cursor = 'not-allowed';
    } else {
      prevIcon.classList.remove('disabled');
      prevIcon.style.opacity = '1';
      prevIcon.style.cursor = 'pointer';
    }
    // Next
    if (currentIndex === config.totalRespondents - 1) {
      nextIcon.classList.add('disabled');
      nextIcon.style.opacity = '0.4';
      nextIcon.style.cursor = 'not-allowed';
    } else {
      nextIcon.classList.remove('disabled');
      nextIcon.style.opacity = '1';
      nextIcon.style.cursor = 'pointer';
    }
  }

  // Add navigation buttons container
  const navButtons = document.createElement('div');
  navButtons.style.display = 'flex';
  navButtons.style.gap = '20px';
  navButtons.style.justifyContent = 'center';
  navButtons.style.alignItems = 'center';
  navButtons.style.marginTop = '32px';
  navButtons.style.position = 'static';
  navButtons.style.background = 'none';
  navButtons.style.padding = '0';
  navButtons.style.borderRadius = '0';
  navButtons.style.boxShadow = 'none';
  navButtons.style.zIndex = 'auto';

  const prevButton = document.createElement('button');
  prevButton.innerHTML = '← Previous';
  prevButton.style.padding = '10px 20px';
  prevButton.style.backgroundColor = config.theme.accent;
  prevButton.style.color = config.theme.text;
  prevButton.style.border = 'none';
  prevButton.style.borderRadius = '5px';
  prevButton.style.cursor = 'pointer';
  prevButton.style.fontWeight = 'bold';
  prevButton.style.transition = 'all 0.3s ease';
  prevButton.style.minWidth = '120px';

  const nextButton = document.createElement('button');
  nextButton.innerHTML = 'Next →';
  nextButton.style.padding = '10px 20px';
  nextButton.style.backgroundColor = config.theme.accent;
  nextButton.style.color = config.theme.text;
  nextButton.style.border = 'none';
  nextButton.style.borderRadius = '5px';
  nextButton.style.cursor = 'pointer';
  nextButton.style.fontWeight = 'bold';
  nextButton.style.transition = 'all 0.3s ease';
  nextButton.style.minWidth = '120px';

  // Function to update button states
  function updateButtonStates(currentIndex) {
    // Disable previous button at first item
    if (currentIndex === 0) {
      prevButton.disabled = true;
      prevButton.style.backgroundColor = '#cccccc';
      prevButton.style.cursor = 'not-allowed';
      prevButton.style.opacity = '0.6';
    } else {
      prevButton.disabled = false;
      prevButton.style.backgroundColor = config.theme.accent;
      prevButton.style.cursor = 'pointer';
      prevButton.style.opacity = '1';
    }

    // Disable next button at last item
    if (currentIndex === config.totalRespondents - 1) {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = '#cccccc';
      nextButton.style.cursor = 'not-allowed';
      nextButton.style.opacity = '0.6';
    } else {
      nextButton.disabled = false;
      nextButton.style.backgroundColor = config.theme.accent;
      nextButton.style.cursor = 'pointer';
      nextButton.style.opacity = '1';
    }
  }

  // Add hover effects
  const buttonHoverStyle = {
    backgroundColor: config.theme.secondary,
    transform: 'translateY(-2px)'
  };

  prevButton.addEventListener('mouseover', () => {
    if (!prevButton.disabled) {
      Object.assign(prevButton.style, buttonHoverStyle);
    }
  });
  prevButton.addEventListener('mouseout', () => {
    if (!prevButton.disabled) {
      prevButton.style.backgroundColor = config.theme.accent;
      prevButton.style.transform = 'none';
    }
  });

  nextButton.addEventListener('mouseover', () => {
    if (!nextButton.disabled) {
      Object.assign(nextButton.style, buttonHoverStyle);
    }
  });
  nextButton.addEventListener('mouseout', () => {
    if (!nextButton.disabled) {
      nextButton.style.backgroundColor = config.theme.accent;
      nextButton.style.transform = 'none';
    }
  });

  navButtons.appendChild(prevButton);
  navButtons.appendChild(nextButton);
  modalContent.appendChild(navButtons);

  // Add modal to document body
  document.body.appendChild(modal);
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

  // Function to display respondent data
  function displayRespondentData(index) {
    const respondent = respondentsData[index];
    if (respondent) {
      // Remove previous modal body if any
      const oldBody = modalContent.querySelector('.modal-body');
      if (oldBody) oldBody.remove();
      // Create detailed content
      const modalBody = document.createElement('div');
      modalBody.className = 'modal-body';
      modalBody.style.marginTop = '20px';
      modalBody.style.marginBottom = '60px'; // Add space for navigation buttons
      
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
    }
    // Update icon states after displaying data
    updateIconStates(index);
  }

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
      displayRespondentData(index);
      modal.style.display = 'flex';
      
      // Store current index
      modal.dataset.currentIndex = index;
    }
  });

  // Navigation icon handlers
  prevIcon.addEventListener('click', () => {
    if (prevIcon.classList.contains('disabled')) return;
    let currentIndex = parseInt(modal.dataset.currentIndex);
    if (currentIndex > 0) {
      currentIndex--;
      modal.dataset.currentIndex = currentIndex;
      displayRespondentData(currentIndex);
    }
  });
  nextIcon.addEventListener('click', () => {
    if (nextIcon.classList.contains('disabled')) return;
    let currentIndex = parseInt(modal.dataset.currentIndex);
    if (currentIndex < config.totalRespondents - 1) {
      currentIndex++;
      modal.dataset.currentIndex = currentIndex;
      displayRespondentData(currentIndex);
    }
  });
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'ArrowLeft' && !prevIcon.classList.contains('disabled')) {
        prevIcon.click();
      } else if (e.key === 'ArrowRight' && !nextIcon.classList.contains('disabled')) {
        nextIcon.click();
      }
    }
  });

  // Close modal when clicking the close button or outside the modal
  closeIcon.addEventListener('click', () => {
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
  
  // Helper to normalize keys
  function normalize(str) {
    return str ? str
                .trim()
                .replace(/[\s\u2010-\u2015\u2212\uFE58\uFE63\uFF0D-]+/g, '') // remove all spaces and dash variants
                .normalize('NFKC') : '';
  }

  Object.entries(respondentsData).forEach(([index, data], i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = col * (tileSize + padding);
    const y = row * (tileSize + padding);
    
    let color = config.theme.accent;
    
    switch(category) {
      case 'generations': {
        // Find the matching key in colors.generations using normalization
        const genKey = Object.keys(colors.generations).find(
          k => normalize(k) === normalize(data.Q3_generation)
        );
        color = colors.generations[genKey] || config.theme.accent;
        break;
      }
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

  let order;
  if (category === 'connection') {
    order = Q5_CONNECTION_ORDER;
  } else if (category === 'generations') {
    order = Q3_GENERATION_ORDER;
  } else {
    order = Object.keys(colors);
  }

  legend.innerHTML = order
    .map(group => `
      <div class="legend-item">
        <span class="color-box" style="background-color: ${colors[group]}"></span>
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