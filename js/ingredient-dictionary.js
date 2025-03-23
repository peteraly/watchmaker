class IngredientDictionary {
    constructor(options = {}) {
        this.testing = options.testing || false;
        this.ingredients = options.ingredients || [];
        this.categories = options.categories || [];
        this.activeFilters = new Set();
        this.searchTerm = '';
        this.filterCache = {};
        
        // DOM Elements
        if (!this.testing) {
            this.searchInput = document.getElementById('ingredient-search');
            this.categoryFilters = document.getElementById('category-filters');
            this.ingredientsGrid = document.getElementById('ingredients-grid');
            this.ingredientDetail = document.getElementById('ingredient-detail');
            this.closeDetailBtn = document.getElementById('close-ingredient-detail');
            
            // Tab elements
            this.tabButtons = document.querySelectorAll('.dictionary-tab-btn');
            this.tabContents = document.querySelectorAll('.dictionary-tab-content');
            this.currentTab = 'ingredients';
            
            // Add education button
            this.educationBtn = document.createElement('button');
            this.educationBtn.className = 'education-btn';
            this.educationBtn.textContent = 'Learn About Combinations';
            this.educationBtn.addEventListener('click', () => this.showCombinationGuide());
            
            // Add skin concerns guide button
            this.concernsBtn = document.createElement('button');
            this.concernsBtn.className = 'education-btn concerns-btn';
            this.concernsBtn.textContent = 'Skin Concerns Guide';
            this.concernsBtn.addEventListener('click', () => this.showSkinConcernsGuide());
            
            // Add education modal
            this.educationModal = document.createElement('div');
            this.educationModal.className = 'education-modal hidden';
            document.body.appendChild(this.educationModal);
            
            this.initialize();
        }
    }
    
    async initialize() {
        try {
            // Load ingredient data
            const response = await fetch('data/ingredients.json');
            const data = await response.json();
            
            this.ingredients = data.ingredients;
            this.categories = data.categories;
            
            // Setup UI
            this.setupEventListeners();
            this.renderCategoryFilters();
            this.renderIngredients();
            
            // Initialize tabs
            this.setupTabs();
            this.populateTabContent();
            
            // Add buttons after search
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'education-buttons';
            buttonContainer.appendChild(this.educationBtn);
            buttonContainer.appendChild(this.concernsBtn);
            this.searchInput.parentNode.appendChild(buttonContainer);
            
        } catch (error) {
            console.error('Failed to initialize ingredient dictionary:', error);
            this.handleError(error);
        }
    }
    
    setupEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', () => {
            this.searchTerm = this.searchInput.value.toLowerCase();
            this.renderIngredients();
        });
        
        // Close detail view
        this.closeDetailBtn.addEventListener('click', () => {
            this.closeIngredientDetail();
        });
        
        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeIngredientDetail();
            }
        });
    }
    
    renderCategoryFilters() {
        this.categoryFilters.innerHTML = this.categories.map(category => `
            <button class="filter-button" data-category="${category.id}">
                ${category.name}
            </button>
        `).join('');
        
        // Add event listeners to filter buttons
        this.categoryFilters.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                if (this.activeFilters.has(category)) {
                    this.activeFilters.delete(category);
                    button.classList.remove('active');
                } else {
                    this.activeFilters.add(category);
                    button.classList.add('active');
                }
                this.renderIngredients();
            });
        });
    }
    
    renderIngredients() {
        const filteredIngredients = this.filterIngredients();
        
        this.ingredientsGrid.innerHTML = filteredIngredients.map(ingredient => `
            <div class="ingredient-card" data-ingredient-id="${ingredient.id}">
                <h3>${ingredient.name}</h3>
                <div class="categories">
                    ${ingredient.categories.map(catId => {
                        const category = this.categories.find(c => c.id === catId);
                        return `<span class="category-tag">${category.name}</span>`;
                    }).join('')}
                </div>
                <p>${ingredient.description}</p>
            </div>
        `).join('');
        
        // Add click listeners to cards
        this.ingredientsGrid.querySelectorAll('.ingredient-card').forEach(card => {
            card.addEventListener('click', () => {
                const ingredientId = card.dataset.ingredientId;
                this.showIngredientDetail(ingredientId);
            });
        });
    }
    
    filterIngredients() {
        const cacheKey = `${this.searchTerm}-${Array.from(this.activeFilters).join(',')}`;
        if (this.filterCache?.[cacheKey]) {
            return this.filterCache[cacheKey];
        }
        
        const filtered = this.ingredients.filter(ingredient => {
            if (this.searchTerm && !this.matchesSearch(ingredient)) {
                return false;
            }
            
            if (this.activeFilters.size > 0) {
                return ingredient.categories.some(category => 
                    this.activeFilters.has(category)
                );
            }
            
            return true;
        });
        
        this.filterCache = this.filterCache || {};
        this.filterCache[cacheKey] = filtered;
        return filtered;
    }
    
    matchesSearch(ingredient) {
        const searchTerm = this.searchTerm.toLowerCase();
        return (
            ingredient.name.toLowerCase().includes(searchTerm) ||
            ingredient.description.toLowerCase().includes(searchTerm) ||
            ingredient.commonNames.some(name => 
                name.toLowerCase().includes(searchTerm)
            )
        );
    }
    
    showIngredientDetail(ingredientId) {
        // Sanitize input
        const safeId = this.sanitizeInput(ingredientId);
        const ingredient = this.ingredients.find(i => i.id === safeId);
        if (!ingredient) return;
        
        const detailContent = this.ingredientDetail.querySelector('.ingredient-content');
        detailContent.innerHTML = this.sanitizeHTML(`
            <h2>${ingredient.name}</h2>
            <p class="description">${ingredient.description}</p>
            
            <div class="benefits">
                <h3>Benefits</h3>
                <ul>
                    ${ingredient.benefits.map(benefit => 
                        `<li>${benefit}</li>`
                    ).join('')}
                </ul>
            </div>
            
            ${ingredient.cautions.length > 0 ? `
                <div class="cautions">
                    <h3>Cautions</h3>
                    <ul>
                        ${ingredient.cautions.map(caution => 
                            `<li>${caution}</li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="optimization-section">
                <h3>Optimal Usage</h3>
                <div class="optimization-details">
                    ${this.getOptimizationDetails(ingredient)}
                </div>
            </div>
            
            ${ingredient.research ? `
                <div class="research-section">
                    <h3>Research & Studies</h3>
                    <div class="research-content">
                        ${ingredient.research.map(study => `
                            <div class="study-card">
                                <h4>${study.title}</h4>
                                <p class="study-finding">${study.finding}</p>
                                <div class="study-meta">
                                    <span class="study-year">${study.year}</span>
                                    ${study.concentration ? `
                                        <span class="study-concentration">
                                            Tested at ${study.concentration}
                                        </span>
                                    ` : ''}
                                </div>
                                ${study.source ? `
                                    <a href="${study.source}" target="_blank" class="study-link">
                                        View Source
                                    </a>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="compatibility-section">
                <h3>Compatibility</h3>
                ${this.createCompatibilityMatrix(ingredient)}
                <div class="pairs-well">
                    <h4>Pairs Well With</h4>
                    <ul>
                        ${ingredient.pairsWith.map(pair => {
                            const pairIngredient = this.ingredients.find(i => i.id === pair);
                            return `<li>${pairIngredient ? pairIngredient.name : pair}</li>`;
                        }).join('')}
                    </ul>
                </div>
                
                ${ingredient.conflicts.length > 0 ? `
                    <div class="avoid-mixing">
                        <h4>Avoid Mixing With</h4>
                        <ul>
                            ${ingredient.conflicts.map(conflict => {
                                const conflictIngredient = this.ingredients.find(i => i.id === conflict);
                                return `<li>${conflictIngredient ? conflictIngredient.name : conflict}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            
            <div class="usage-info">
                <h3>Recommended Usage</h3>
                <p>Concentration: ${ingredient.concentration.recommended}</p>
                <p>Maximum: ${ingredient.concentration.max}</p>
            </div>
        `);
        
        // Show modal overlay and detail view
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        this.ingredientDetail.classList.remove('hidden');
        overlay.classList.remove('hidden');
        
        // Initialize tooltips for compatibility matrix
        this.initializeCompatibilityTooltips();
    }
    
    closeIngredientDetail() {
        this.ingredientDetail.classList.add('hidden');
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    handleError(error) {
        // Add error handling UI
        this.ingredientsGrid.innerHTML = `
            <div class="error-message">
                <h3>Oops! Something went wrong</h3>
                <p>We couldn't load the ingredient dictionary. Please try again later.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    showCombinationGuide() {
        const commonCombos = this.getCommonCombinations();
        const layeringGuide = this.getLayeringGuide();
        
        this.educationModal.innerHTML = `
            <div class="education-content">
                <button class="close-btn" onclick="this.closest('.education-modal').classList.add('hidden')">&times;</button>
                <h2>Understanding Ingredient Combinations</h2>
                
                <section class="common-combinations">
                    <h3>Popular Ingredient Combinations</h3>
                    <div class="combo-grid">
                        ${commonCombos.map(combo => `
                            <div class="combo-card">
                                <h4>${combo.name}</h4>
                                <p>${combo.description}</p>
                                <div class="ingredients">
                                    ${combo.ingredients.map(ing => `
                                        <span class="ingredient-tag" 
                                              onclick="window.ingredientDictionary.showIngredientDetail('${ing.id}')">
                                            ${ing.name}
                                        </span>
                                    `).join(' + ')}
                                </div>
                                <div class="benefits">
                                    <h5>Benefits</h5>
                                    <ul>
                                        ${combo.benefits.map(benefit => `
                                            <li>${benefit}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <section class="layering-guide">
                    <h3>How to Layer Your Ingredients</h3>
                    <div class="layering-steps">
                        ${layeringGuide.map((step, index) => `
                            <div class="layer-step">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">
                                    <h4>${step.name}</h4>
                                    <p>${step.description}</p>
                                    <div class="examples">
                                        <strong>Examples:</strong> ${step.examples.join(', ')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <section class="tips-section">
                    <h3>Pro Tips</h3>
                    <ul class="tips-list">
                        <li>Wait 1-2 minutes between layers to allow absorption</li>
                        <li>Start with small amounts when combining active ingredients</li>
                        <li>Not all products need to be used twice daily</li>
                        <li>Consider alternating strong actives between AM and PM routines</li>
                        <li>Always patch test new combinations</li>
                    </ul>
                </section>
            </div>
        `;
        
        this.educationModal.classList.remove('hidden');
    }
    
    getCommonCombinations() {
        return [
            {
                name: "Hydration Boost",
                description: "A powerful combination for deep hydration and moisture retention",
                ingredients: [
                    { id: "hyaluronic-acid", name: "Hyaluronic Acid" },
                    { id: "beta-glucan", name: "Beta Glucan" }
                ],
                benefits: [
                    "Enhanced moisture retention",
                    "Deeper hydration",
                    "Plumper skin appearance"
                ]
            },
            {
                name: "Brightening Duo",
                description: "Effective combination for targeting hyperpigmentation and dullness",
                ingredients: [
                    { id: "vitamin-c", name: "Vitamin C" },
                    { id: "niacinamide", name: "Niacinamide" }
                ],
                benefits: [
                    "Enhanced brightness",
                    "Even skin tone",
                    "Antioxidant protection"
                ]
            },
            {
                name: "Soothing Complex",
                description: "Calming combination for sensitive or irritated skin",
                ingredients: [
                    { id: "centella-asiatica", name: "Centella Asiatica" },
                    { id: "green-tea", name: "Green Tea Extract" }
                ],
                benefits: [
                    "Reduced redness",
                    "Calmed irritation",
                    "Strengthened skin barrier"
                ]
            }
        ];
    }
    
    getLayeringGuide() {
        return [
            {
                name: "Watery Layers",
                description: "Start with the thinnest, water-based products",
                examples: ["Toners", "Essences", "Hyaluronic Acid"]
            },
            {
                name: "Treatment Products",
                description: "Apply targeted treatments and serums",
                examples: ["Vitamin C", "Niacinamide", "Beta Glucan"]
            },
            {
                name: "Emulsions",
                description: "Layer light moisturizing products",
                examples: ["Light lotions", "Emulsions", "Gel creams"]
            },
            {
                name: "Rich Moisturizers",
                description: "Seal in previous layers with richer products",
                examples: ["Creams", "Oils", "Sleeping masks"]
            }
        ];
    }
    
    createCompatibilityMatrix(ingredient) {
        // Get all relevant ingredients for the matrix
        const relatedIngredients = new Set([
            ...ingredient.pairsWith,
            ...ingredient.conflicts,
            ...ingredient.enhances || [],
            ...ingredient.stabilizes || []
        ]);
        
        const matrixIngredients = Array.from(relatedIngredients)
            .map(id => this.ingredients.find(i => i.id === id))
            .filter(i => i); // Remove any undefined entries
        
        if (matrixIngredients.length === 0) return '';
        
        return `
            <div class="compatibility-matrix">
                <h4>Interaction Matrix</h4>
                <div class="matrix-container">
                    <div class="matrix-grid">
                        ${matrixIngredients.map(related => {
                            const compatibility = this.getCompatibilityType(ingredient, related);
                            return `
                                <div class="matrix-cell ${compatibility.class}" 
                                     data-tooltip="${compatibility.description}">
                                    <span class="ingredient-name">${related.name}</span>
                                    <span class="compatibility-icon">${compatibility.icon}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="matrix-legend">
                    <div class="legend-item">
                        <span class="legend-icon">✨</span>
                        <span>Enhances Effects</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon">✅</span>
                        <span>Works Well Together</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon">⚠️</span>
                        <span>Use with Caution</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon">❌</span>
                        <span>Avoid Mixing</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    getCompatibilityType(ingredient1, ingredient2) {
        if (ingredient1.enhances && ingredient1.enhances.includes(ingredient2.id)) {
            return {
                class: 'enhances',
                icon: '✨',
                description: `${ingredient1.name} enhances the effects of ${ingredient2.name}`
            };
        }
        
        if (ingredient1.stabilizes && ingredient1.stabilizes.includes(ingredient2.id)) {
            return {
                class: 'stabilizes',
                icon: '✨',
                description: `${ingredient1.name} helps stabilize ${ingredient2.name}`
            };
        }
        
        if (ingredient1.pairsWith.includes(ingredient2.id)) {
            return {
                class: 'pairs-well',
                icon: '✅',
                description: `${ingredient1.name} works well with ${ingredient2.name}`
            };
        }
        
        if (ingredient1.conflicts.includes(ingredient2.id)) {
            return {
                class: 'conflicts',
                icon: '❌',
                description: `Avoid mixing ${ingredient1.name} with ${ingredient2.name}`
            };
        }
        
        // Check for potential cautions
        const hasCaution = ingredient1.cautions.some(caution =>
            ingredient2.categories.some(category =>
                caution.toLowerCase().includes(category.toLowerCase())
            )
        );
        
        if (hasCaution) {
            return {
                class: 'caution',
                icon: '⚠️',
                description: `Use ${ingredient1.name} with ${ingredient2.name} with caution`
            };
        }
        
        return {
            class: 'neutral',
            icon: '➖',
            description: `No known interactions between ${ingredient1.name} and ${ingredient2.name}`
        };
    }
    
    initializeCompatibilityTooltips() {
        const cells = this.ingredientDetail.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            const tooltip = cell.getAttribute('data-tooltip');
            if (tooltip) {
                cell.addEventListener('mouseenter', (e) => {
                    const tooltipEl = document.createElement('div');
                    tooltipEl.className = 'matrix-tooltip';
                    tooltipEl.textContent = tooltip;
                    document.body.appendChild(tooltipEl);
                    
                    const rect = cell.getBoundingClientRect();
                    tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 10}px`;
                    tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2)}px`;
                });
                
                cell.addEventListener('mouseleave', () => {
                    const tooltip = document.querySelector('.matrix-tooltip');
                    if (tooltip) tooltip.remove();
                });
            }
        });
    }

    showSkinConcernsGuide() {
        const concerns = this.getSkinConcerns();
        
        this.educationModal.innerHTML = `
            <div class="education-content">
                <button class="close-btn" onclick="this.closest('.education-modal').classList.add('hidden')">&times;</button>
                <h2>Skin Concerns Guide</h2>
                
                <div class="concerns-grid">
                    ${concerns.map(concern => `
                        <div class="concern-card">
                            <h3>${concern.name}</h3>
                            <p>${concern.description}</p>
                            
                            <div class="key-ingredients">
                                <h4>Key Ingredients</h4>
                                <div class="ingredient-tags">
                                    ${concern.keyIngredients.map(ing => {
                                        const ingredient = this.ingredients.find(i => i.id === ing.id);
                                        return ingredient ? `
                                            <div class="ingredient-tag" 
                                                 onclick="window.ingredientDictionary.showIngredientDetail('${ingredient.id}')">
                                                <span class="ingredient-name">${ingredient.name}</span>
                                                <span class="ingredient-note">${ing.note}</span>
                                            </div>
                                        ` : '';
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div class="routine-tips">
                                <h4>Routine Tips</h4>
                                <ul>
                                    ${concern.tips.map(tip => `
                                        <li>${tip}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            
                            ${concern.avoidIngredients ? `
                                <div class="avoid-ingredients">
                                    <h4>Ingredients to Avoid</h4>
                                    <ul>
                                        ${concern.avoidIngredients.map(ing => `
                                            <li>${ing.name}: ${ing.reason}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.educationModal.classList.remove('hidden');
    }
    
    getSkinConcerns() {
        return [
            {
                name: "Acne & Breakouts",
                description: "Inflammatory skin condition characterized by pimples, blackheads, and whiteheads.",
                keyIngredients: [
                    { id: "beta-hydroxy-acid", note: "Unclogs pores" },
                    { id: "niacinamide", note: "Regulates oil production" },
                    { id: "tea-tree", note: "Natural antibacterial" },
                    { id: "centella-asiatica", note: "Calms inflammation" }
                ],
                tips: [
                    "Start with lower concentrations of active ingredients",
                    "Incorporate ingredients gradually",
                    "Don't over-exfoliate",
                    "Use non-comedogenic products"
                ],
                avoidIngredients: [
                    { name: "Heavy oils", reason: "Can clog pores" },
                    { name: "Alcohol", reason: "Can irritate and dry out skin" },
                    { name: "Fragrance", reason: "May cause irritation" }
                ]
            },
            {
                name: "Hyperpigmentation",
                description: "Dark spots and uneven skin tone caused by excess melanin production.",
                keyIngredients: [
                    { id: "vitamin-c", note: "Brightens and evens skin tone" },
                    { id: "alpha-arbutin", note: "Fades dark spots" },
                    { id: "niacinamide", note: "Reduces pigmentation" },
                    { id: "kojic-acid", note: "Natural brightening agent" }
                ],
                tips: [
                    "Always use sunscreen",
                    "Be patient - results take time",
                    "Layer products effectively",
                    "Focus on prevention"
                ]
            },
            {
                name: "Aging & Fine Lines",
                description: "Signs of aging including fine lines, wrinkles, and loss of firmness.",
                keyIngredients: [
                    { id: "retinol", note: "Promotes cell turnover" },
                    { id: "peptides", note: "Supports collagen production" },
                    { id: "vitamin-c", note: "Antioxidant protection" },
                    { id: "hyaluronic-acid", note: "Plumps skin" }
                ],
                tips: [
                    "Focus on hydration",
                    "Use gentle, non-stripping cleansers",
                    "Apply products on slightly damp skin",
                    "Don't forget neck and décolletage"
                ]
            },
            {
                name: "Sensitivity & Redness",
                description: "Easily irritated skin prone to redness and inflammation.",
                keyIngredients: [
                    { id: "centella-asiatica", note: "Calms inflammation" },
                    { id: "allantoin", note: "Soothes irritation" },
                    { id: "beta-glucan", note: "Strengthens skin barrier" },
                    { id: "panthenol", note: "Promotes healing" }
                ],
                tips: [
                    "Patch test new products",
                    "Keep routine simple",
                    "Avoid hot water",
                    "Look for fragrance-free products"
                ],
                avoidIngredients: [
                    { name: "Fragrances", reason: "Common irritant" },
                    { name: "Harsh exfoliants", reason: "Can cause irritation" },
                    { name: "Essential oils", reason: "Potential sensitizers" }
                ]
            }
        ];
    }

    getOptimizationDetails(ingredient) {
        const details = [];
        
        // Time of day recommendation
        if (ingredient.timeOfDay) {
            const timeRecommendation = ingredient.timeOfDay === 'both' 
                ? 'Can be used both AM and PM'
                : `Best used in ${ingredient.timeOfDay.toUpperCase()}`;
            details.push(`
                <div class="optimization-item">
                    <h4>Time of Day</h4>
                    <p>${timeRecommendation}</p>
                </div>
            `);
        }
        
        // pH sensitivity
        if (ingredient.phSensitive) {
            details.push(`
                <div class="optimization-item">
                    <h4>pH Sensitivity</h4>
                    <p>This ingredient is pH-sensitive. For optimal effectiveness, use products with pH ${ingredient.optimalPh || 'between 5.0-7.0'}.</p>
                </div>
            `);
        }
        
        // Application tips based on categories
        const applicationTips = this.getApplicationTips(ingredient);
        if (applicationTips) {
            details.push(`
                <div class="optimization-item">
                    <h4>Application Tips</h4>
                    <p>${applicationTips}</p>
                </div>
            `);
        }
        
        // Concentration guidelines
        if (ingredient.concentration) {
            details.push(`
                <div class="optimization-item">
                    <h4>Concentration Guidelines</h4>
                    <p>Recommended: ${ingredient.concentration.recommended}</p>
                    <p>Maximum: ${ingredient.concentration.max}</p>
                </div>
            `);
        }
        
        // Storage recommendations
        const storageRecommendation = this.getStorageRecommendation(ingredient);
        if (storageRecommendation) {
            details.push(`
                <div class="optimization-item">
                    <h4>Storage</h4>
                    <p>${storageRecommendation}</p>
                </div>
            `);
        }
        
        return details.join('');
    }

    getApplicationTips(ingredient) {
        const tips = [];
        
        if (ingredient.categories.includes('humectant')) {
            tips.push('Apply to damp skin for best results');
        }
        
        if (ingredient.categories.includes('antioxidant')) {
            tips.push('Layer under sunscreen in AM routine');
        }
        
        if (ingredient.categories.includes('exfoliant')) {
            tips.push('Start with 1-2 times per week and gradually increase frequency');
        }
        
        if (ingredient.potency === 'high') {
            tips.push('Start with a lower concentration and patch test first');
        }
        
        if (ingredient.categories.includes('oil')) {
            tips.push('Apply after water-based products');
        }
        
        return tips.length > 0 ? tips.join('. ') + '.' : null;
    }

    getStorageRecommendation(ingredient) {
        if (ingredient.categories.includes('antioxidant') || 
            ingredient.categories.includes('vitamin') ||
            ingredient.lightSensitive) {
            return 'Store in a cool, dark place. Some ingredients may be sensitive to light and heat.';
        }
        
        if (ingredient.categories.includes('probiotic') || 
            ingredient.categories.includes('ferment')) {
            return 'Refrigeration may extend shelf life but is not required.';
        }
        
        return null;
    }

    sanitizeInput(input) {
        return input.replace(/[^\w-]/g, '');
    }

    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    // Add test helpers
    static createTestInstance(ingredients, categories) {
        return new IngredientDictionary({
            testing: true,
            ingredients,
            categories
        });
    }

    setupTabs() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active states
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        // Populate content if needed
        if (tabName === 'combinations' || tabName === 'concerns') {
            this.populateTabContent();
        }
    }

    populateTabContent() {
        const combinationsTab = document.querySelector('[data-tab="combinations"]');
        const concernsTab = document.querySelector('[data-tab="concerns"]');

        if (this.currentTab === 'combinations' && !combinationsTab.hasChildNodes()) {
            combinationsTab.innerHTML = this.getCombinationsContent();
        }

        if (this.currentTab === 'concerns' && !concernsTab.hasChildNodes()) {
            concernsTab.innerHTML = this.getConcernsContent();
        }

        // Add click handlers for ingredient tags
        document.querySelectorAll('.ingredient-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const ingredientName = tag.textContent.trim();
                const ingredient = this.ingredients.find(i => i.name === ingredientName);
                if (ingredient) {
                    this.showIngredientDetail(ingredient.id);
                }
            });
        });
    }

    getCombinationsContent() {
        return `
            <div class="combo-grid">
                <div class="combo-card">
                    <h4>Hydration Boost</h4>
                    <div class="ingredients">
                        <span class="ingredient-tag">Hyaluronic Acid</span>
                        <span class="ingredient-tag">Glycerin</span>
                        <span class="ingredient-tag">Ceramides</span>
                    </div>
                    <p>Perfect combination for deep hydration and moisture barrier repair.</p>
                </div>
                <div class="combo-card">
                    <h4>Anti-Aging Power</h4>
                    <div class="ingredients">
                        <span class="ingredient-tag">Retinol</span>
                        <span class="ingredient-tag">Peptides</span>
                        <span class="ingredient-tag">Vitamin C</span>
                    </div>
                    <p>Powerful anti-aging combination that targets multiple signs of aging.</p>
                </div>
                <div class="combo-card">
                    <h4>Brightening Complex</h4>
                    <div class="ingredients">
                        <span class="ingredient-tag">Vitamin C</span>
                        <span class="ingredient-tag">Niacinamide</span>
                        <span class="ingredient-tag">Alpha Arbutin</span>
                    </div>
                    <p>Synergistic combination for evening skin tone and boosting radiance.</p>
                </div>
            </div>
            <div class="layering-steps">
                <h3>Proper Layering Guide</h3>
                <div class="layer-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Cleansing</h4>
                        <p>Start with a gentle cleanser appropriate for your skin type.</p>
                    </div>
                </div>
                <div class="layer-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Toning</h4>
                        <p>Balance pH levels and prep skin for treatments.</p>
                    </div>
                </div>
                <div class="layer-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Treatment</h4>
                        <p>Apply active ingredients from thinnest to thickest consistency.</p>
                    </div>
                </div>
                <div class="layer-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>Moisturizing</h4>
                        <p>Lock in treatments and provide hydration.</p>
                    </div>
                </div>
            </div>
        `;
    }

    getConcernsContent() {
        return `
            <div class="concerns-grid">
                <div class="concern-card">
                    <h3>Acne-Prone Skin</h3>
                    <div class="key-ingredients">
                        <h4>Key Ingredients:</h4>
                        <div class="ingredient-tags">
                            <span class="ingredient-tag">Salicylic Acid</span>
                            <span class="ingredient-tag">Niacinamide</span>
                            <span class="ingredient-tag">Tea Tree</span>
                        </div>
                    </div>
                    <div class="routine-tips">
                        <h4>Routine Tips:</h4>
                        <ul>
                            <li>Double cleanse in the evening</li>
                            <li>Use non-comedogenic products</li>
                            <li>Don't over-exfoliate</li>
                        </ul>
                    </div>
                    <div class="avoid-ingredients">
                        <h4>Ingredients to Avoid:</h4>
                        <div class="ingredient-tags">
                            <span class="ingredient-tag">Heavy Oils</span>
                            <span class="ingredient-tag">Alcohol</span>
                            <span class="ingredient-tag">Fragrance</span>
                        </div>
                    </div>
                </div>
                <div class="concern-card">
                    <h3>Aging Skin</h3>
                    <div class="key-ingredients">
                        <h4>Key Ingredients:</h4>
                        <div class="ingredient-tags">
                            <span class="ingredient-tag">Retinol</span>
                            <span class="ingredient-tag">Peptides</span>
                            <span class="ingredient-tag">Vitamin C</span>
                        </div>
                    </div>
                    <div class="routine-tips">
                        <h4>Routine Tips:</h4>
                        <ul>
                            <li>Use gentle, hydrating cleansers</li>
                            <li>Layer hydrating products</li>
                            <li>Always use sunscreen</li>
                        </ul>
                    </div>
                </div>
                <div class="concern-card">
                    <h3>Sensitive Skin</h3>
                    <div class="key-ingredients">
                        <h4>Key Ingredients:</h4>
                        <div class="ingredient-tags">
                            <span class="ingredient-tag">Centella Asiatica</span>
                            <span class="ingredient-tag">Ceramides</span>
                            <span class="ingredient-tag">Green Tea</span>
                        </div>
                    </div>
                    <div class="routine-tips">
                        <h4>Routine Tips:</h4>
                        <ul>
                            <li>Patch test new products</li>
                            <li>Avoid harsh exfoliants</li>
                            <li>Focus on barrier repair</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="tips-section">
                <h3>General Skincare Tips</h3>
                <ul class="tips-list">
                    <li>Always apply products in order of thinnest to thickest consistency</li>
                    <li>Wait 1-2 minutes between applying different active ingredients</li>
                    <li>Use sunscreen daily, even on cloudy days</li>
                    <li>Stay hydrated and maintain a healthy diet</li>
                    <li>Clean your pillowcase and phone screen regularly</li>
                </ul>
            </div>
        `;
    }
}

// Initialize the ingredient dictionary when the DOM is loaded
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ingredientDictionary = new IngredientDictionary();
    });
} 