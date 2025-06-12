class QuoteScroller {
  constructor(containerId, options = {}) {
    this.options = {
      quoteHeight: options.quoteHeight || 50,
      scrollSpeed: options.scrollSpeed || 1000,
      csvPath: options.csvPath || "tagline_exploded_filtered_topics.csv",
      fontFamily: options.fontFamily || "'Merriweather', Georgia, serif",
      ...options
    };

    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.setupStyles();
    this.initialize();
  }

  setupStyles() {
    // Add Google Fonts
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Merriweather"]')) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'preconnect';
      fontLink.href = 'https://fonts.googleapis.com';
      document.head.appendChild(fontLink);

      const gstatic = document.createElement('link');
      gstatic.rel = 'preconnect';
      gstatic.href = 'https://fonts.gstatic.com';
      gstatic.crossOrigin = 'true';
      document.head.appendChild(gstatic);

      const fonts = document.createElement('link');
      fonts.rel = 'stylesheet';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Merriweather:ital@0;1&display=swap';
      document.head.appendChild(fonts);
    }

    // Add component styles
    const style = document.createElement('style');
    style.textContent = `
      .quote-scroller-container {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: #111;
        color: #fff;
      }

      .quote-scroller-filter-container {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 8px;
        backdrop-filter: blur(5px);
      }

      .quote-scroller-filter-btn {
        padding: 8px 16px;
        border: 2px solid #fff;
        background: transparent;
        color: #fff;
        cursor: pointer;
        font-family: ${this.options.fontFamily};
        border-radius: 4px;
        transition: all 0.3s ease;
        font-size: 0.9em;
        text-transform: capitalize;
      }

      .quote-scroller-filter-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .quote-scroller-filter-btn.active {
        background: #fff;
        color: #111;
      }

      .quote-scroller-filter-btn.all { border-color: #fff; }
      .quote-scroller-filter-btn.positive { border-color: rgb(0, 255, 0); }
      .quote-scroller-filter-btn.negative { border-color: rgb(255, 0, 0); }
      .quote-scroller-filter-btn.neutral { border-color: rgb(255, 140, 0); }

      .quote-scroller-filter-btn.active.all { background: #fff; }
      .quote-scroller-filter-btn.active.positive { background: rgb(0, 255, 0); }
      .quote-scroller-filter-btn.active.negative { background: rgb(255, 0, 0); }
      .quote-scroller-filter-btn.active.neutral { background: rgb(255, 140, 0); }

      .quote-scroller-content {
        position: absolute;
        width: 100%;
        transition: transform 0.5s linear;
      }

      .quote-scroller-quote {
        width: 100%;
        text-align: center;
        font-size: 1.7em;
        padding: 10px;
        box-sizing: border-box;
        transition: color 0.5s ease;
        height: ${this.options.quoteHeight}px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.3;
        line-height: 1.2;
        font-family: ${this.options.fontFamily};
        font-style: italic;
        letter-spacing: 0.02em;
      }

      .quote-scroller-quote::before {
        content: '"';
        margin-right: 0.2em;
        font-size: 1.2em;
        font-style: normal;
      }

      .quote-scroller-quote::after {
        content: '"';
        margin-left: 0.2em;
        font-size: 1.2em;
        font-style: normal;
      }

      .quote-scroller-quote.positive { color: rgba(0, 255, 0, 0.3); }
      .quote-scroller-quote.negative { color: rgba(255, 0, 0, 0.3); }
      .quote-scroller-quote.neutral { color: rgba(255, 140, 0, 0.3); }

      .quote-scroller-quote.active.positive {
        color: rgb(0, 255, 0);
        text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
      }

      .quote-scroller-quote.active.negative {
        color: rgb(255, 0, 0);
        text-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
      }

      .quote-scroller-quote.active.neutral {
        color: rgb(255, 140, 0);
        text-shadow: 0 0 10px rgba(255, 140, 0, 0.3);
      }

      .quote-scroller-container::before,
      .quote-scroller-container::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 100px;
        pointer-events: none;
        z-index: 2;
      }

      .quote-scroller-container::before {
        top: 0;
        background: linear-gradient(to bottom, rgba(17, 17, 17, 1) 0%, rgba(17, 17, 17, 0) 100%);
      }

      .quote-scroller-container::after {
        bottom: 0;
        background: linear-gradient(to top, rgba(17, 17, 17, 1) 0%, rgba(17, 17, 17, 0) 100%);
      }

      .quote-scroller-highlight-zone {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: ${this.options.quoteHeight}px;
        transform: translateY(-50%);
        pointer-events: none;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  initialize() {
    // Create container structure
    this.container.className = 'quote-scroller-container';
    this.container.innerHTML = `
      <div class="quote-scroller-filter-container">
        <button class="quote-scroller-filter-btn all active" data-filter="all">All</button>
        <button class="quote-scroller-filter-btn positive" data-filter="POSITIVE">Positive</button>
        <button class="quote-scroller-filter-btn negative" data-filter="NEGATIVE">Negative</button>
        <button class="quote-scroller-filter-btn neutral" data-filter="NEUTRAL">Neutral</button>
      </div>
      <div class="quote-scroller-highlight-zone"></div>
      <div class="quote-scroller-content"></div>
    `;

    // Initialize variables
    this.scrollContent = this.container.querySelector('.quote-scroller-content');
    this.currentTranslateY = 0;
    this.activeQuoteIndex = -1;
    this.currentFilter = 'all';
    this.allTaglines = [];
    this.currentIndex = 0;
    this.animationTimer = null;

    // Add filter functionality
    this.container.querySelectorAll('.quote-scroller-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        this.container.querySelector('.quote-scroller-filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.resetDisplay();
      });
    });

    // Start highlight updates
    setInterval(() => this.updateHighlight(), 50);

    // Load CSV data
    this.loadCSV();
  }

  updateHighlight() {
    const quotes = this.container.querySelectorAll('.quote-scroller-quote');
    const highlightZone = this.container.querySelector('.quote-scroller-highlight-zone');
    const highlightRect = highlightZone.getBoundingClientRect();
    const centerY = highlightRect.top + highlightRect.height / 2;

    quotes.forEach((quote, index) => {
      const quoteRect = quote.getBoundingClientRect();
      const isActive = (
        quoteRect.top <= centerY &&
        quoteRect.bottom >= centerY
      );
      quote.classList.toggle('active', isActive);
      if (isActive) {
        this.activeQuoteIndex = index;
      }
    });
  }

  getSentimentClass(sentiment) {
    switch(sentiment) {
      case 'POSITIVE': return 'positive';
      case 'NEGATIVE': return 'negative';
      default: return 'neutral';
    }
  }

  getFilteredTaglines() {
    if (this.currentFilter === 'all') {
      return this.allTaglines;
    }
    return this.allTaglines.filter(tagline => tagline.sentiment === this.currentFilter);
  }

  resetDisplay() {
    this.scrollContent.innerHTML = '';
    this.currentTranslateY = 0;
    this.currentIndex = 0;
    this.scrollContent.style.transform = `translateY(${this.currentTranslateY}px)`;
    
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    
    this.addNextQuote();
  }

  addNextQuote() {
    const filteredTaglines = this.getFilteredTaglines();
    
    if (filteredTaglines.length === 0) {
      return;
    }

    if (this.currentIndex >= filteredTaglines.length) {
      this.currentIndex = 0;
    }

    const taglineData = filteredTaglines[this.currentIndex];
    
    const quote = document.createElement('div');
    quote.className = `quote-scroller-quote ${this.getSentimentClass(taglineData.sentiment)}`;
    quote.textContent = taglineData.text.trim().replace(/^["']|["']$/g, '');
    this.scrollContent.appendChild(quote);
    
    this.currentTranslateY = (window.innerHeight / 2) - ((this.scrollContent.children.length * this.options.quoteHeight) - (this.options.quoteHeight / 2));
    this.scrollContent.style.transform = `translateY(${this.currentTranslateY}px)`;
    
    this.updateHighlight();
    
    this.currentIndex++;
    
    this.animationTimer = setTimeout(() => this.addNextQuote(), this.options.scrollSpeed);
  }

  loadCSV() {
    Papa.parse(this.options.csvPath, {
      download: true,
      header: true,
      complete: (results) => {
        const taglineData = new Map();
        
        results.data.forEach(row => {
          if (row.Q11_tagline_text_combined) {
            taglineData.set(row.participant_id, {
              text: row.Q11_tagline_text_combined,
              sentiment: row.main_sentiment_tagline
            });
          }
        });
        
        this.allTaglines = Array.from(taglineData.values())
          .filter(data => data.text && data.text.trim());
        
        this.addNextQuote();
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        this.scrollContent.innerHTML = '<div class="quote-scroller-quote neutral">Error loading quotes</div>';
      }
    });
  }
} 