// App state
let state = {
    notes: [],
    filteredNotes: [],
    selectedNote: null,
    activeCategory: 'all',
    searchQuery: '',
    postedTweets: []
};

// SVG Icons for reuse
const ICONS = {
    xLogo: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    shareArrow: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>`,
    comment: `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    retweet: `<svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
    like: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
};

// Templates for pre-filled tweets
const TWEET_TEMPLATES = {
    simple: (note) => {
        const title = `BigQuery [${note.date}] ${note.type}: `;
        const footer = `\n\nRead more: ${note.link} #BigQuery #GoogleCloud`;
        const maxLen = 280 - title.length - footer.length;
        
        let desc = note.text;
        if (desc.length > maxLen) {
            desc = desc.substring(0, maxLen - 3) + '...';
        }
        
        return `${title}${desc}${footer}`;
    },
    bullet: (note) => {
        const header = `📢 New BigQuery ${note.type}!\n\n`;
        const footer = `\n\nDetails: ${note.link} #GoogleCloud #Data`;
        const maxLen = 280 - header.length - footer.length;
        
        let desc = note.text;
        if (desc.length > maxLen) {
            desc = desc.substring(0, maxLen - 3) + '...';
        }
        
        return `${header}${desc}${footer}`;
    },
    technical: (note) => {
        const header = `💡 BQ Update (${note.date}):\n`;
        const footer = `\n\nRef: ${note.link}`;
        const maxLen = 280 - header.length - footer.length;
        
        let desc = note.text;
        if (desc.length > maxLen) {
            desc = desc.substring(0, maxLen - 3) + '...';
        }
        
        return `${header}${desc}${footer}`;
    }
};

// Document Elements
const elements = {
    refreshBtn: document.getElementById('refresh-btn'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    searchInput: document.getElementById('search-input'),
    clearSearch: document.getElementById('clear-search'),
    lastUpdated: document.getElementById('last-updated'),
    releaseFeedList: document.getElementById('release-feed-list'),
    resultsCount: document.getElementById('results-count'),
    activeFilters: document.getElementById('active-filters'),
    filterPillsContainer: document.getElementById('filter-pills-container'),
    clearAllFilters: document.getElementById('clear-all-filters'),
    
    // Sidebar Stats & Categories
    statTotal: document.getElementById('stat-total'),
    statFeatures: document.getElementById('stat-features'),
    statIssues: document.getElementById('stat-issues'),
    badgeAll: document.getElementById('badge-all'),
    badgeFeature: document.getElementById('badge-feature'),
    badgeChanged: document.getElementById('badge-changed'),
    badgeResolved: document.getElementById('badge-resolved'),
    badgeIssue: document.getElementById('badge-issue'),
    badgeDeprecation: document.getElementById('badge-deprecation'),
    categoryButtons: document.querySelectorAll('.filter-btn'),
    statCards: document.querySelectorAll('.stat-card'),
    
    // Mock X feed elements
    xTimeline: document.getElementById('x-timeline-posts'),
    xEmptyState: document.getElementById('x-empty-state'),
    
    // Modal elements
    tweetModal: document.getElementById('tweet-modal'),
    modalRefType: document.getElementById('modal-ref-type'),
    modalRefDate: document.getElementById('modal-ref-date'),
    modalRefSummary: document.getElementById('modal-ref-summary'),
    tweetTextarea: document.getElementById('tweet-textarea'),
    charProgress: document.getElementById('char-progress'),
    charCountText: document.getElementById('char-count-text'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    postMockBtn: document.getElementById('post-mock-btn'),
    tweetRealBtn: document.getElementById('tweet-real-btn'),
    suggestPills: document.querySelectorAll('.suggest-pill'),
    
    // Toast Container
    toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadLocalMockTweets();
    fetchNotes(false);
    setupEventListeners();
});

// Setup Events
function setupEventListeners() {
    // Refresh button
    elements.refreshBtn.addEventListener('click', () => fetchNotes(true));
    
    // Export CSV button
    elements.exportCsvBtn.addEventListener('click', exportCSV);
    
    // Theme Toggle button
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Category filters
    elements.categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-type');
            setActiveCategory(category);
        });
    });

    // Stat cards click handlers (act as quick category filters)
    elements.statCards.forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-filter').toLowerCase();
            setActiveCategory(filter === 'all' ? 'all' : filter);
        });
    });

    // Search bar
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        elements.clearSearch.style.display = state.searchQuery ? 'block' : 'none';
        applyFilters();
    });
    
    elements.clearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        elements.clearSearch.style.display = 'none';
        applyFilters();
    });

    // Clear all filters bar
    elements.clearAllFilters.addEventListener('click', resetAllFilters);
    
    // Modal Actions
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.modalCancelBtn.addEventListener('click', closeModal);
    elements.tweetTextarea.addEventListener('input', updateCharCount);
    
    // Suggestion pills inside modal
    elements.suggestPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const templateType = pill.getAttribute('data-template');
            if (state.selectedNote && TWEET_TEMPLATES[templateType]) {
                elements.tweetTextarea.value = TWEET_TEMPLATES[templateType](state.selectedNote);
                updateCharCount();
                
                // Highlight active pill
                elements.suggestPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            }
        });
    });

    // Simulate Post (mock twitter feed)
    elements.postMockBtn.addEventListener('click', postToMockTimeline);
    
    // Post to X (real twitter redirect)
    elements.tweetRealBtn.addEventListener('click', () => {
        const text = elements.tweetTextarea.value;
        if (text.length === 0 || text.length > 280) return;
        
        // Open Twitter Web Intent
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        
        // Also copy it to the local timeline simulator for continuity
        postToMockTimeline(false); // pass false to avoid double success toasts
        
        showToast('Redirecting to X...', 'success');
        closeModal();
    });
}

