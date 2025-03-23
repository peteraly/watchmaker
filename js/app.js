document.addEventListener('DOMContentLoaded', function() {
  // === DOM Elements ===
  // Navigation buttons
  const startBtn = document.getElementById('start-btn');
  const backBtn = document.getElementById('back-btn');
  const nextBtn = document.getElementById('next-btn');
  const saveBtn = document.getElementById('save-btn');
  const restartBtn = document.getElementById('restart-btn');
  const morningTab = document.getElementById('morning-tab');
  const eveningTab = document.getElementById('evening-tab');
  const learnMoreLink = document.getElementById('learn-more-link');
  const backToResultsBtn = document.getElementById('back-to-results');
  const privacyLink = document.getElementById('privacy-link');
  
  // Sections
  const introSection = document.getElementById('intro');
  const assessmentSection = document.getElementById('assessment');
  const resultsSection = document.getElementById('results');
  const learnMoreSection = document.getElementById('learn-more');
  
  // Question containers
  const questions = document.querySelectorAll('.question');
  const totalQuestions = questions.length;
  const totalQuestionsEl = document.getElementById('total-questions');
  totalQuestionsEl.textContent = totalQuestions;
  
  // Progress indicators
  const currentQuestionEl = document.getElementById('current-question');
  const progressIndicator = document.querySelector('.progress-indicator');
  
  // Results containers
  const resultSkinType = document.getElementById('result-skin-type');
  const resultPrimaryConcern = document.getElementById('result-primary-concern');
  const resultSecondaryConcern = document.getElementById('result-secondary-concern');
  const resultSteps = document.getElementById('result-steps');
  const resultFocus = document.getElementById('result-focus');
  const morningStepsContainer = document.getElementById('morning-steps');
  const eveningStepsContainer = document.getElementById('evening-steps');
  const morningRoutine = document.getElementById('morning-routine');
  const eveningRoutine = document.getElementById('evening-routine');
  
  // === State Management ===
  let currentQuestion = 1;
  const userSelections = {
    skinType: '',
    primaryConcern: '',
    secondaryConcern: '',
    budget: '',
    steps: ''
  };
  
  let generatedRoutine = {
    morning: [],
    evening: []
  };

  // === Event Listeners ===
  // Start assessment
  startBtn.addEventListener('click', function() {
    introSection.classList.remove('active-section');
    introSection.classList.add('hidden-section');
    assessmentSection.classList.remove('hidden-section');
    assessmentSection.classList.add('active-section');
    updateProgressBar();
  });
  
  // Navigation between questions
  backBtn.addEventListener('click', function() {
    if (currentQuestion > 1) {
      questions[currentQuestion-1].classList.remove('active-question');
      questions[currentQuestion-1].classList.add('hidden-question');
      currentQuestion--;
      questions[currentQuestion-1].classList.remove('hidden-question');
      questions[currentQuestion-1].classList.add('active-question');
      
      if (currentQuestion === 1) {
        backBtn.disabled = true;
      }
      
      nextBtn.disabled = !hasSelection(currentQuestion);
      updateProgressBar();
    }
  });
  
  nextBtn.addEventListener('click', async function() {
    if (currentQuestion < totalQuestions) {
        questions[currentQuestion-1].classList.remove('active-question');
        questions[currentQuestion-1].classList.add('hidden-question');
        currentQuestion++;
        questions[currentQuestion-1].classList.remove('hidden-question');
        questions[currentQuestion-1].classList.add('active-question');
        
        backBtn.disabled = false;
        nextBtn.disabled = !hasSelection(currentQuestion);
        updateProgressBar();
    } else {
        // Last question completed, generate results
        assessmentSection.classList.remove('active-section');
        assessmentSection.classList.add('hidden-section');
        
        try {
            // Show loading state
            const loadingEl = document.createElement('div');
            loadingEl.className = 'loading-state';
            loadingEl.innerHTML = `
                <div class="loading-spinner"></div>
                <p class="loading-text">Generating your personalized routine...</p>
            `;
            document.querySelector('.routine-tabs').before(loadingEl);
            
            // Generate routine
            const routine = await generateRoutine();
            
            // Remove loading state
            loadingEl.remove();
            
            if (routine && routine.morning && routine.evening) {
                // Store the generated routine
                generatedRoutine = routine;
                
                // Display results
                displayResults(routine);
                
                // Show results section
                resultsSection.classList.remove('hidden-section');
                resultsSection.classList.add('active-section');
            } else {
                throw new Error('Failed to generate routine');
            }
        } catch (error) {
            console.error('Error generating routine:', error);
            alert('Sorry, there was an error generating your routine. Please try again.');
            
            // Reset to first question
            currentQuestion = 1;
            questions.forEach((q, index) => {
                if (index === 0) {
                    q.classList.add('active-question');
                    q.classList.remove('hidden-question');
                } else {
                    q.classList.remove('active-question');
                    q.classList.add('hidden-question');
                }
            });
            
            assessmentSection.classList.remove('hidden-section');
            assessmentSection.classList.add('active-section');
        }
    }
  });
  
  // Option selection
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
      const question = this.closest('.question');
      const options = question.querySelectorAll('.option');
      const questionId = question.id;
      const value = this.getAttribute('data-value');
      const questionNum = parseInt(questionId.replace('q', ''));
      
      options.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      
      // Store selection
      switch(questionNum) {
        case 1:
          userSelections.skinType = value;
          break;
        case 2:
          userSelections.primaryConcern = value;
          break;
        case 3:
          userSelections.secondaryConcern = value;
          break;
        case 4:
          userSelections.budget = value;
          break;
        case 5:
          userSelections.steps = value;
          break;
      }
      
      // Enable the next button
      nextBtn.disabled = false;
      
      // Update the preview panel
      updatePreviewPanel(questionId, value);
    });
  });
  
  // Tab navigation for routines
  morningTab.addEventListener('click', function() {
    eveningTab.classList.remove('active-tab');
    morningTab.classList.add('active-tab');
    eveningRoutine.classList.remove('active-routine');
    eveningRoutine.classList.add('hidden-routine');
    morningRoutine.classList.remove('hidden-routine');
    morningRoutine.classList.add('active-routine');
  });
  
  eveningTab.addEventListener('click', function() {
    morningTab.classList.remove('active-tab');
    eveningTab.classList.add('active-tab');
    morningRoutine.classList.remove('active-routine');
    morningRoutine.classList.add('hidden-routine');
    eveningRoutine.classList.remove('hidden-routine');
    eveningRoutine.classList.add('active-routine');
  });
  
  // Save routine
  saveBtn.addEventListener('click', function() {
    // Save to local storage
    localStorage.setItem('kbeauty-routine', JSON.stringify({
      selections: userSelections,
      routine: generatedRoutine,
      timestamp: new Date().toISOString()
    }));
    
    alert('Your routine has been saved! You can access it anytime by returning to this page.');
  });
  
  // Restart assessment
  restartBtn.addEventListener('click', function() {
    // Reset state
    currentQuestion = 1;
    userSelections.skinType = '';
    userSelections.primaryConcern = '';
    userSelections.secondaryConcern = '';
    userSelections.budget = '';
    userSelections.steps = '';
    
    // Reset UI
    document.querySelectorAll('.option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    questions.forEach((q, index) => {
      if (index === 0) {
        q.classList.add('active-question');
        q.classList.remove('hidden-question');
      } else {
        q.classList.remove('active-question');
        q.classList.add('hidden-question');
      }
    });
    
    backBtn.disabled = true;
    nextBtn.disabled = true;
    
    // Show assessment
    resultsSection.classList.remove('active-section');
    resultsSection.classList.add('hidden-section');
    assessmentSection.classList.remove('hidden-section');
    assessmentSection.classList.add('active-section');
    
    updateProgressBar();
  });
  
  // Learn more navigation
  learnMoreLink.addEventListener('click', function(e) {
    e.preventDefault();
    showSection('learn-more');
  });
  
  backToResultsBtn.addEventListener('click', function() {
    learnMoreSection.classList.remove('active-section');
    learnMoreSection.classList.add('hidden-section');
    
    if (localStorage.getItem('kbeauty-routine')) {
      resultsSection.classList.remove('hidden-section');
      resultsSection.classList.add('active-section');
    } else {
      introSection.classList.remove('hidden-section');
      introSection.classList.add('active-section');
    }
  });
  
  // Privacy policy link
  privacyLink.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Privacy Policy: This app does not collect any personal data. Your skincare routine is saved only on your device using local storage and is not transmitted anywhere else.');
  });
  
  // === Navigation Event Listeners ===
  document.getElementById('ingredient-dictionary-link').addEventListener('click', function(e) {
    e.preventDefault();
    showSection('ingredient-dictionary');
  });
  
  function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('hidden-section');
      section.classList.remove('active-section');
    });
    
    // Show requested section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden-section');
      section.classList.add('active-section');
    }
  }
  
  // === Helper Functions ===
  function updateProgressBar() {
    currentQuestionEl.textContent = currentQuestion;
    const progress = (currentQuestion / totalQuestions) * 100;
    progressIndicator.style.width = `${progress}%`;
  }
  
  function hasSelection(questionNum) {
    switch(questionNum) {
      case 1:
        return userSelections.skinType !== '';
      case 2:
        return userSelections.primaryConcern !== '';
      case 3:
        return userSelections.secondaryConcern !== '';
      case 4:
        return userSelections.budget !== '';
      case 5:
        return userSelections.steps !== '';
      default:
        return false;
    }
  }

  // === Clear previous routine recommendations ===
  function clearPreviousRoutine() {
    morningStepsContainer.innerHTML = '';
    eveningStepsContainer.innerHTML = '';
    morningRoutine.style.display = 'none';
    eveningRoutine.style.display = 'none';
  }

  // === Generate routine based on user selections ===
  async function generateRoutine() {
    try {
        // Load and filter products
        let products = await loadProductDatabase();
        if (!products || products.length === 0) {
            throw new Error('Unable to load product database');
        }
        
        // Get routine steps
        const morningSteps = getRoutineSteps('morning', userSelections.steps);
        const eveningSteps = getRoutineSteps('evening', userSelections.steps);
        
        // Generate morning routine
        const morningRoutine = morningSteps.map(step => {
            const product = findBestProduct(products, step, userSelections);
            return {
                step,
                product,
                timeOfDay: 'morning',
                why: product ? generateRecommendationReason(product, userSelections) : ''
            };
        });
        
        // Generate evening routine
        const eveningRoutine = eveningSteps.map(step => {
            const product = findBestProduct(products, step, userSelections);
            return {
                step,
                product,
                timeOfDay: 'evening',
                why: product ? generateRecommendationReason(product, userSelections) : ''
            };
        });
        
        // Check if we have enough products
        const missingProducts = [...morningRoutine, ...eveningRoutine].filter(item => !item.product);
        if (missingProducts.length > 0) {
            console.warn('Missing products for steps:', missingProducts.map(item => item.step));
            const fallbackRoutine = useFallbackRoutine(userSelections);
            if (fallbackRoutine) {
                return fallbackRoutine;
            }
        }
        
        return { morning: morningRoutine, evening: eveningRoutine };
    } catch (error) {
        console.error('Error generating routine:', error);
        throw error;
    }
  }
  
  function loadProductDatabase() {
    return new Promise((resolve, reject) => {
        fetch('/data/products.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load product database');
                }
                return response.json();
            })
            .then(data => {
                if (!data || !data.products || !Array.isArray(data.products)) {
                    throw new Error('Invalid product data format');
                }
                resolve(data.products);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                // Use default products as fallback
                resolve(getDefaultProducts());
            });
    });
  }
  
  function getDefaultProducts() {
    return [
        {
            id: "1",
            name: "Gentle Hydrating Cleanser",
            brand: "Default Brand",
            category: "cleanser",
            step: "cleanser",
            price: 15.99,
            priceCategory: "budget",
            goodFor: ["all", "sensitive", "dry"],
            keyIngredient: "Hyaluronic Acid",
            description: "A gentle cleanser suitable for all skin types"
        },
        {
            id: "2",
            name: "Basic Moisturizer",
            brand: "Default Brand",
            category: "moisturizer",
            step: "moisturizer",
            price: 18.99,
            priceCategory: "budget",
            goodFor: ["all", "sensitive", "dry"],
            keyIngredient: "Ceramides",
            description: "A basic moisturizer suitable for all skin types"
        },
        {
            id: "3",
            name: "Daily Sunscreen SPF 50",
            brand: "Default Brand",
            category: "sunscreen",
            step: "sunscreen",
            price: 20.99,
            priceCategory: "budget",
            goodFor: ["all", "sensitive"],
            keyIngredient: "Zinc Oxide",
            description: "A daily sunscreen suitable for all skin types"
        }
    ];
  }
  
  function isWithinBudget(product, userBudget) {
    if (!product.priceCategory || !userBudget) return true;
    
    switch(userBudget) {
        case 'budget':
            return product.priceCategory === 'budget';
        case 'mid':
            return product.priceCategory === 'budget' || product.priceCategory === 'mid';
        case 'premium':
            return true; // Premium users can access all price categories
        default:
            return true;
    }
  }
  
  function filterProducts(products, selections) {
    return products.filter(product => {
        // Budget filter
        if (!isWithinBudget(product, selections.budget)) {
            return false;
        }
        
        // Skin type compatibility - only filter out if explicitly listed as avoid
        if (product.avoidFor && product.avoidFor.includes(selections.skinType)) {
            return false;
        }

        // If product is specifically good for user's skin type or concerns, boost its score
        if (product.goodFor && (
            product.goodFor.includes(selections.skinType) ||
            product.goodFor.includes(selections.primaryConcern) ||
            product.goodFor.includes('all')
        )) {
            product.compatibilityScore = (product.compatibilityScore || 0) + 1;
        }

        // Enhanced ingredient compatibility check - but don't filter out completely
        if (window.ingredientDictionary?.ingredients) {
            const ingredientAnalysis = analyzeProductIngredients(product);
            product.ingredientAnalysis = ingredientAnalysis;
        }

        return true; // Keep product unless explicitly filtered out
    });
  }
  
  function analyzeProductIngredients(product) {
    const analysis = {
        score: 0,
        beneficialIngredients: [],
        cautionIngredients: [],
        conflicts: [],
        keyBenefits: new Set()
    };
    
    if (!product.ingredients || !window.ingredientDictionary?.ingredients) {
        return analysis;
    }
    
    const skinConcerns = [
        userSelections.skinType,
        userSelections.primaryConcern,
        userSelections.secondaryConcern
    ].filter(concern => concern && concern !== 'none');
    
    // Analyze each ingredient
    product.ingredients.forEach(ingredientName => {
        const ingredientId = getIngredientId(ingredientName);
        if (!ingredientId) return;
        
        const ingredient = window.ingredientDictionary.ingredients.find(i => i.id === ingredientId);
        if (!ingredient) return;
        
        // Check benefits and concerns match
        skinConcerns.forEach(concern => {
            if (ingredient.goodFor.includes(concern)) {
                analysis.score += 2;
                analysis.beneficialIngredients.push({
                    name: ingredient.name,
                    benefits: ingredient.benefits.filter(benefit => 
                        benefit.toLowerCase().includes(concern.toLowerCase())
                    )
                });
                ingredient.benefits.forEach(benefit => analysis.keyBenefits.add(benefit));
            }
        });
        
        // Check for cautions
        if (ingredient.cautions && ingredient.cautions.length > 0) {
            analysis.score -= 0.5;
            analysis.cautionIngredients.push({
                name: ingredient.name,
                cautions: ingredient.cautions
            });
        }
        
        // Check for specific avoidances
        if (ingredient.avoidFor.some(avoid => skinConcerns.includes(avoid))) {
            analysis.score -= 3;
            analysis.conflicts.push({
                name: ingredient.name,
                conflictsWith: skinConcerns.filter(concern => 
                    ingredient.avoidFor.includes(concern)
                )
            });
        }
        
        // Bonus points for key ingredients
        if (product.keyIngredient && product.keyIngredient.toLowerCase().includes(ingredient.name.toLowerCase())) {
            analysis.score += 1;
        }
        
        // Check concentration recommendations
        if (ingredient.concentration && ingredient.concentration.recommended) {
            analysis.score += 0.5; // Bonus for having concentration guidelines
        }
    });
    
    return analysis;
  }
  
  function getIngredientFilters(selections) {
    const filters = {
        required: [],
        preferred: [],
        avoid: [],
        categories: new Set()
    };

    if (!window.ingredientDictionary?.ingredients) {
        return filters;
    }

    // Add required ingredients based on primary concern
    switch (selections.primaryConcern) {
        case 'acne':
            filters.required.push('beta-hydroxy-acid', 'niacinamide');
            filters.preferred.push('green-tea', 'centella-asiatica', 'propolis');
            filters.avoid.push('heavy-oils');
            filters.categories.add('soothing');
            break;
        case 'aging':
            filters.required.push('peptides', 'vitamin-c');
            filters.preferred.push('adenosine', 'bifida-ferment', 'ceramides');
            filters.categories.add('antioxidants');
            break;
        case 'hyperpigmentation':
            filters.required.push('alpha-arbutin', 'vitamin-c');
            filters.preferred.push('licorice-root', 'niacinamide');
            filters.categories.add('antioxidants');
            break;
        case 'dryness':
            filters.required.push('hyaluronic-acid', 'ceramides');
            filters.preferred.push('polyglutamic-acid', 'panthenol', 'beta-glucan');
            filters.categories.add('humectants');
            filters.categories.add('emollients');
            break;
        case 'sensitivity':
            filters.required.push('centella-asiatica', 'allantoin');
            filters.preferred.push('panthenol', 'artemisia', 'beta-glucan');
            filters.categories.add('soothing');
            break;
    }

    // Add skin type specific filters
    switch (selections.skinType) {
        case 'oily':
            filters.preferred.push('niacinamide', 'green-tea');
            filters.avoid.push('heavy-oils');
            break;
        case 'dry':
            filters.preferred.push('ceramides', 'polyglutamic-acid');
            filters.categories.add('emollients');
            break;
        case 'sensitive':
            filters.preferred.push('allantoin', 'artemisia');
            filters.avoid.push('fragrances', 'alcohol');
            filters.categories.add('soothing');
            break;
        case 'combination':
            filters.preferred.push('niacinamide', 'beta-glucan');
            break;
    }

    // Secondary concern additional filters
    if (selections.secondaryConcern !== 'none') {
        switch (selections.secondaryConcern) {
            case 'redness':
                filters.preferred.push('artemisia', 'centella-asiatica', 'allantoin');
                filters.categories.add('soothing');
                break;
            case 'texture':
                filters.preferred.push('beta-hydroxy-acid', 'niacinamide');
                filters.categories.add('exfoliants');
                break;
            case 'pores':
                filters.preferred.push('niacinamide', 'beta-hydroxy-acid');
                break;
        }
    }

    return filters;
  }
  
  function passesIngredientFilters(product, filters) {
    if (!product.ingredients) {
        return true; // Pass products without ingredient data
    }

    const productIngredientIds = product.ingredients.map(ing => getIngredientId(ing)).filter(id => id);
    const productCategories = new Set();

    // Collect all ingredient categories
    productIngredientIds.forEach(id => {
        const ingredient = window.ingredientDictionary?.ingredients.find(i => i.id === id);
        if (ingredient) {
            ingredient.categories.forEach(cat => productCategories.add(cat));
        }
    });

    // Check required ingredients (must have at least one)
    if (filters.required.length > 0) {
        const hasRequired = filters.required.some(req => 
            productIngredientIds.includes(req)
        );
        if (!hasRequired) {
            return false;
        }
    }

    // Check avoided ingredients (must not have any)
    if (filters.avoid.length > 0) {
        const hasAvoided = filters.avoid.some(avoid => 
            productIngredientIds.includes(avoid)
        );
        if (hasAvoided) {
            return false;
        }
    }

    // Check required categories (must have at least one)
    if (filters.categories.size > 0) {
        const hasRequiredCategory = Array.from(filters.categories).some(cat =>
            productCategories.has(cat)
        );
        if (!hasRequiredCategory) {
            return false;
        }
    }

    // Add preferred ingredients to scoring
    if (filters.preferred.length > 0) {
        const preferredCount = filters.preferred.filter(pref => 
            productIngredientIds.includes(pref)
        ).length;
        product.preferredIngredientsScore = preferredCount * 2;
    }

    return true;
  }
  
  function findBestProduct(products, stepCategory, selections) {
    if (!products || !Array.isArray(products) || products.length === 0) {
        console.warn(`No products available for ${stepCategory}`);
        return null;
    }

    // Filter products by category
    let categoryProducts = products.filter(p => p && (
        p.category === stepCategory || 
        p.step === stepCategory || 
        (p.categories && p.categories.includes(stepCategory))
    ));
    
    // If no products found in primary category, try alternative category
    if (categoryProducts.length === 0) {
        const altCategory = getAlternativeCategory(stepCategory);
        if (altCategory) {
            categoryProducts = products.filter(p => p && (
                p.category === altCategory || 
                p.step === altCategory ||
                (p.categories && p.categories.includes(altCategory))
            ));
        }
    }
    
    // If still no products found, log warning and return null
    if (categoryProducts.length === 0) {
        console.warn(`No products found for category ${stepCategory} or its alternatives`);
        return null;
    }

    // Score products based on compatibility and user preferences
    const scoredProducts = categoryProducts.map(product => {
        let score = product.compatibilityScore || 0;
        
        // Boost score for products good for user's skin type or concerns
        if (product.goodFor) {
            if (product.goodFor.includes(selections.skinType)) score += 2;
            if (product.goodFor.includes(selections.primaryConcern)) score += 2;
            if (product.goodFor.includes('all')) score += 1;
        }
        
        // Consider ingredient analysis if available
        if (product.ingredientAnalysis) {
            score += product.ingredientAnalysis.score;
        }
        
        // Prefer products in user's budget range
        if (product.priceCategory === selections.budget) score += 1;
        
        return { product, score };
    });
    
    // Sort by score and return the best product
    scoredProducts.sort((a, b) => b.score - a.score);
    return scoredProducts.length > 0 ? scoredProducts[0].product : null;
  }
  
  function getAlternativeCategory(category) {
    const alternatives = {
        'cleanser': ['water-cleanser'],
        'water-cleanser': ['cleanser'],
        'oil-cleanser': ['cleanser'],
        'serum': ['essence', 'treatment'],
        'essence': ['serum', 'treatment'],
        'treatment': ['serum', 'essence'],
        'moisturizer': ['cream', 'lotion'],
        'cream': ['moisturizer', 'lotion'],
        'lotion': ['moisturizer', 'cream']
    };
    
    return alternatives[category] ? alternatives[category][0] : null;
  }
  
  function scoreBestProduct(products, selections) {
    if (!products || !Array.isArray(products) || products.length === 0) {
        return [];
    }

    return products.map(product => {
        if (!product) return { product, score: 0 };
        
        let score = 0;
        const maxScore = 100;
        
        // Base compatibility score (30%)
        const compatibilityScore = (product.safeFor && Array.isArray(product.safeFor) && 
            product.safeFor.includes(selections.skinType)) ? 30 : 0;
        
        // Primary concern match (25%)
        const primaryConcernScore = (product.goodFor && Array.isArray(product.goodFor) && 
            product.goodFor.includes(selections.primaryConcern)) ? 25 : 0;
        
        // Secondary concern match (15%)
        const secondaryConcernScore = (selections.secondaryConcern && product.goodFor && 
            Array.isArray(product.goodFor) && 
            product.goodFor.includes(selections.secondaryConcern)) ? 15 : 0;
        
        // Ingredient effectiveness score (20%)
        const ingredientScore = (product.ingredients ? analyzeIngredientEffectiveness(product) : 0.5) * 20;
        
        // Seasonal appropriateness (10%)
        const seasonScore = getSeasonalScore(product) * 10;
        
        // Calculate total score
        score = compatibilityScore + primaryConcernScore + secondaryConcernScore + 
                ingredientScore + seasonScore;
        
        // Apply personalization adjustments
        const personalizedScore = applyPersonalizationFactors(score, product, selections);
        
        return {
            product,
            score: personalizedScore,
            breakdown: {
                compatibility: compatibilityScore,
                primaryConcern: primaryConcernScore,
                secondaryConcern: secondaryConcernScore,
                ingredients: ingredientScore,
                seasonal: seasonScore,
                final: personalizedScore
            }
        };
    }).filter(result => result.score > 0) // Remove products with zero scores
      .sort((a, b) => b.score - a.score);
  }
  
  function getSeasonalScore(product) {
    const currentMonth = new Date().getMonth();
    const season = getSeason(currentMonth);
    
    if (!product.seasonalRecommendations) return 0.5;
    return product.seasonalRecommendations.includes(season) ? 1 : 0.3;
  }
  
  function getSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
  
  function applyPersonalizationFactors(baseScore, product, selections) {
    let adjustedScore = baseScore;
    
    // Adjust for skin sensitivity
    if (selections.skinType === 'sensitive') {
        adjustedScore *= product.gentleFormulation ? 1.2 : 0.8;
    }
    
    // Adjust for climate (if available)
    if (navigator.geolocation) {
        const climate = getUserClimate();
        if (climate && product.climateRecommendations) {
            adjustedScore *= product.climateRecommendations.includes(climate) ? 1.15 : 0.85;
        }
    }
    
    // Adjust for time of day
    const hour = new Date().getHours();
    if (product.timeOfDay) {
        if ((hour >= 6 && hour <= 10 && product.timeOfDay.includes('morning')) ||
            (hour >= 18 && hour <= 22 && product.timeOfDay.includes('evening'))) {
            adjustedScore *= 1.1;
        }
    }
    
    // Cap the final score at 100
    return Math.min(100, adjustedScore);
  }
  
  function getUserClimate() {
    // This would ideally use a weather API or geolocation service
    // For now, return a default value
    return 'temperate';
  }
  
  function getStepOptimizationScore(product, allProducts) {
    let score = 0;
    
    // Get all ingredients from other products
    const otherProducts = allProducts.filter(p => p !== product);
    const otherIngredients = new Set(
        otherProducts.flatMap(p => p.ingredients || [])
    );
    
    if (!product.ingredients) return score;
    
    // Check for complementary ingredients
    product.ingredients.forEach(ing => {
        const ingredient = window.ingredientDictionary?.ingredients.find(i => 
            i.id === getIngredientId(ing)
        );
        if (!ingredient) return;
        
        // Bonus for ingredients that enhance others in the routine
        if (ingredient.enhances) {
            const enhancesPresent = ingredient.enhances.some(enhanced => 
                otherIngredients.has(enhanced)
            );
            if (enhancesPresent) score += 2;
        }
        
        // Bonus for ingredients that stabilize others
        if (ingredient.stabilizes) {
            const stabilizesPresent = ingredient.stabilizes.some(stabilized => 
                otherIngredients.has(stabilized)
            );
            if (stabilizesPresent) score += 3;
        }
    });
    
    return score;
  }
  
  function generateRecommendationReason(product, selections) {
    let reason = '';
    
    // Base reason on skin type and product category
    if (selections.skinType === 'dry') {
        switch(product.category) {
            case 'cleanser':
            case 'water-cleanser':
                reason = `This gentle ${product.category} cleanses without stripping your dry skin's moisture`;
                break;
            case 'toner':
                reason = `This hydrating toner helps prep your dry skin for maximum moisture absorption`;
                break;
            case 'essence':
            case 'serum':
                reason = `This ${product.category} delivers deep hydration and nourishment to your dry skin`;
                break;
            case 'moisturizer':
                reason = `This rich moisturizer provides lasting hydration and strengthens your skin's moisture barrier`;
                break;
            case 'sunscreen':
                reason = `This hydrating sunscreen protects while maintaining your skin's moisture levels`;
                break;
            default:
                reason = `This ${product.category} provides hydrating benefits for your dry skin`;
        }
    } else {
        reason = `This ${product.category} is formulated to work with your ${selections.skinType} skin`;
    }
    
    // Add concern-specific benefits with more detail
    if (product.goodFor && product.goodFor.includes(selections.primaryConcern)) {
        if (selections.primaryConcern === 'dryness') {
            reason += ` while deeply hydrating and preventing moisture loss`;
        } else {
            reason += ` while targeting your ${selections.primaryConcern} concerns`;
        }
    }
    
    if (selections.secondaryConcern !== 'none' && 
        product.goodFor && product.goodFor.includes(selections.secondaryConcern)) {
        if (selections.secondaryConcern === 'pores') {
            reason += ` and helping to refine pore appearance without drying`;
        } else {
            reason += ` and helping with ${selections.secondaryConcern}`;
        }
    }
    
    // Add key ingredient benefits
    if (product.keyIngredient) {
        // Special descriptions for common ingredients
        const ingredientBenefits = {
            'hyaluronic acid': 'for intense hydration',
            'ceramides': 'to strengthen your skin barrier',
            'snail mucin': 'for repair and hydration',
            'peptides': 'to improve skin resilience',
            'green tea': 'for soothing and antioxidant protection',
            'niacinamide': 'to support skin barrier and refine pores',
            'centella asiatica': 'for calming and healing'
        };
        
        const benefit = ingredientBenefits[product.keyIngredient.toLowerCase()] || '';
        reason += `. Enriched with ${product.keyIngredient}${benefit ? ` ${benefit}` : ''}`;
    }
    
    return reason + '.';
  }
  
  function displayResults(routine) {
    // Update skin profile
    resultSkinType.textContent = capitalizeFirstLetter(userSelections.skinType);
    resultPrimaryConcern.textContent = capitalizeFirstLetter(userSelections.primaryConcern);
    resultSecondaryConcern.textContent = userSelections.secondaryConcern === 'none' ? 
      'None' : capitalizeFirstLetter(userSelections.secondaryConcern);
    
    // Update routine summary
    let stepsText = '';
    if (userSelections.steps === 'minimal') {
      stepsText = '3-4 step';
    } else if (userSelections.steps === 'moderate') {
      stepsText = '5-7 step';
    } else {
      stepsText = '8-10 step';
    }
    resultSteps.textContent = stepsText;
    
    // Set focus text based on skin type and concerns
    let focusText = '';
    if (userSelections.skinType === 'dry') {
      focusText = 'intense hydration and moisture retention';
    } else if (userSelections.skinType === 'oily') {
      focusText = 'balancing oil production and gentle hydration';
    } else if (userSelections.skinType === 'combination') {
      focusText = 'balancing different areas of your face while providing targeted treatment';
    } else if (userSelections.skinType === 'sensitive') {
      focusText = 'soothing and protecting your skin with gentle ingredients';
    } else {
      focusText = 'maintaining your skin\'s natural balance while addressing specific concerns';
    }
    
    if (userSelections.primaryConcern === 'acne') {
      focusText += ' while treating and preventing breakouts';
    } else if (userSelections.primaryConcern === 'aging') {
      focusText += ' while targeting fine lines and supporting firmness';
    } else if (userSelections.primaryConcern === 'hyperpigmentation') {
      focusText += ' while brightening dark spots and evening skin tone';
    } else if (userSelections.primaryConcern === 'dullness') {
      focusText += ' while boosting radiance and skin vitality';
    }
    
    resultFocus.textContent = focusText;
    
    // Display routine
    displayRoutine(routine);
  }
  
  function displayRoutine(routine) {
    if (!routine || !routine.morning || !routine.evening) {
        console.error('Invalid routine object:', routine);
        morningStepsContainer.innerHTML = '<p class="error-message">Unable to display routine. Please try again.</p>';
        eveningStepsContainer.innerHTML = '<p class="error-message">Unable to display routine. Please try again.</p>';
        return;
    }

    // Clear existing content
    morningStepsContainer.innerHTML = '';
    eveningStepsContainer.innerHTML = '';
    
    // Display morning routine
    if (Array.isArray(routine.morning) && routine.morning.length > 0) {
        routine.morning.forEach((routineItem, index) => {
            if (routineItem && routineItem.step && routineItem.product) {
                const stepElement = createStepElement(routineItem, index + 1);
                morningStepsContainer.appendChild(stepElement);
            }
        });
    } else {
        morningStepsContainer.innerHTML = '<p class="no-steps">No morning steps available for your selections.</p>';
    }
    
    // Display evening routine
    if (Array.isArray(routine.evening) && routine.evening.length > 0) {
        routine.evening.forEach((routineItem, index) => {
            if (routineItem && routineItem.step && routineItem.product) {
                const stepElement = createStepElement(routineItem, index + 1);
                eveningStepsContainer.appendChild(stepElement);
            }
        });
    } else {
        eveningStepsContainer.innerHTML = '<p class="no-steps">No evening steps available for your selections.</p>';
    }
  }
  
  function createStepElement(routineItem, stepNumber) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'routine-step';
    
    stepDiv.innerHTML = `
        <div class="step-number">${stepNumber}</div>
        <div class="step-content">
            <h3>${getStepTitle(routineItem.step)}</h3>
            <div class="product-info">
                <img src="${routineItem.product.imageUrl}" alt="${routineItem.product.name}" class="product-image">
                <div class="product-details">
                    <h4>${routineItem.product.name}</h4>
                    <p class="brand">${routineItem.product.brand}</p>
                    <p class="price">$${routineItem.product.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="product-benefits">
                <h4>Why This Product</h4>
                <p>${routineItem.why}</p>
            </div>
            ${routineItem.product.retailerLinks ? `
                <a href="${routineItem.product.retailerLinks[0].url}" target="_blank" class="shop-btn">
                    Shop at ${routineItem.product.retailerLinks[0].name}
                </a>
            ` : ''}
        </div>
    `;
    
    return stepDiv;
  }
  
  function checkIngredientCompatibility(product, currentStep) {
    const warnings = [];
    const conflicts = [];
    
    if (!product.ingredients || !window.ingredientDictionary?.ingredients) {
        return { warnings, conflicts };
    }
    
    // Get all ingredients from other products in the routine
    const routineProducts = [...generatedRoutine.morning, ...generatedRoutine.evening]
        .filter(item => item.step !== currentStep)
        .map(item => item.product);
    
    // Check each ingredient in the current product
    product.ingredients.forEach(ingredientName => {
        const ingredientId = getIngredientId(ingredientName);
        if (!ingredientId) return;
        
        const ingredient = window.ingredientDictionary.ingredients.find(i => i.id === ingredientId);
        if (!ingredient) return;
        
        // Add any cautions as warnings
        if (ingredient.cautions && ingredient.cautions.length > 0) {
            warnings.push({
                ingredient: ingredient.name,
                cautions: ingredient.cautions
            });
        }
        
        // Check for conflicts with other products
        routineProducts.forEach(otherProduct => {
            if (!otherProduct.ingredients) return;
            
            otherProduct.ingredients.forEach(otherIngredientName => {
                const otherId = getIngredientId(otherIngredientName);
                if (!otherId) return;
                
                if (ingredient.conflicts && ingredient.conflicts.includes(otherId)) {
                    conflicts.push({
                        ingredient: ingredient.name,
                        conflictsWith: otherIngredientName,
                        inProduct: otherProduct.name
                    });
                }
            });
        });
    });
    
    return { warnings, conflicts };
  }
  
  function createCompatibilityInfo(warnings, conflicts) {
    if (warnings.length === 0 && conflicts.length === 0) return '';
    
    let html = '<div class="compatibility-warnings">';
    
    if (warnings.length > 0) {
        html += `
            <div class="warning-section">
                <h4>Usage Notes</h4>
                <ul class="warning-list">
                    ${warnings.map(warning => `
                        <li>
                            <strong>${warning.ingredient}:</strong>
                            ${warning.cautions.map(caution => `<span>${caution}</span>`).join(', ')}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    if (conflicts.length > 0) {
        html += `
            <div class="conflict-section">
                <h4>Ingredient Interactions</h4>
                <ul class="conflict-list">
                    ${conflicts.map(conflict => `
                        <li>
                            <strong>${conflict.ingredient}</strong> may interact with 
                            <strong>${conflict.conflictsWith}</strong> 
                            (in ${conflict.inProduct}). Consider using these products at different times.
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
  }
  
  function createIngredientsList(ingredients) {
    if (!ingredients || ingredients.length === 0) return '';
    
    return `
        <div class="ingredients-section">
            <h4>Key Ingredients</h4>
            <div class="ingredients-list">
                ${ingredients.slice(0, 5).map(ingredient => {
                    const ingredientId = getIngredientId(ingredient);
                    return ingredientId ? 
                        `<a href="#" class="ingredient-link" data-ingredient-id="${ingredientId}">${ingredient}</a>` :
                        `<span>${ingredient}</span>`;
                }).join(', ')}
                ${ingredients.length > 5 ? `<span>and ${ingredients.length - 5} more...</span>` : ''}
            </div>
        </div>
    `;
  }
  
  function createKeyIngredientInfo(keyIngredient) {
    const ingredientId = getIngredientId(keyIngredient);
    if (!ingredientId) return '';
    
    return `
        <div class="key-ingredient">
            <h4>Star Ingredient</h4>
            <a href="#" class="ingredient-link" data-ingredient-id="${ingredientId}">${keyIngredient}</a>
        </div>
    `;
  }
  
  function getIngredientId(ingredientName) {
    // Convert ingredient name to potential ID format
    const potentialId = ingredientName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    
    // Check if this ingredient exists in our dictionary
    const dictionaryData = window.ingredientDictionary?.ingredients;
    if (!dictionaryData) return null;
    
    // Try to find the ingredient by ID or common names
    const ingredient = dictionaryData.find(ing => 
        ing.id === potentialId ||
        ing.commonNames.some(name => 
            name.toLowerCase() === ingredientName.toLowerCase()
        )
    );
    
    return ingredient ? ingredient.id : null;
  }
  
  function getStepTitle(stepCategory) {
    const stepTitles = {
      'cleanser': 'Cleanser',
      'oil-cleanser': 'Oil Cleanser',
      'water-cleanser': 'Water-Based Cleanser',
      'exfoliator': 'Exfoliator',
      'toner': 'Toner',
      'essence': 'Essence',
      'serum': 'Serum',
      'treatment': 'Treatment',
      'sheet-mask': 'Sheet Mask',
      'eye-cream': 'Eye Cream',
      'moisturizer': 'Moisturizer',
      'sunscreen': 'Sunscreen'
    };
    
    return stepTitles[stepCategory] || capitalizeFirstLetter(stepCategory.replace('-', ' '));
  }
  
  function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  function getSimilarConcerns(concern) {
    const concernGroups = {
      'acne': ['pores', 'texture', 'redness'],
      'aging': ['dryness', 'texture', 'dullness'],
      'hyperpigmentation': ['dullness', 'texture', 'aging'],
      'dryness': ['sensitivity', 'redness', 'aging'],
      'sensitivity': ['redness', 'dryness'],
      'dullness': ['hyperpigmentation', 'texture'],
      'texture': ['pores', 'dullness', 'acne'],
      'pores': ['texture', 'acne', 'oiliness'],
      'redness': ['sensitivity', 'dryness']
    };
    
    return concernGroups[concern] || [];
  }

  // Rename provideFallbackRoutine to useFallbackRoutine
  function useFallbackRoutine(userSelections) {
    const fallbackProducts = {
        'cleanser': {
            name: "Gentle Hydrating Cleanser",
            brand: "COSRX",
            category: "cleanser",
            price: 15.99,
            imageUrl: "/img/products/product-placeholder.svg",
            goodFor: ["all", "sensitive", "dry"],
            description: "A gentle cleanser suitable for all skin types"
        },
        'oil-cleanser': {
            name: "Rice Water Bright Cleansing Oil",
            brand: "The Face Shop",
            category: "oil-cleanser",
            price: 15.99,
            imageUrl: "/img/products/face-shop-cleansing-oil.jpg",
            goodFor: ["all", "dry", "sensitive"],
            description: "A gentle oil cleanser that effectively removes makeup and impurities"
        },
        'water-cleanser': {
            name: "Blueberry pH 4.5 Cleansing Foam",
            brand: "innisfree",
            category: "water-cleanser",
            price: 11.00,
            imageUrl: "/img/products/innisfree-blueberry-cleansing.jpg",
            goodFor: ["all", "sensitive"],
            description: "A low pH cleanser that maintains skin barrier health"
        },
        'toner': {
            name: "Propolis Synergy Toner",
            brand: "COSRX",
            category: "toner",
            price: 22.00,
            imageUrl: "/img/products/cosrx-propolis-toner.jpg",
            goodFor: ["all", "dry", "sensitive"],
            description: "A hydrating toner with propolis extract"
        },
        'serum': {
            name: "Glass Skin Refining Serum",
            brand: "Peach & Lily",
            category: "serum",
            price: 39.00,
            imageUrl: "/img/products/peach-lily-glass-skin.jpg",
            goodFor: ["all", "dry", "aging"],
            description: "A multi-tasking serum for glass skin"
        },
        'essence': {
            name: "Snail 96 Mucin Power Essence",
            brand: "COSRX",
            category: "essence",
            price: 25.00,
            imageUrl: "/img/products/cosrx-snail-essence.jpg",
            goodFor: ["all", "dry", "sensitive"],
            description: "A hydrating essence with 96% snail mucin"
        },
        'moisturizer': {
            name: "Advanced Snail 92 All in One Cream",
            brand: "COSRX",
            category: "moisturizer",
            price: 24.00,
            imageUrl: "/img/products/product-placeholder.svg",
            goodFor: ["all", "dry", "sensitive"],
            description: "A moisturizing cream with snail mucin"
        },
        'sunscreen': {
            name: "Daily UV Protection Sunscreen",
            brand: "innisfree",
            category: "sunscreen",
            price: 15.00,
            imageUrl: "/img/products/innisfree-daily-sunscreen.jpg",
            goodFor: ["all"],
            description: "A lightweight daily sunscreen with SPF 36"
        }
    };

    const morningSteps = getRoutineSteps('morning', userSelections.steps);
    const eveningSteps = getRoutineSteps('evening', userSelections.steps);

    const morningRoutine = morningSteps.map(step => ({
        step,
        product: fallbackProducts[step],
        timeOfDay: 'morning',
        why: `A gentle ${step} suitable for ${userSelections.skinType} skin`
    }));

    const eveningRoutine = eveningSteps.map(step => ({
        step,
        product: fallbackProducts[step],
        timeOfDay: 'evening',
        why: `A gentle ${step} suitable for ${userSelections.skinType} skin`
    }));

    return {
        morning: morningRoutine.filter(item => item.product),
        evening: eveningRoutine.filter(item => item.product)
    };
  }
  
  function generateOptimizationSuggestions(product, routineItem, warnings, conflicts) {
    if (!product.ingredients || !window.ingredientDictionary?.ingredients) {
        return '';
    }

    const suggestions = [];
    const timeOfDay = routineItem.step === 'sunscreen' ? 'morning' : 
        (routineItem.step === 'oil-cleanser' ? 'evening' : 'both');
    
    // Get ingredient properties
    const ingredientProperties = getIngredientProperties(product.ingredients);
    
    // Add step-specific timing suggestions
    const stepTiming = getStepTimingSuggestions(routineItem.step, ingredientProperties);
    if (stepTiming) {
        suggestions.push({
            type: 'timing',
            text: stepTiming
        });
    }

    // Add pH-based suggestions
    if (ingredientProperties.phDependentIngredients.length > 0) {
        const phSuggestion = generatePhSuggestion(
            ingredientProperties.phDependentIngredients,
            routineItem.step
        );
        suggestions.push({
            type: 'ph',
            text: phSuggestion
        });
    }

    // Add time of day optimization
    if (ingredientProperties.timeSensitiveIngredients.length > 0) {
        const timeRecommendation = generateTimeRecommendation(
            ingredientProperties.timeSensitiveIngredients,
            timeOfDay,
            userSelections.skinType
        );
        suggestions.push({
            type: 'timeOfDay',
            text: timeRecommendation
        });
    }

    // Add concentration and frequency suggestions
    if (ingredientProperties.potentIngredients.length > 0) {
        const concentrationSuggestion = generateConcentrationSuggestion(
            ingredientProperties.potentIngredients,
            userSelections.skinType,
            routineItem.step
        );
        suggestions.push({
            type: 'concentration',
            text: concentrationSuggestion
        });
    }

    // Add layering suggestions based on conflicts
    if (conflicts.length > 0) {
        const layeringSuggestion = generateLayeringSuggestion(conflicts, routineItem.step);
        suggestions.push({
            type: 'layering',
            text: layeringSuggestion
        });
    }

    if (suggestions.length === 0) return '';

    return `
        <div class="optimization-suggestions">
            <h4>Optimization Tips</h4>
            <ul class="suggestions-list">
                ${suggestions.map(suggestion => `
                    <li class="suggestion-${suggestion.type}">
                        ${suggestion.text}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
  }
  
  function getIngredientProperties(ingredients) {
    const properties = {
        phDependentIngredients: [],
        timeSensitiveIngredients: [],
        potentIngredients: [],
        moisturizingIngredients: [],
        exfoliatingIngredients: []
    };

    ingredients.forEach(ingredientName => {
        const ingredientId = getIngredientId(ingredientName);
        if (!ingredientId) return;
        
        const ingredient = window.ingredientDictionary.ingredients.find(i => i.id === ingredientId);
        if (!ingredient) return;

        if (ingredient.phSensitive) {
            properties.phDependentIngredients.push(ingredient.name);
        }
        if (ingredient.timeOfDay && ingredient.timeOfDay !== 'both') {
            properties.timeSensitiveIngredients.push(ingredient.name);
        }
        if (ingredient.maxConcentration || ingredient.potency === 'high') {
            properties.potentIngredients.push(ingredient.name);
        }
        if (ingredient.categories.includes('humectant') || ingredient.categories.includes('emollient')) {
            properties.moisturizingIngredients.push(ingredient.name);
        }
        if (ingredient.categories.includes('exfoliant')) {
            properties.exfoliatingIngredients.push(ingredient.name);
        }
    });

    return properties;
  }
  
  function getStepTimingSuggestions(step, properties) {
    const timingMap = {
        'oil-cleanser': 'Massage gently for 1-2 minutes to dissolve oil-based impurities.',
        'water-cleanser': 'Cleanse for 30-60 seconds, avoiding harsh rubbing.',
        'exfoliator': properties.exfoliatingIngredients.length > 0 ? 
            'Use gentle circular motions for 30 seconds. If sensitivity occurs, reduce frequency.' : 
            'Use 2-3 times per week, adjusting based on skin sensitivity.',
        'toner': 'Apply immediately after cleansing while skin is still slightly damp.',
        'essence': 'Pat gently into skin until fully absorbed.',
        'serum': 'Allow 1-2 minutes between different serums for optimal absorption.',
        'treatment': 'Apply to clean, dry skin and wait 2-3 minutes before next product.',
        'sheet-mask': 'Leave on for 15-20 minutes, do not exceed 30 minutes.',
        'eye-cream': 'Use gentle patting motions, avoid pulling the delicate eye area.',
        'moisturizer': properties.moisturizingIngredients.length > 0 ?
            'Apply while skin is slightly damp to lock in hydration.' :
            'Apply evenly and allow 2-3 minutes to absorb.',
        'sunscreen': 'Apply as final step, wait 10-15 minutes before makeup application.'
    };

    return timingMap[step] || null;
  }
  
  function generatePhSuggestion(phDependentIngredients, step) {
    const isExfoliating = step === 'exfoliator' || step === 'treatment';
    const isAcidic = phDependentIngredients.some(ing => 
        ing.toLowerCase().includes('acid') || ing.toLowerCase().includes('vitamin c')
    );

    if (isExfoliating && isAcidic) {
        return `Wait 20-30 minutes after applying ${phDependentIngredients.join(', ')} before using other products to maintain optimal pH level and prevent irritation.`;
    } else if (isAcidic) {
        return `For optimal effectiveness of ${phDependentIngredients.join(', ')}, apply to clean skin and wait 10-15 minutes before next product.`;
    } else {
        return `To maximize the benefits of ${phDependentIngredients.join(', ')}, apply after any acidic treatments have fully absorbed.`;
    }
  }
  
  function generateTimeRecommendation(timeSensitiveIngredients, timeOfDay, skinType) {
    const isRetinol = timeSensitiveIngredients.some(ing => 
        ing.toLowerCase().includes('retinol') || ing.toLowerCase().includes('vitamin a')
    );
    const isVitaminC = timeSensitiveIngredients.some(ing => 
        ing.toLowerCase().includes('vitamin c') || ing.toLowerCase().includes('ascorbic')
    );

    if (isRetinol) {
        return `Best used in the evening. ${skinType === 'sensitive' ? 'Start with twice weekly application.' : 'Start with every other night application.'} Gradually increase frequency as tolerated.`;
    } else if (isVitaminC) {
        return 'Most effective when used in the morning, helping to protect skin against environmental damage throughout the day.';
    } else {
        return `Optimal use time is ${timeOfDay === 'morning' ? 'morning' : 'evening'} for ${timeSensitiveIngredients.join(', ')}.`;
    }
  }
  
  function generateConcentrationSuggestion(potentIngredients, skinType, step) {
    const isSensitive = skinType === 'sensitive';
    const isExfoliating = step === 'exfoliator' || step === 'treatment';

    if (isExfoliating && isSensitive) {
        return `Due to your sensitive skin, start using ${potentIngredients.join(', ')} once weekly and gradually increase frequency based on your skin's response.`;
    } else if (isExfoliating) {
        return `Start with twice weekly application of ${potentIngredients.join(', ')} and increase frequency as tolerated, up to every other day.`;
    } else if (isSensitive) {
        return `For sensitive skin, use a small amount of product containing ${potentIngredients.join(', ')} and monitor skin's response.`;
    } else {
        return `Start with a small amount of product to test skin's reaction to ${potentIngredients.join(', ')}. Increase amount gradually if no sensitivity occurs.`;
    }
  }
  
  function generateLayeringSuggestion(conflicts, step) {
    const conflictGroups = conflicts.reduce((groups, conflict) => {
        const group = groups.find(g => g.products.includes(conflict.inProduct));
        if (group) {
            if (!group.products.includes(conflict.inProduct)) {
                group.products.push(conflict.inProduct);
            }
            if (!group.ingredients.includes(conflict.ingredient)) {
                group.ingredients.push(conflict.ingredient);
            }
        } else {
            groups.push({
                products: [conflict.inProduct],
                ingredients: [conflict.ingredient]
            });
        }
        return groups;
    }, []);

    return conflictGroups.map(group => 
        `To avoid interactions between ${group.ingredients.join(', ')}, wait 20-30 minutes between using this product and ${group.products.join(', ')}.`
    ).join(' ');
  }
  
  function findAlternativeProducts(product, products, stepCategory) {
    // Find products in the same category or alternative categories
    return products.filter(p => {
        if (p.id === product.id) return false;
        return p.category === stepCategory || 
               (getAlternativeCategory(stepCategory) && p.category === getAlternativeCategory(stepCategory));
    }).slice(0, 3); // Limit to top 3 alternatives
  }
  
  function generateScoringBreakdown(product, products, stepCategory) {
    const score = scoreBestProduct([product])[0];
    const alternatives = findAlternativeProducts(product, products, stepCategory);
    const alternativeScores = scoreBestProduct(alternatives);
    
    let breakdown = `
        <div class="scoring-details">
            <h5>Product Selection Score: ${score.total.toFixed(1)}</h5>
            
            <div class="score-category">
                <div class="score-header">
                    <span class="category-name">Ingredient Compatibility</span>
                    <span class="category-score">+${score.ingredientScore.toFixed(1)}</span>
                </div>
                <ul class="score-details">
                    <li>Contains ${score.beneficialIngredients} beneficial ingredients</li>
                    <li>Matches ${score.concernMatches} of your skin concerns</li>
                    ${score.cautions ? `<li>Note: ${score.cautions} potential cautions to consider</li>` : ''}
                </ul>
            </div>

            <div class="score-category">
                <div class="score-header">
                    <span class="category-name">Skin Type Match</span>
                    <span class="category-score">+${score.skinTypeScore.toFixed(1)}</span>
                </div>
                <ul class="score-details">
                    <li>Formulated for ${userSelections.skinType} skin</li>
                    ${score.extraTypePoints ? '<li>Extra points for specialized formulation</li>' : ''}
                </ul>
            </div>

            <div class="score-category">
                <div class="score-header">
                    <span class="category-name">Budget Match</span>
                    <span class="category-score">+${score.budgetScore.toFixed(1)}</span>
                </div>
                <ul class="score-details">
                    <li>Matches your ${userSelections.budget} price preference</li>
                </ul>
            </div>

            ${alternatives.length > 0 ? `
            <div class="score-category alternatives-comparison">
                <div class="score-header">
                    <span class="category-name">Compared to Alternatives</span>
                </div>
                <ul class="score-details">
                    ${alternatives.map((alt, i) => `
                        <li>${alt.brand} ${alt.name}: ${alternativeScores[i].total.toFixed(1)} points
                            ${alternativeScores[i].total < score.total ? 
                                `(${(score.total - alternativeScores[i].total).toFixed(1)} points lower)` :
                                `(${(alternativeScores[i].total - score.total).toFixed(1)} points higher)`}
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
    
    return breakdown;
  }
  
  function getRoutineSteps(timeOfDay, complexity) {
    const baseSteps = {
      morning: ['cleanser', 'toner', 'moisturizer', 'sunscreen'],
      evening: ['oil-cleanser', 'water-cleanser', 'toner', 'moisturizer']
    };

    const additionalSteps = {
      morning: ['essence', 'serum', 'eye-cream'],
      evening: ['essence', 'serum', 'treatment', 'eye-cream', 'sheet-mask']
    };

    let steps = [...baseSteps[timeOfDay]];

    switch(complexity) {
      case 'minimal':
        // Keep only essential steps
        if (timeOfDay === 'morning') {
          steps = ['cleanser', 'moisturizer', 'sunscreen'];
        } else {
          steps = ['oil-cleanser', 'water-cleanser', 'moisturizer'];
        }
        break;
      case 'moderate':
        // Add a few treatment steps
        if (timeOfDay === 'morning') {
          steps.splice(2, 0, 'serum');
        } else {
          steps.splice(3, 0, 'serum', 'treatment');
        }
        break;
      case 'complete':
        // Add all treatment steps
        if (timeOfDay === 'morning') {
          steps.splice(2, 0, ...additionalSteps.morning);
        } else {
          steps.splice(3, 0, ...additionalSteps.evening);
        }
        break;
    }

    return steps;
  }
  
  // === Initialization ===
  // Check for saved routine
  if (localStorage.getItem('kbeauty-routine')) {
    try {
      const savedData = JSON.parse(localStorage.getItem('kbeauty-routine'));
      
      // Check if saved data is still valid (not older than 30 days)
      const savedDate = new Date(savedData.timestamp || Date.now());
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate - savedDate) / (1000 * 60 * 60 * 24));
      
      if (daysDifference <= 30 && savedData.selections && savedData.routine) {
        userSelections = savedData.selections;
        generatedRoutine = savedData.routine;
        
        // Display saved routine
        displayResults();
        displayRoutine();
        
        // Show results section
        introSection.classList.remove('active-section');
        introSection.classList.add('hidden-section');
        resultsSection.classList.remove('hidden-section');
        resultsSection.classList.add('active-section');
      } else {
        // Data is too old or invalid, remove it
        localStorage.removeItem('kbeauty-routine');
      }
    } catch (e) {
      console.error('Error loading saved routine:', e);
      localStorage.removeItem('kbeauty-routine');
    }
  }

  // Add updatePreviewPanel function
  function updatePreviewPanel(questionId, value) {
    const previewPanel = document.querySelector('.preview-panel');
    if (!previewPanel) return;

    // Update the selected value
    const previewItem = previewPanel.querySelector(`[data-question="${questionId}"]`);
    if (previewItem) {
        const valueDisplay = previewItem.querySelector('.preview-value');
        if (valueDisplay) {
            valueDisplay.textContent = formatPreviewValue(questionId, value);
            previewItem.classList.add('updated');
            setTimeout(() => previewItem.classList.remove('updated'), 1000);
        }
    }

    // Update progress
    updateProgressIndicator();

    // Show compatibility tips if we have enough information
    if (hasEnoughInfoForTips()) {
        showCompatibilityTips();
    }

    // Show recommendation preview if all required fields are filled
    if (hasAllRequiredSelections()) {
        showRecommendationPreview();
    }
  }

  function formatPreviewValue(questionId, value) {
    switch (questionId) {
        case 'skinType':
            return capitalizeFirstLetter(value);
        case 'primaryConcern':
        case 'secondaryConcern':
            return value === 'none' ? 'None' : capitalizeFirstLetter(value);
        case 'budget':
            return {
                'budget': 'Budget-friendly',
                'mid': 'Mid-range',
                'premium': 'Premium'
            }[value] || value;
        case 'steps':
            return {
                'minimal': 'Essential steps',
                'moderate': 'Standard routine',
                'complete': 'Complete care'
            }[value] || value;
        default:
            return value;
    }
  }

  function updateProgressIndicator() {
    const totalQuestions = 5;
    const answeredQuestions = Object.keys(userSelections).filter(key => userSelections[key]).length;
    const progress = (answeredQuestions / totalQuestions) * 100;

    const progressBar = document.querySelector('.preview-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
  }

  function hasEnoughInfoForTips() {
    return userSelections.skinType && userSelections.primaryConcern;
  }

  function showCompatibilityTips() {
    const tipsContainer = document.querySelector('.compatibility-tips');
    if (!tipsContainer) return;

    const tips = getCompatibilityTips(userSelections);
    
    tipsContainer.innerHTML = `
        <h4>Personalized Tips</h4>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;
    
    tipsContainer.style.display = 'block';
  }

  function showRecommendationPreview() {
    const previewContainer = document.querySelector('.recommendation-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
        <div class="preview-summary">
            <h4>Your Personalized Routine</h4>
            <p>Based on your selections, we'll create a ${userSelections.steps} routine 
               focused on ${userSelections.primaryConcern} 
               ${userSelections.secondaryConcern !== 'none' ? `and ${userSelections.secondaryConcern}` : ''} 
               for your ${userSelections.skinType} skin.</p>
        </div>
    `;
    
    previewContainer.style.display = 'block';
  }

  function hasAllRequiredSelections() {
    const required = ['skinType', 'primaryConcern', 'budget', 'steps'];
    return required.every(field => userSelections[field]);
  }

  function getCompatibilityTips(selections) {
    const tips = [];
    
    if (selections.skinType === 'sensitive' && selections.primaryConcern === 'acne') {
        tips.push('We\'ll focus on gentle acne treatments suitable for sensitive skin');
    }
    
    if (selections.skinType === 'dry' && selections.primaryConcern === 'aging') {
        tips.push('Extra hydration will help improve the effectiveness of anti-aging ingredients');
    }
    
    if (selections.budget === 'budget' && selections.steps === 'complete') {
        tips.push('We\'ll help you build a complete routine with affordable options');
    }
    
    return tips;
  }

  function getIngredientConcentration(ingredient) {
    if (!ingredient || typeof ingredient !== 'string') return null;
    
    // Extract concentration from ingredient name if present (e.g., "2% BHA", "10% Niacinamide")
    const concentrationMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*%/);
    if (concentrationMatch) {
        return parseFloat(concentrationMatch[1]);
    }
    
    // Check ingredient dictionary for recommended concentrations
    const ingredientId = getIngredientId(ingredient);
    if (!ingredientId) return null;
    
    const ingredientData = window.ingredientDictionary?.ingredients.find(i => i.id === ingredientId);
    if (!ingredientData?.concentration?.recommended) return null;
    
    return ingredientData.concentration.recommended;
  }

  function isEffectiveConcentration(concentration) {
    if (concentration === null || typeof concentration !== 'number') return true;
    return concentration > 0 && concentration <= 100;
  }

  function analyzeIngredientEffectiveness(product) {
    if (!product || !product.ingredients) {
        return 0.5; // Default score for products without ingredient data
    }

    let effectivenessScore = 0;
    let totalIngredients = 0;

    product.ingredients.forEach(ingredient => {
        const concentration = getIngredientConcentration(ingredient);
        if (isEffectiveConcentration(concentration)) {
            effectivenessScore += 1;
        }
        totalIngredients++;
    });

    // Return normalized score between 0 and 1
    return totalIngredients > 0 ? effectivenessScore / totalIngredients : 0.5;
  }

  function adjustForSeason(recommendations) {
    const season = getCurrentSeason();
    const humidity = getLocalHumidity();
    
    return recommendations.map(product => {
        let seasonalScore = product.score;
        
        // Adjust for seasonal factors
        if (season === 'summer' && product.isLightweight) {
            seasonalScore *= 1.2;
        } else if (season === 'winter' && product.isRich) {
            seasonalScore *= 1.2;
        }
        
        // Adjust for humidity
        if (humidity < 30 && product.isHydrating) {
            seasonalScore *= 1.15;
        } else if (humidity > 70 && product.isLightweight) {
            seasonalScore *= 1.15;
        }
        
        return {...product, score: seasonalScore};
    });
  }

  function enhancePersonalization(routine) {
    // Track user preferences over time
    const userHistory = getUserProductHistory();
    const preferences = analyzePreferences(userHistory);
    
    // Adjust recommendations based on preferences
    return routine.map(step => {
        const adjustedProducts = step.products.map(product => {
            let personalizedScore = product.score;
            
            // Adjust for brand preferences
            if (preferences.preferredBrands.includes(product.brand)) {
                personalizedScore *= 1.1;
            }
            
            // Adjust for texture preferences
            if (preferences.preferredTextures.includes(product.texture)) {
                personalizedScore *= 1.1;
            }
            
            return {...product, score: personalizedScore};
        });
        
        return {...step, products: adjustedProducts};
    });
  }

  // Add product management functions
  async function addProduct(product) {
    try {
        const response = await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add product');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
  }

  async function updateProduct(id, updates) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
  }

  async function deleteProduct(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
  }

  // Enhanced product management with real-time updates
  async function initializeProductDatabase() {
    try {
        // First try to fetch from local API
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
            throw new Error('Local API unavailable');
        }
        const data = await response.json();
        return data.products;
    } catch (localError) {
        // Fallback to static JSON if API fails
        console.log('Falling back to static product data');
        try {
            const staticResponse = await fetch('/data/products.json');
            if (!staticResponse.ok) {
                throw new Error('Static data unavailable');
            }
            const staticData = await staticResponse.json();
            return staticData.products;
        } catch (staticError) {
            console.error('Failed to load products:', staticError);
            return getDefaultProducts();
        }
    }
  }

  // Set up WebSocket connection for real-time product updates
  function setupProductUpdates() {
    try {
        const ws = new WebSocket('ws://localhost:3000/products');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            handleProductUpdate(update);
        };
        
        ws.onerror = (error) => {
            console.log('WebSocket error, falling back to polling:', error);
            // Fallback to polling every 5 minutes
            setInterval(pollProductUpdates, 300000);
        };
    } catch (error) {
        console.log('WebSocket not supported, using polling');
        setInterval(pollProductUpdates, 300000);
    }
  }

  async function pollProductUpdates() {
    try {
        const response = await fetch('http://localhost:3000/api/products/updates');
        if (!response.ok) throw new Error('Update check failed');
        
        const updates = await response.json();
        updates.forEach(handleProductUpdate);
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
  }

  function handleProductUpdate(update) {
    const cachedProducts = JSON.parse(localStorage.getItem('cached_products') || '[]');
    
    switch(update.type) {
        case 'add':
            cachedProducts.push(update.product);
            break;
        case 'update':
            const index = cachedProducts.findIndex(p => p.id === update.product.id);
            if (index !== -1) {
                cachedProducts[index] = update.product;
            }
            break;
        case 'delete':
            const deleteIndex = cachedProducts.findIndex(p => p.id === update.productId);
            if (deleteIndex !== -1) {
                cachedProducts.splice(deleteIndex, 1);
            }
            break;
    }
    
    localStorage.setItem('cached_products', JSON.stringify(cachedProducts));
    
    // If the user has an active routine, check if it needs updating
    if (generatedRoutine.morning.length > 0 || generatedRoutine.evening.length > 0) {
        checkRoutineForUpdates(update);
    }
  }

  function checkRoutineForUpdates(update) {
    let needsUpdate = false;
    
    // Check if any products in the current routine are affected
    [...generatedRoutine.morning, ...generatedRoutine.evening].forEach(step => {
        if (step.product.id === (update.product?.id || update.productId)) {
            needsUpdate = true;
        }
    });
    
    if (needsUpdate) {
        // Show update notification to user
        showUpdateNotification({
            message: 'Product updates available for your routine. Would you like to refresh your recommendations?',
            action: () => generateRoutine() // Regenerate routine with updated products
        });
    }
  }

  function showUpdateNotification(options) {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <p>${options.message}</p>
        <div class="notification-actions">
            <button class="update-now">Update Now</button>
            <button class="update-later">Later</button>
        </div>
    `;
    
    notification.querySelector('.update-now').addEventListener('click', () => {
        options.action();
        notification.remove();
    });
    
    notification.querySelector('.update-later').addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
  }

  // Initialize product database and setup real-time updates
  document.addEventListener('DOMContentLoaded', async () => {
    await initializeProductDatabase();
    setupProductUpdates();
  });
});