// Fetch Notes from Backend
function fetchNotes(forceRefresh = false) {
    // Show loading skeleton
    renderSkeletonLoader();
    
    // Set button state
    elements.refreshBtn.disabled = true;
    const spinner = elements.refreshBtn.querySelector('.refresh-spinner-icon');
    spinner.classList.add('spinning');
    
    const url = `/api/notes${forceRefresh ? '?refresh=true' : ''}`;
    
    fetch(url)
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                state.notes = res.data;
                
                // Set last updated string
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                elements.lastUpdated.textContent = `Synced: ${timeStr}`;
                
                // Calculate statistics and set counters
                updateStatistics();
                
                // Render list
                applyFilters();
                
                if (forceRefresh) {
                    showToast('Release notes synced successfully!', 'success');
                }
            } else {
                showToast(`Failed to parse feed: ${res.error}`, 'error');
                renderErrorState(res.error);
            }
        })
        .catch(err => {
            console.error(err);
            showToast('Network error while syncing feed.', 'error');
            renderErrorState(err.message || 'Unable to connect to Flask server.');
        })
        .finally(() => {
            elements.refreshBtn.disabled = false;
            spinner.classList.remove('spinning');
        });
}

// Update counters in sidebar
function updateStatistics() {
    const total = state.notes.length;
    const features = state.notes.filter(n => n.type.toLowerCase() === 'feature').length;
    const changed = state.notes.filter(n => n.type.toLowerCase() === 'changed').length;
    const resolved = state.notes.filter(n => n.type.toLowerCase() === 'resolved').length;
    const issues = state.notes.filter(n => n.type.toLowerCase() === 'issue').length;
    const deprecations = state.notes.filter(n => n.type.toLowerCase() === 'deprecation').length;

    elements.statTotal.textContent = total;
    elements.statFeatures.textContent = features;
    elements.statIssues.textContent = issues;
    
    elements.badgeAll.textContent = total;
    elements.badgeFeature.textContent = features;
    elements.badgeChanged.textContent = changed;
    elements.badgeResolved.textContent = resolved;
    elements.badgeIssue.textContent = issues;
    elements.badgeDeprecation.textContent = deprecations;
}

// Category filter setting
function setActiveCategory(category) {
    state.activeCategory = category;
    
    // Update active class on buttons
    elements.categoryButtons.forEach(btn => {
        const type = btn.getAttribute('data-type');
        if (type === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    applyFilters();
}

// Filter notes based on active Category and Search Query
function applyFilters() {
    let result = [...state.notes];
    
    // 1. Filter by category
    if (state.activeCategory !== 'all') {
        result = result.filter(note => note.type.toLowerCase() === state.activeCategory);
    }
    
    // 2. Filter by search query
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        result = result.filter(note => 
            note.text.toLowerCase().includes(query) || 
            note.date.toLowerCase().includes(query) ||
            note.type.toLowerCase().includes(query)
        );
    }
    
    state.filteredNotes = result;
    renderFeedList();
    renderFilterBar();
}

// Render the "Active Filters" pill bar
function renderFilterBar() {
    elements.filterPillsContainer.innerHTML = '';
    const hasCategory = state.activeCategory !== 'all';
    const hasSearch = state.searchQuery.length > 0;
    
    if (!hasCategory && !hasSearch) {
        elements.activeFilters.style.display = 'none';
        return;
    }
    
    elements.activeFilters.style.display = 'flex';
    
    if (hasCategory) {
        const pill = document.createElement('div');
        pill.className = `filter-pill category`;
        pill.style.setProperty('--pill-bg', `var(--bg-${state.activeCategory})`);
        pill.style.setProperty('--pill-border', `var(--border-${state.activeCategory})`);
        pill.style.setProperty('--pill-color', `var(--color-${state.activeCategory})`);
        pill.innerHTML = `
            Category: ${state.activeCategory.charAt(0).toUpperCase() + state.activeCategory.slice(1)}
            <button class="filter-pill-remove" onclick="setActiveCategory('all')">&times;</button>
        `;
        elements.filterPillsContainer.appendChild(pill);
    }
    
    if (hasSearch) {
        const pill = document.createElement('div');
        pill.className = 'filter-pill search';
        pill.innerHTML = `
            Keyword: "${state.searchQuery}"
            <button class="filter-pill-remove" onclick="clearSearchFilter()">&times;</button>
        `;
        elements.filterPillsContainer.appendChild(pill);
    }
}

// Clear search keyword only
window.clearSearchFilter = function() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearch.style.display = 'none';
    applyFilters();
};

// Reset all filtering parameters
function resetAllFilters() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearch.style.display = 'none';
    setActiveCategory('all');
}

// Render feed list onto page
function renderFeedList() {
    elements.releaseFeedList.innerHTML = '';
    
    const count = state.filteredNotes.length;
    elements.resultsCount.textContent = `Showing ${count} update${count === 1 ? '' : 's'}`;
    
    if (count === 0) {
        renderEmptyState();
        return;
    }
    
    state.filteredNotes.forEach(note => {
        const card = document.createElement('article');
        card.className = 'release-card';
        card.setAttribute('data-id', note.id);
        
        const typeClass = note.type.toLowerCase();
        
        card.innerHTML = `
            <div class="card-header">
                <span class="badge-type ${typeClass}">${note.type}</span>
                <span class="card-date">${note.date}</span>
            </div>
            <div class="card-content">
                ${note.html}
            </div>
            <div class="card-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn-card-action btn-copy-action" title="Copy raw text to clipboard">
                    ${ICONS.copy}
                    <span>Copy</span>
                </button>
                <button class="btn-card-action btn-tweet-action">
                    ${ICONS.xLogo}
                    <span>Tweet update</span>
                </button>
            </div>
        `;
        
        // Copy click handler
        const copyBtn = card.querySelector('.btn-copy-action');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(note.text)
                .then(() => {
                    showToast('Copied to clipboard!', 'success');
                    const btnText = copyBtn.querySelector('span');
                    const originalText = btnText.textContent;
                    btnText.textContent = 'Copied!';
                    copyBtn.style.borderColor = 'var(--color-feature)';
                    copyBtn.style.color = 'var(--color-feature)';
                    setTimeout(() => {
                        btnText.textContent = originalText;
                        copyBtn.style.borderColor = '';
                        copyBtn.style.color = '';
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    showToast('Failed to copy to clipboard', 'error');
                });
        });
        
        // Tweet click handler
        card.querySelector('.btn-tweet-action').addEventListener('click', () => openTweetModal(note));
        
        elements.releaseFeedList.appendChild(card);
    });
}

// Empty state renderer
function renderEmptyState() {
    elements.releaseFeedList.innerHTML = `
        <div class="feed-empty-state">
            <div class="empty-icon-wrapper">
                <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
            <h3>No results found</h3>
            <p>We couldn't find any release notes matching your filters. Try search keywords or different categories.</p>
            <button class="btn btn-secondary" onclick="resetAllFilters()">Reset Filters</button>
        </div>
    `;
}

// Error state renderer
function renderErrorState(msg) {
    elements.releaseFeedList.innerHTML = `
        <div class="feed-empty-state" style="border-color: var(--border-deprecation)">
            <div class="empty-icon-wrapper" style="color: var(--color-deprecation); background-color: var(--bg-deprecation)">
                <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <h3>Sync Failed</h3>
            <p>There was an error connecting to the Google BigQuery release notes RSS Feed: ${msg}</p>
            <button class="btn btn-primary" onclick="fetchNotes(true)">
                <span>Retry Connection</span>
            </button>
        </div>
    `;
}

// Skeleton loader renderer
function renderSkeletonLoader() {
    elements.releaseFeedList.innerHTML = Array(3).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-header">
                <div class="skeleton-badge"></div>
                <div class="skeleton-date"></div>
            </div>
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-footer"></div>
        </div>
    `).join('');
}

// --- Tweet Composer Modal Operations ---

function openTweetModal(note) {
    state.selectedNote = note;
    
    // Populate reference card in modal
    elements.modalRefType.textContent = note.type;
    elements.modalRefType.className = `ref-badge ${note.type.toLowerCase()}`;
    elements.modalRefDate.textContent = note.date;
    elements.modalRefSummary.textContent = note.text;
    
    // Set default composer contents (Preset 1: bullet format)
    elements.tweetTextarea.value = TWEET_TEMPLATES.bullet(note);
    
    // Reset preset active styles
    elements.suggestPills.forEach(p => p.classList.remove('active'));
    elements.suggestPills[0].classList.add('active'); // set bullet as active
    
    // Show modal
    elements.tweetModal.style.display = 'flex';
    elements.tweetTextarea.focus();
    
    updateCharCount();
}

function closeModal() {
    elements.tweetModal.style.display = 'none';
    state.selectedNote = null;
}

function updateCharCount() {
    const text = elements.tweetTextarea.value;
    const len = text.length;
    const remaining = 280 - len;
    
    elements.charCountText.textContent = remaining;
    
    // Character progress circular indicator
    const progressRing = elements.charProgress;
    // Radial path has circumference ~ 100
    // Set progress from 0 to 100
    const pct = Math.min(100, Math.max(0, (len / 280) * 100));
    progressRing.style.strokeDasharray = `${pct}, 100`;
    
    // Visual warnings based on limits
    if (remaining < 0) {
        progressRing.className.baseVal = "radial-bar danger";
        elements.charCountText.classList.add('danger');
        elements.postMockBtn.disabled = true;
        elements.tweetRealBtn.disabled = true;
    } else if (remaining <= 20) {
        progressRing.className.baseVal = "radial-bar warning";
        elements.charCountText.classList.remove('danger');
        elements.postMockBtn.disabled = false;
        elements.tweetRealBtn.disabled = false;
    } else {
        progressRing.className.baseVal = "radial-bar";
        elements.charCountText.classList.remove('danger');
        elements.postMockBtn.disabled = false;
        elements.tweetRealBtn.disabled = false;
    }
}

// --- Live X Simulator Operations ---

// Load mock tweets from local storage
function loadLocalMockTweets() {
    const saved = localStorage.getItem('bq_navigator_tweets');
    if (saved) {
        try {
            state.postedTweets = jsonParseSafe(saved, []);
            renderMockTimeline();
        } catch (e) {
            console.error('Error loading mock tweets', e);
        }
    }
}

// Safe parsing helper
function jsonParseSafe(str, fallback) {
    try {
        return JSON.parse(str) || fallback;
    } catch (e) {
        return fallback;
    }
}

// Save mock tweets to local storage
function saveLocalMockTweets() {
    localStorage.setItem('bq_navigator_tweets', JSON.stringify(state.postedTweets));
}

// Post a tweet locally in the mock X panel
function postToMockTimeline(triggerToast = true) {
    const text = elements.tweetTextarea.value;
    if (text.length === 0 || text.length > 280) return;
    
    const newPost = {
        id: 'mock_post_' + Date.now(),
        text: text,
        timestamp: 'Just now',
        likes: 0,
        retweets: 0,
        liked: false,
        retweeted: false,
        date: new Date().toISOString()
    };
    
    // Add to top of timeline
    state.postedTweets.unshift(newPost);
    saveLocalMockTweets();
    
    renderMockTimeline();
    
    if (triggerToast) {
        showToast('Successfully posted to Mock X Feed!', 'success');
        closeModal();
    }
}

// Render the Mock X Timeline
function renderMockTimeline() {
    const posts = state.postedTweets;
    
    if (posts.length === 0) {
        elements.xEmptyState.style.display = 'flex';
        // Clear children except empty state
        const children = Array.from(elements.xTimeline.children);
        children.forEach(child => {
            if (child.id !== 'x-empty-state') {
                child.remove();
            }
        });
        return;
    }
    
    elements.xEmptyState.style.display = 'none';
    
    // Clear and re-render everything
    // Filter out previous mock posts from UI to avoid duplicates
    const children = Array.from(elements.xTimeline.children);
    children.forEach(child => {
        if (child.id !== 'x-empty-state') {
            child.remove();
        }
    });

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'x-post';
        postCard.setAttribute('data-post-id', post.id);
        
        // Format timestamp relative to now
        const relativeTime = formatRelativeTime(post.date);
        
        // Highlight links and hashtags in text
        const formattedText = formatTweetText(post.text);
        
        postCard.innerHTML = `
            <div class="x-avatar">BQ</div>
            <div class="x-post-content">
                <div class="x-post-meta">
                    <span class="x-author-name">BQ Navigator</span>
                    <span class="x-author-handle">@BigQueryNav</span>
                    <span class="x-dot-sep">·</span>
                    <span class="x-timestamp">${relativeTime}</span>
                </div>
                <div class="x-post-text">${formattedText}</div>
                <div class="x-post-actions">
                    <button class="x-post-act-btn btn-comment">
                        ${ICONS.comment}
                        <span>0</span>
                    </button>
                    <button class="x-post-act-btn btn-retweet ${post.retweeted ? 'active' : ''}">
                        ${ICONS.retweet}
                        <span>${post.retweets}</span>
                    </button>
                    <button class="x-post-act-btn btn-like ${post.liked ? 'active' : ''}">
                        ${ICONS.like}
                        <span>${post.likes}</span>
                    </button>
                </div>
            </div>
        `;
        
        // Actions bindings
        const likeBtn = postCard.querySelector('.btn-like');
        const rtBtn = postCard.querySelector('.btn-retweet');
        
        likeBtn.addEventListener('click', () => toggleLikeMockPost(post.id));
        rtBtn.addEventListener('click', () => toggleRetweetMockPost(post.id));
        
        elements.xTimeline.appendChild(postCard);
    });
}

function toggleLikeMockPost(postId) {
    const post = state.postedTweets.find(p => p.id === postId);
    if (!post) return;
    
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    
    saveLocalMockTweets();
    renderMockTimeline();
}

function toggleRetweetMockPost(postId) {
    const post = state.postedTweets.find(p => p.id === postId);
    if (!post) return;
    
    post.retweeted = !post.retweeted;
    post.retweets += post.retweeted ? 1 : -1;
    
    saveLocalMockTweets();
    renderMockTimeline();
}

// Helpers for Mock Timeline
function formatTweetText(text) {
    // Regex to convert HTTP/S links into anchor tags
    let formatted = text.replace(/(https?:\/\/[^\s]+)/g, '<a class="x-post-link" href="$1" target="_blank">$1</a>');
    // Regex to convert hashtags into links
    formatted = formatted.replace(/(#[a-zA-Z0-9_]+)/g, '<a class="x-post-link" href="#">$1</a>');
    // Regex to convert handles (@) into links
    formatted = formatted.replace(/(@[a-zA-Z0-9_]+)/g, '<a class="x-post-link" href="#">$1</a>');
    return formatted;
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
}

// --- Toast System ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast`;
    
    const icon = type === 'success' 
        ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        
    toast.innerHTML = `
        <div class="toast-icon ${type}">${icon}</div>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s reverse cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- CSV Export System ---
function exportCSV() {
    if (state.filteredNotes.length === 0) {
        showToast('No notes to export!', 'error');
        return;
    }
    
    // Escape CSV values helper
    const escapeCSV = (str) => {
        if (str === null || str === undefined) return '""';
        return '"' + str.toString().replace(/"/g, '""') + '"';
    };
    
    // CSV Header and rows
    const headers = ['ID', 'Date', 'Type', 'Link', 'Text'];
    const rows = state.filteredNotes.map(note => [
        note.id,
        note.date,
        note.type,
        note.link,
        note.text
    ]);
    
    // Build content string
    const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n');
    
    // Create Blob and trigger download
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        // Generate nice filename using date
        const dateStr = new Date().toISOString().slice(0, 10);
        const categorySuffix = state.activeCategory !== 'all' ? `_${state.activeCategory}` : '';
        const searchSuffix = state.searchQuery ? '_filtered' : '';
        
        link.setAttribute("href", url);
        link.setAttribute("download", `bigquery_releases_${dateStr}${categorySuffix}${searchSuffix}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Exported ${state.filteredNotes.length} updates to CSV!`, 'success');
    } catch (err) {
        console.error('CSV Export failed:', err);
        showToast('Export failed', 'error');
    }
}

// --- Theme Toggle System ---
function initTheme() {
    const savedTheme = localStorage.getItem('bq_navigator_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('.theme-icon-sun').style.display = 'block';
        document.querySelector('.theme-icon-moon').style.display = 'none';
    } else {
        document.body.classList.remove('light-theme');
        document.querySelector('.theme-icon-sun').style.display = 'none';
        document.querySelector('.theme-icon-moon').style.display = 'block';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('bq_navigator_theme', isLight ? 'light' : 'dark');
    
    const sunIcon = document.querySelector('.theme-icon-sun');
    const moonIcon = document.querySelector('.theme-icon-moon');
    
    if (isLight) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        showToast('Modo Claro ativado', 'success');
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        showToast('Modo Escuro ativado', 'success');
    }
}
