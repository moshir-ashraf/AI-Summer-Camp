// Deep Learning Task JavaScript

// Configure TensorFlow.js to use CPU backend to avoid WebGL shader issues
async function configureTensorFlow() {
    try {
        console.log('Configuring TensorFlow.js...');
        
        // Try to set the backend to CPU to avoid WebGL issues
        await tf.setBackend('cpu');
        
        // Wait for backend to be ready
        await tf.ready();
        
        console.log('TensorFlow.js backend set to:', tf.getBackend());
        console.log('TensorFlow.js version:', tf.version.tfjs);
        
        // Log system info
        const memoryInfo = tf.memory();
        console.log('Initial memory state:', memoryInfo);
        
        // Check if WebGL is available (but we're using CPU)
        const hasWebGL = tf.ENV.get('WEBGL_VERSION') > 0;
        console.log('WebGL available:', hasWebGL);
        
        return true;
    } catch (error) {
        console.warn('Could not configure TensorFlow.js properly:', error);
        console.log('Attempting to continue with default backend...');
        return false;
    }
}

// Gallery functionality
let slideIndices = {
    thanos: 1,
    grimace: 1
};

const galleryImages = {
    thanos: [
        '/images/DL/thanos/thanos_(28).jpg',
        '/images/DL/thanos/thanos_(29).jpg',
        '/images/DL/thanos/thanos_(41).jpg',
        '/images/DL/thanos/thanos_(21).jpg',
        '/images/DL/thanos/thanos_(32).jpg'
    ],
    grimace: [
        '/images/DL/grimace/grimace_(176).jpg',
        '/images/DL/grimace/grimace_(202).jpg',
        '/images/DL/grimace/grimace_(44).jpg',
        '/images/DL/grimace/grimace_(19).jpg',
        '/images/DL/grimace/grimace_(26).jpg'
    ]
};

// Gallery navigation functions
function changeSlide(gallery, direction) {
    slideIndices[gallery] += direction;
    const maxSlides = galleryImages[gallery].length;
    
    if (slideIndices[gallery] > maxSlides) {
        slideIndices[gallery] = 1;
    }
    if (slideIndices[gallery] < 1) {
        slideIndices[gallery] = maxSlides;
    }
    
    updateGallery(gallery);
}

function showSlide(gallery, slideNumber) {
    slideIndices[gallery] = slideNumber;
    updateGallery(gallery);
}

function updateGallery(gallery) {
    const mainSlide = document.getElementById(`${gallery}-main-slide`);
    const mainImage = mainSlide.querySelector('.main-image');
    const numberText = mainSlide.querySelector('.numbertext');
    const thumbnails = document.querySelectorAll(`[onclick*="${gallery}"]`);
    
    // Update main image
    const currentIndex = slideIndices[gallery] - 1;
    mainImage.src = galleryImages[gallery][currentIndex];
    mainImage.alt = `${gallery} sample ${slideIndices[gallery]}`;
    
    // Update number text
    numberText.textContent = `${slideIndices[gallery]} / ${galleryImages[gallery].length}`;
    
    // Update thumbnail active states
    thumbnails.forEach((thumb, index) => {
        if (thumb.tagName === 'IMG') {
            thumb.classList.remove('active');
            if (index === currentIndex) {
                thumb.classList.add('active');
            }
        }
    });
}

class DeepLearningTask {
    constructor() {
        this.model = null;
        this.trainData = null;
        this.testData = null;
        this.testImages = null;
        this.layers = [];
        this.isTraining = false;
        this.isModelBuilt = false;
        this.modelPerformance = null;
        this.trainingHistory = {
            epochs: [],
            trainLoss: [],
            trainAccuracy: [],
            valLoss: [],
            valAccuracy: []
        };
        this.overfittingWarningShown = false;
        
        // Generate a session-specific seed for consistent randomization
        this.sessionSeed = this.generateUserSeed();
        this.randomSeedCounter = 0;
        
        console.log('Session seed:', this.sessionSeed);
        
        this.init();
    }

    async init() {
        console.log('Initializing Deep Learning Task...');
        
        // Load sample images for preview
        await this.loadImagePreviews();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Add output layer automatically
        this.addOutputLayer();
        
        // Create initial network visualization
        this.createNetworkVisualizationContainer();
        this.updateNetworkVisualization();
        
        // Load and prepare dataset
        await this.loadDataset();
        
        console.log('Deep Learning Task initialized successfully');
    }

    async loadImagePreviews() {
        try {
            // Gallery images are already loaded in the HTML template
            // No need to load random images - the slideshow uses fixed gallery images
            console.log('Gallery images are pre-loaded in the template');
            
        } catch (error) {
            console.warn('Could not load image previews:', error);
        }
    }

    setupEventListeners() {
        // Layer buttons
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layerType = e.currentTarget.getAttribute('data-layer');
                this.showLayerModal(layerType);
            });
        });

        // Training controls
        document.getElementById('train-btn').addEventListener('click', () => {
            this.trainModel();
        });

        document.getElementById('test-btn').addEventListener('click', () => {
            this.testModel();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetNetwork();
        });

        // Modal controls
        document.getElementById('modal-close').addEventListener('click', () => {
            this.hideLayerModal();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.hideLayerModal();
        });

        document.getElementById('modal-confirm').addEventListener('click', () => {
            this.addLayerFromModal();
        });

        // Close modal on overlay click
        document.getElementById('layer-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideLayerModal();
            }
        });
    }

    async loadDataset() {
        this.showLoading('Loading dataset...');
        
        try {
            console.log('Loading dataset...');
            
            // Generate randomized image sets for each student
            const randomizedImages = this.generateRandomizedImageSet();
            
            this.testImages = {
                thanos: randomizedImages.thanos,
                grimace: randomizedImages.grimace,
                grimos: randomizedImages.grimos
            };
            
            console.log('Dataset loaded successfully with randomized images');
            console.log('Test images ready for evaluation:', this.testImages);
            
            // Show notification about randomized dataset
            this.showNotification('Dataset loaded with your unique randomized image set!', 'info');
            
        } catch (error) {
            console.error('Error loading dataset:', error);
            this.showNotification('Error loading dataset paths.', 'warning');
        } finally {
            this.hideLoading();
        }
    }

    generateRandomizedImageSet() {
        // Create pools of available images
        const thanosPool = [];
        const grimacePool = [];
        
        // Generate Thanos image pool (using a large range for variety)
        // Splitting into ranges to ensure good distribution
        const thanosRanges = [
            { start: 1, end: 30 },
            { start: 31, end: 60 },
            { start: 61, end: 90 },
            { start: 91, end: 120 },
            { start: 121, end: 150 }
        ];
        
        thanosRanges.forEach(range => {
            for (let i = range.start; i <= range.end; i++) {
                thanosPool.push(`/images/DL/thanos/thanos_(${i}).jpg`);
            }
        });
        
        // Generate Grimace image pool with same ranges
        const grimaceRanges = [
            { start: 1, end: 30 },
            { start: 31, end: 60 },
            { start: 61, end: 90 },
            { start: 91, end: 120 },
            { start: 121, end: 150 }
        ];
        
        grimaceRanges.forEach(range => {
            for (let i = range.start; i <= range.end; i++) {
                grimacePool.push(`/images/DL/grimace/grimace_(${i}).jpg`);
            }
        });
        
        // Fixed grimos images (all 4 available)
        const grimosImages = [
            '/images/DL/_grimos/grimos_(1).jpg',
            '/images/DL/_grimos/grimos_(2).jpg',
            '/images/DL/_grimos/grimos_(3).jpg',
            '/images/DL/_grimos/grimos_(4).jpg'
        ];
        
        // Randomly select images ensuring good distribution
        const selectedThanos = this.selectDistributedImages(thanosPool, thanosRanges, 5);
        const selectedGrimace = this.selectDistributedImages(grimacePool, grimaceRanges, 5);
        
        console.log('Selected randomized image sets:');
        console.log('Thanos images:', selectedThanos);
        console.log('Grimace images:', selectedGrimace);
        
        return {
            thanos: selectedThanos,
            grimace: selectedGrimace,
            grimos: grimosImages
        };
    }

    selectDistributedImages(pool, ranges, count) {
        // Select images from different ranges to ensure variety
        const selected = [];
        const shuffledRanges = this.shuffleArray([...ranges]);
        
        for (let i = 0; i < count && i < shuffledRanges.length; i++) {
            const range = shuffledRanges[i];
            const rangeImages = pool.filter(img => {
                const match = img.match(/\((\d+)\)/);
                if (match) {
                    const num = parseInt(match[1]);
                    return num >= range.start && num <= range.end;
                }
                return false;
            });
            
            if (rangeImages.length > 0) {
                const shuffledRange = this.shuffleArray(rangeImages);
                selected.push(shuffledRange[0]);
            }
        }
        
        // If we need more images and have fewer ranges, add random ones
        while (selected.length < count) {
            const remaining = pool.filter(img => !selected.includes(img));
            if (remaining.length > 0) {
                const shuffledRemaining = this.shuffleArray(remaining);
                selected.push(shuffledRemaining[0]);
            } else {
                break;
            }
        }
        
        return selected;
    }

    shuffleArray(array) {
        // Fisher-Yates shuffle algorithm with seeded random
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.seededRandom() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    seededRandom() {
        // Simple seeded random number generator (Linear Congruential Generator)
        this.randomSeedCounter++;
        const seed = this.sessionSeed + this.randomSeedCounter;
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    generateUserSeed() {
        // Create a seed based on user session and timestamp
        const userAgent = navigator.userAgent;
        const timestamp = Date.now();
        const randomComponent = Math.random();
        
        // Simple hash function
        let hash = 0;
        const seedString = userAgent + timestamp + randomComponent;
        for (let i = 0; i < seedString.length; i++) {
            const char = seedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash);
    }

    showLayerModal(layerType) {
        const modal = document.getElementById('layer-modal-overlay');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Add ${this.getLayerDisplayName(layerType)} Layer`;
        body.innerHTML = this.getLayerConfigHTML(layerType);
        
        modal.style.display = 'flex';
        modal.setAttribute('data-layer-type', layerType);
    }

    hideLayerModal() {
        document.getElementById('layer-modal-overlay').style.display = 'none';
    }

    getLayerDisplayName(layerType) {
        const names = {
            'dense': 'Dense',
            'conv2d': 'Conv2D',
            'maxpool': 'MaxPool2D',
            'flatten': 'Flatten',
            'dropout': 'Dropout'
        };
        return names[layerType] || layerType;
    }

    getLayerConfigHTML(layerType) {
        switch (layerType) {
            case 'dense':
                return `
                    <div class="layer-description">
                        <p><strong>Dense (Fully Connected) Layer</strong></p>
                        <p>Dense layers connect every neuron to all neurons in the previous layer. They're great for learning complex relationships between features after image processing is done. Use dense layers after flattening convolutional features.</p>
                        <p><em>Best for:</em> Final classification, learning complex patterns from processed features.</p>
                    </div>
                    <div class="form-group">
                        <label for="dense-units">Number of Neurons:</label>
                        <select id="dense-units">
                            <option value="32">32 neurons</option>
                            <option value="64" selected>64 neurons</option>
                            <option value="128">128 neurons</option>
                            <option value="256">256 neurons</option>
                            <option value="512">512 neurons</option>
                        </select>
                        <small>More neurons can learn more complex patterns but may overfit.</small>
                    </div>
                    <div class="form-group">
                        <label for="dense-activation">Activation Function:</label>
                        <select id="dense-activation">
                            <option value="relu" selected>ReLU</option>
                            <option value="tanh">Tanh</option>
                            <option value="sigmoid">Sigmoid</option>
                        </select>
                        <small>ReLU is most commonly used for hidden layers.</small>
                    </div>
                `;
            
            case 'conv2d':
                return `
                    <div class="layer-description">
                        <p><strong>Convolutional 2D Layer</strong></p>
                        <p>Conv2D layers are the backbone of image processing! They use small filters to scan across images, detecting features like edges, shapes, and patterns. Each filter learns to recognize a specific type of feature.</p>
                        <p><em>Best for:</em> Processing raw images, detecting visual features, early layers of image classification.</p>
                    </div>
                    <div class="form-group">
                        <label for="conv-filters">Number of Filters:</label>
                        <select id="conv-filters">
                            <option value="16">16 filters</option>
                            <option value="32" selected>32 filters</option>
                            <option value="64">64 filters</option>
                            <option value="128">128 filters</option>
                        </select>
                        <small>More filters can detect more features.</small>
                    </div>
                    <div class="form-group">
                        <label for="conv-kernel">Kernel Size:</label>
                        <select id="conv-kernel">
                            <option value="3" selected>3x3</option>
                            <option value="5">5x5</option>
                            <option value="7">7x7</option>
                        </select>
                        <small>Smaller kernels capture fine details, larger ones capture broader patterns.</small>
                    </div>
                    <div class="form-group">
                        <label for="conv-activation">Activation Function:</label>
                        <select id="conv-activation">
                            <option value="relu" selected>ReLU</option>
                            <option value="tanh">Tanh</option>
                        </select>
                        <small>ReLU is the standard activation for convolutional layers.</small>
                    </div>
                `;
            
            case 'maxpool':
                return `
                    <div class="layer-description">
                        <p><strong>MaxPooling 2D Layer</strong></p>
                        <p>MaxPooling layers reduce the size of feature maps by keeping only the most important information. They take the maximum value from small regions, making the network faster and helping it focus on the strongest features.</p>
                        <p><em>Best for:</em> Reducing computational load, preventing overfitting, after Conv2D layers.</p>
                    </div>
                    <div class="form-group">
                        <label for="pool-size">Pool Size:</label>
                        <select id="pool-size">
                            <option value="2" selected>2x2</option>
                            <option value="3">3x3</option>
                            <option value="4">4x4</option>
                        </select>
                        <small>Larger pool sizes provide more dimension reduction but may lose detail.</small>
                    </div>
                `;
            
            case 'flatten':
                return `
                    <div class="layer-description">
                        <p><strong>Flatten Layer</strong></p>
                        <p>Flatten layers convert multi-dimensional data (like images) into a single flat list. This is essential when transitioning from convolutional layers (which work with 2D images) to dense layers (which need 1D input).</p>
                        <p><em>Best for:</em> Bridge between Conv2D/MaxPool layers and Dense layers. Required transition step!</p>
                    </div>
                    <div class="config-note">
                        <p><i class="fas fa-info-circle"></i> <strong>No configuration needed</strong> - This layer automatically reshapes your data.</p>
                        <p class="warning-note">⚠️ <strong>Important:</strong> Must be placed between Conv2D/MaxPool layers and Dense layers!</p>
                    </div>
                `;
            
            case 'dropout':
                return `
                    <div class="layer-description">
                        <p><strong>Dropout Layer</strong></p>
                        <p>Dropout layers randomly "turn off" some neurons during training to prevent the network from becoming too dependent on specific neurons. This helps prevent overfitting and makes the model more robust.</p>
                        <p><em>Best for:</em> Preventing overfitting, especially after dense layers with many neurons.</p>
                    </div>
                    <div class="form-group">
                        <label for="dropout-rate">Dropout Rate:</label>
                        <select id="dropout-rate">
                            <option value="0.2">0.2 (20%)</option>
                            <option value="0.3">0.3 (30%)</option>
                            <option value="0.5" selected>0.5 (50%)</option>
                            <option value="0.7">0.7 (70%)</option>
                        </select>
                        <small>Higher dropout prevents overfitting but may reduce learning capacity.</small>
                    </div>
                `;
            
            default:
                return '<p>Layer configuration not available.</p>';
        }
    }

    addLayerFromModal() {
        const layerType = document.getElementById('layer-modal-overlay').getAttribute('data-layer-type');
        const config = this.getLayerConfigFromModal(layerType);
        
        this.addLayer(layerType, config);
        this.hideLayerModal();
    }

    getLayerConfigFromModal(layerType) {
        switch (layerType) {
            case 'dense':
                return {
                    units: parseInt(document.getElementById('dense-units').value),
                    activation: document.getElementById('dense-activation').value
                };
            
            case 'conv2d':
                return {
                    filters: parseInt(document.getElementById('conv-filters').value),
                    kernelSize: parseInt(document.getElementById('conv-kernel').value),
                    activation: document.getElementById('conv-activation').value
                };
            
            case 'maxpool':
                return {
                    poolSize: parseInt(document.getElementById('pool-size').value)
                };
            
            case 'dropout':
                return {
                    rate: parseFloat(document.getElementById('dropout-rate').value)
                };
            
            case 'flatten':
                return {};
            
            default:
                return {};
        }
    }

    addLayer(layerType, config) {
        const layer = {
            type: layerType,
            config: config,
            id: Date.now()
        };
        
        // Find the output layer index
        const outputIndex = this.layers.findIndex(layer => layer.type === 'output');
        
        if (outputIndex !== -1) {
            // Insert the new layer before the output layer
            this.layers.splice(outputIndex, 0, layer);
        } else {
            // If no output layer found, just add to end
            this.layers.push(layer);
        }
        
        this.updateLayerDisplay();
        this.showNotification(`${this.getLayerDisplayName(layerType)} layer added!`, 'success');
        
        // Reset model state since architecture changed
        this.isModelBuilt = false;
        this.modelPerformance = null;
        document.getElementById('test-btn').disabled = true;
    }

    addOutputLayer() {
        // Add the output layer automatically
        const outputLayer = {
            type: 'output',
            config: { units: 1, activation: 'sigmoid' },
            id: 'output'
        };
        this.layers.push(outputLayer);
        this.updateLayerDisplay();
    }

    removeLayer(layerId) {
        if (layerId === 'output') {
            this.showNotification('Cannot remove output layer!', 'error');
            return;
        }
        
        this.layers = this.layers.filter(layer => layer.id !== layerId);
        this.updateLayerDisplay();
        this.showNotification('Layer removed!', 'info');
        
        // Reset model state since architecture changed
        this.isModelBuilt = false;
        this.modelPerformance = null;
        document.getElementById('test-btn').disabled = true;
    }

    updateLayerDisplay() {
        const layerList = document.getElementById('layer-list');
        
        // Clear existing layers except input
        const inputLayer = layerList.querySelector('.input-layer');
        layerList.innerHTML = '';
        layerList.appendChild(inputLayer);
        
        // Add each layer
        this.layers.forEach((layer, index) => {
            const layerElement = this.createLayerElement(layer, index);
            layerList.appendChild(layerElement);
        });
        
        // Update network visualization
        this.updateNetworkVisualization();
    }

    updateNetworkVisualization() {
        const visualizationContainer = document.getElementById('network-visualization');
        if (!visualizationContainer) {
            console.log('Network visualization container not found');
            return;
        }
        
        const diagramContainer = document.getElementById('network-diagram');
        if (!diagramContainer) {
            console.log('Network diagram container not found');
            return;
        }
        
        // Get all layers including input
        const allLayers = [
            { type: 'input', config: { inputShape: [224, 224, 3] } },
            ...this.layers.filter(layer => layer.type !== 'output'),
            { type: 'output', config: { units: 2, activation: 'softmax' } }
        ];
        
        if (allLayers.length <= 2) {
            // Only input and output - still show them!
            diagramContainer.innerHTML = '';
            diagramContainer.className = 'network-diagram single-row';
            
            // Create visualization for input and output layers
            allLayers.forEach((layer, index) => {
                // Add layer visualization
                const layerVis = this.createLayerVisualization(layer, index);
                diagramContainer.appendChild(layerVis);
                
                // Add arrow between input and output
                if (index < allLayers.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'connection-arrow horizontal';
                    arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
                    diagramContainer.appendChild(arrow);
                }
            })
            return;
        }
        
        // Clear existing content
        diagramContainer.innerHTML = '';
        
        // Determine layout based on number of layers
        const maxLayersPerRow = 5; // Maximum layers per row before wrapping
        
        if (allLayers.length <= maxLayersPerRow) {
            // Single row layout for smaller networks
            diagramContainer.className = 'network-diagram single-row';
            this.createSingleRowLayout(diagramContainer, allLayers);
        } else {
            // Multi-row layout for larger networks
            diagramContainer.className = 'network-diagram multi-row';
            this.createMultiRowLayout(diagramContainer, allLayers, maxLayersPerRow);
        }
    }

    createNetworkVisualizationContainer() {
        // Check if container already exists
        if (document.getElementById('network-visualization')) {
            console.log('Network visualization container already exists');
            return;
        }
        
        const architectureSection = document.querySelector('.architecture-display');
        if (!architectureSection) {
            console.log('Architecture section not found');
            return;
        }
        
        const visualizationDiv = document.createElement('div');
        visualizationDiv.id = 'network-visualization';
        visualizationDiv.className = 'network-visualization';
        
        visualizationDiv.innerHTML = `
            <h4>
                <i class="fas fa-project-diagram"></i>
                Neural Network Architecture
            </h4>
            <div id="network-diagram" class="network-diagram">
                <div class="no-layers-message">
                    <i class="fas fa-brain"></i>
                    <p>Add layers to see your neural network visualization!</p>
                </div>
            </div>
        `;
        
        // Insert before the architecture display
        architectureSection.parentNode.insertBefore(visualizationDiv, architectureSection);
    }

    createSingleRowLayout(container, layers) {
        layers.forEach((layer, index) => {
            // Add layer visualization
            const layerVis = this.createLayerVisualization(layer, index);
            container.appendChild(layerVis);
            
            // Add horizontal arrow between layers (except after last layer)
            if (index < layers.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'connection-arrow horizontal';
                arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
                container.appendChild(arrow);
            }
        });
    }

    createMultiRowLayout(container, layers, maxLayersPerRow) {
        // Split layers into rows
        const rows = [];
        for (let i = 0; i < layers.length; i += maxLayersPerRow) {
            rows.push(layers.slice(i, i + maxLayersPerRow));
        }
        
        rows.forEach((rowLayers, rowIndex) => {
            // Create row container
            const rowDiv = document.createElement('div');
            rowDiv.className = 'network-row';
            
            // Add layers to this row
            rowLayers.forEach((layer, layerIndex) => {
                const globalIndex = rowIndex * maxLayersPerRow + layerIndex;
                const layerVis = this.createLayerVisualization(layer, globalIndex);
                rowDiv.appendChild(layerVis);
                
                // Add horizontal arrow within the row (except after last layer in row)
                if (layerIndex < rowLayers.length - 1) {
                    const arrow = document.createElement('div');
                    arrow.className = 'connection-arrow horizontal';
                    arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
                    rowDiv.appendChild(arrow);
                }
            });
            
            container.appendChild(rowDiv);
            
            // Add vertical arrow between rows (except after last row)
            if (rowIndex < rows.length - 1) {
                const verticalArrow = document.createElement('div');
                verticalArrow.className = 'connection-arrow vertical';
                verticalArrow.innerHTML = '<i class="fas fa-arrow-down"></i>';
                container.appendChild(verticalArrow);
            }
        });
    }

    createLayerVisualization(layer, index) {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'network-layer-vis';
        
        const shape = document.createElement('div');
        shape.className = `layer-shape ${layer.type}`;
        
        let shapeContent = '';
        let layerLabel = '';
        let layerDetails = '';
        
        switch (layer.type) {
            case 'input':
                shapeContent = '<i class="fas fa-image"></i>';
                layerLabel = 'Input';
                layerDetails = '224×224×3<br>RGB Image';
                break;
                
            case 'conv2d':
                shapeContent = `<i class="fas fa-th"></i><br>${layer.config.filters}`;
                layerLabel = 'Conv2D';
                layerDetails = `${layer.config.filters} filters<br>${layer.config.kernelSize}×${layer.config.kernelSize}`;
                // Add size class based on kernel size
                shape.classList.add(`kernel-${layer.config.kernelSize}`);
                break;
                
            case 'maxpool':
                shapeContent = '<i class="fas fa-compress"></i>';
                layerLabel = 'MaxPool';
                layerDetails = `${layer.config.poolSize}×${layer.config.poolSize}<br>Pooling`;
                // Add size class based on pool size
                shape.classList.add(`pool-${layer.config.poolSize}`);
                break;
                
            case 'flatten':
                shapeContent = '<i class="fas fa-arrows-alt-h"></i>';
                layerLabel = 'Flatten';
                layerDetails = 'Convert to<br>1D array';
                break;
                
            case 'dense':
                shapeContent = `<i class="fas fa-circle"></i><br>${layer.config.units}`;
                layerLabel = 'Dense';
                layerDetails = `${layer.config.units} neurons<br>${layer.config.activation}`;
                // Add size class based on number of neurons
                shape.classList.add(`neurons-${layer.config.units}`);
                break;
                
            case 'dropout':
                shapeContent = '<i class="fas fa-random"></i>';
                layerLabel = 'Dropout';
                layerDetails = `${(layer.config.rate * 100).toFixed(0)}%<br>Drop rate`;
                break;
                
            case 'output':
                shapeContent = '<i class="fas fa-bullseye"></i><br>2';
                layerLabel = 'Output';
                layerDetails = '2 classes<br>Thanos/Grimace';
                break;
        }
        
        shape.innerHTML = shapeContent;
        
        const label = document.createElement('div');
        label.className = 'layer-label';
        label.textContent = layerLabel;
        
        const details = document.createElement('div');
        details.className = 'layer-details';
        details.innerHTML = layerDetails;
        
        layerDiv.appendChild(shape);
        layerDiv.appendChild(label);
        layerDiv.appendChild(details);
        
        return layerDiv;
    }

    createLayerElement(layer, index) {
        const div = document.createElement('div');
        div.className = `layer ${layer.type}-layer`;
        
        let icon, description;
        
        switch (layer.type) {
            case 'dense':
                icon = 'fas fa-circle';
                description = `${layer.config.units} neurons, ${layer.config.activation}`;
                break;
            case 'conv2d':
                icon = 'fas fa-th';
                description = `${layer.config.filters} filters, ${layer.config.kernelSize}x${layer.config.kernelSize}, ${layer.config.activation}`;
                break;
            case 'maxpool':
                icon = 'fas fa-compress';
                description = `${layer.config.poolSize}x${layer.config.poolSize} pooling`;
                break;
            case 'flatten':
                icon = 'fas fa-arrows-alt';
                description = 'Convert to 1D';
                break;
            case 'dropout':
                icon = 'fas fa-random';
                description = `${(layer.config.rate * 100).toFixed(0)}% dropout`;
                break;
            case 'output':
                icon = 'fas fa-bullseye';
                description = 'Binary classification (Thanos/Grimace)';
                break;
            default:
                icon = 'fas fa-layer-group';
                description = layer.type;
        }
        
        // Determine if we can move this layer up or down
        const nonOutputLayers = this.layers.filter(l => l.type !== 'output');
        const layerIndex = nonOutputLayers.findIndex(l => l.id === layer.id);
        const canMoveUp = layerIndex > 0;
        const canMoveDown = layerIndex < nonOutputLayers.length - 1 && layer.type !== 'output';
        
        div.innerHTML = `
            <div class="layer-info">
                <i class="${icon}"></i>
                <span>${this.getLayerDisplayName(layer.type)} Layer</span>
                <small>${description}</small>
            </div>
            <div class="layer-controls">
                ${layer.id !== 'output' ? `
                    ${canMoveUp ? `<button class="layer-move" data-layer-id="${layer.id}" data-direction="up" title="Move layer up">
                        <i class="fas fa-arrow-up"></i>
                    </button>` : ''}
                    ${canMoveDown ? `<button class="layer-move" data-layer-id="${layer.id}" data-direction="down" title="Move layer down">
                        <i class="fas fa-arrow-down"></i>
                    </button>` : ''}
                    <button class="layer-remove" data-layer-id="${layer.id}" title="Remove layer">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        // Add event listeners to the buttons
        if (layer.id !== 'output') {
            const moveUpBtn = div.querySelector('.layer-move[data-direction="up"]');
            const moveDownBtn = div.querySelector('.layer-move[data-direction="down"]');
            const removeBtn = div.querySelector('.layer-remove');
            
            if (moveUpBtn) {
                moveUpBtn.addEventListener('click', () => this.moveLayer(layer.id, 'up'));
            }
            
            if (moveDownBtn) {
                moveDownBtn.addEventListener('click', () => this.moveLayer(layer.id, 'down'));
            }
            
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeLayer(layer.id));
            }
        }
        
        return div;
    }

    moveLayer(layerId, direction) {
        const nonOutputLayers = this.layers.filter(layer => layer.type !== 'output');
        const outputLayer = this.layers.find(layer => layer.type === 'output');
        
        const currentIndex = nonOutputLayers.findIndex(layer => layer.id === layerId);
        
        if (currentIndex === -1) return;
        
        let newIndex;
        if (direction === 'up' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < nonOutputLayers.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            return; // Can't move
        }
        
        // Swap layers
        const temp = nonOutputLayers[currentIndex];
        nonOutputLayers[currentIndex] = nonOutputLayers[newIndex];
        nonOutputLayers[newIndex] = temp;
        
        // Rebuild layers array with output layer at the end
        this.layers = [...nonOutputLayers, outputLayer];
        
        this.updateLayerDisplay();
        this.showNotification(`Layer moved ${direction}!`, 'info');
        
        // Reset model state since architecture changed
        this.isModelBuilt = false;
        this.modelPerformance = null;
        document.getElementById('test-btn').disabled = true;
    }

    calculateNetworkScore() {
        // Simulate realistic neural network performance based on architecture choices
        let baseScore = 0.5; // Random baseline
        let complexityBonus = 0;
        let architectureBonus = 0;
        
        const nonOutputLayers = this.layers.filter(layer => layer.type !== 'output');
        
        // Analyze architecture for realistic scoring
        let hasConv = false;
        let hasMaxPool = false;
        let hasFlatten = false;
        let hasDense = false;
        let hasDropout = false;
        
        let convLayers = 0;
        let denseLayers = 0;
        let totalParams = 0;
        let isOverfitting = false;
        
        nonOutputLayers.forEach(layer => {
            switch (layer.type) {
                case 'conv2d':
                    hasConv = true;
                    convLayers++;
                    complexityBonus += 0.15; // Conv layers are great for images
                    totalParams += layer.config.filters * 32; // Rough param estimate
                    break;
                case 'maxpool':
                    hasMaxPool = true;
                    if (hasConv) architectureBonus += 0.1; // Good after conv
                    break;
                case 'flatten':
                    hasFlatten = true;
                    if (hasConv) architectureBonus += 0.05; // Necessary transition
                    break;
                case 'dense':
                    hasDense = true;
                    denseLayers++;
                    complexityBonus += 0.08;
                    totalParams += layer.config.units * 64; // Rough param estimate
                    
                    // Check for overfitting - too many large dense layers without dropout
                    if (layer.config.units >= 256 && denseLayers >= 2 && !hasDropout) {
                        isOverfitting = true;
                    }
                    break;
                case 'dropout':
                    hasDropout = true;
                    if (denseLayers > 0) architectureBonus += 0.05; // Prevents overfitting
                    break;
            }
        });
        
        // Architecture quality bonuses
        if (hasConv && hasMaxPool && hasFlatten && hasDense) {
            architectureBonus += 0.15; // Complete CNN architecture
        }
        
        if (convLayers >= 2) {
            architectureBonus += 0.08; // Multiple conv layers learn hierarchical features
        }
        
        if (hasDropout && denseLayers >= 2) {
            architectureBonus += 0.07; // Regularization with multiple dense layers
        }
        
        // Complexity penalties for too simple/complex networks
        if (nonOutputLayers.length < 2) {
            complexityBonus -= 0.2; // Too simple
        } else if (nonOutputLayers.length > 8) {
            complexityBonus -= 0.1; // Might overfit
        }
        
        // Overfitting simulation - high training accuracy but poor generalization
        if (isOverfitting) {
            complexityBonus -= 0.15; // Poor test performance due to overfitting
        }
        
        // Calculate final score
        let finalScore = baseScore + complexityBonus + architectureBonus;
        
        // Add some controlled randomness for realism
        const randomFactor = (Math.random() - 0.5) * 0.1;
        finalScore += randomFactor;
        
        // Ensure score is within realistic bounds
        finalScore = Math.max(0.4, Math.min(0.98, finalScore));
        
        return {
            accuracy: finalScore,
            confidence: 0.85 + (architectureBonus * 2), // Higher for better architectures
            complexity: totalParams,
            isOverfitting: isOverfitting
        };
    }

    async buildModel() {
        try {
            console.log('Analyzing network architecture...');
            
            // Check if we have any layers to work with
            if (this.layers.length === 0) {
                this.showNotification('No layers to build model with!', 'error');
                return false;
            }
            
            // Validate architecture for CNN requirements
            const validationResult = this.validateArchitecture();
            if (!validationResult.isValid) {
                this.showNotification(validationResult.error, 'error');
                return false;
            }
            
            // Simulate model building by analyzing architecture
            const networkAnalysis = this.calculateNetworkScore();
            this.modelPerformance = networkAnalysis;
            
            console.log('Network analysis complete:', networkAnalysis);
            console.log('Architecture score:', (networkAnalysis.accuracy * 100).toFixed(1) + '%');
            
            if (networkAnalysis.isOverfitting) {
                console.warn('Warning: Overfitting detected! Network may memorize training data but perform poorly on test data.');
                this.showNotification('Warning: Your architecture may overfit! Consider adding Dropout layers.', 'warning');
            }
            
            // Simulate model compilation
            this.isModelBuilt = true;
            
            return true;
            
        } catch (error) {
            console.error('Error analyzing model:', error);
            this.showNotification('Error analyzing model: ' + error.message, 'error');
            return false;
        }
    }

    validateArchitecture() {
        const nonOutputLayers = this.layers.filter(layer => layer.type !== 'output');
        
        // Check if we have any layers
        if (nonOutputLayers.length === 0) {
            return { isValid: true }; // Will be caught by other validation
        }
        
        // Check for Dense layers without proper flattening
        let hasConvLayers = false;
        let hasSeenFlattenAfterConv = false;
        let hasFlattenLayer = false;
        
        for (let i = 0; i < nonOutputLayers.length; i++) {
            const layer = nonOutputLayers[i];
            
            if (layer.type === 'conv2d' || layer.type === 'maxpool') {
                hasConvLayers = true;
                hasSeenFlattenAfterConv = false; // Reset when we see new conv layers
            } else if (layer.type === 'flatten') {
                hasFlattenLayer = true;
                if (hasConvLayers) {
                    hasSeenFlattenAfterConv = true;
                }
            } else if (layer.type === 'dense') {
                // Case 1: Dense after Conv2D without Flatten
                if (hasConvLayers && !hasSeenFlattenAfterConv) {
                    return {
                        isValid: false,
                        error: 'Error: Dense layers require a Flatten layer after Conv2D/MaxPool layers! Conv2D outputs 3D data (height×width×channels), but Dense layers need 1D input. Add a Flatten layer between them.'
                    };
                }
                
                // Case 2: Dense directly on image input without any preprocessing
                if (!hasConvLayers && !hasFlattenLayer) {
                    return {
                        isValid: false,
                        error: 'Error: Dense layers cannot process 2D image data directly! Images are 2D (height×width×channels), but Dense layers need 1D input. Add a Flatten layer first, or use Conv2D layers for proper image processing.'
                    };
                }
            }
        }
        
        return { isValid: true };
    }

    calculateTrainingTimePerEpoch(batchSize) {
        // Calculate training time based on architecture complexity
        const nonOutputLayers = this.layers.filter(layer => layer.type !== 'output');
        let complexityScore = 0;
        let totalParams = 0;
        let convLayerCount = 0;
        let denseLayerCount = 0;
        
        nonOutputLayers.forEach(layer => {
            switch (layer.type) {
                case 'conv2d':
                    convLayerCount++;
                    // Conv2D layers are VERY computationally expensive
                    const kernelComplexity = layer.config.kernelSize * layer.config.kernelSize;
                    const convParams = layer.config.filters * kernelComplexity * 3;
                    
                    // Much higher base cost for conv layers
                    const baseCost = 200 + (layer.config.filters * 2); // Base cost scales with filter count
                    
                    // Kernel size has exponential impact on computation
                    const kernelFactor = Math.pow(layer.config.kernelSize / 3, 1.8); // 3x3 = 1.0, 5x5 = 2.9, 7x7 = 5.4
                    
                    // Multiple conv layers compound the complexity
                    const layerStackFactor = 1 + (convLayerCount - 1) * 0.4; // Each additional conv layer adds 40% overhead
                    
                    complexityScore += baseCost * kernelFactor * layerStackFactor;
                    totalParams += convParams;
                    console.log(`Conv2D layer ${convLayerCount}: ${layer.config.filters} filters, ${layer.config.kernelSize}x${layer.config.kernelSize}, complexity: ${(baseCost * kernelFactor * layerStackFactor).toFixed(1)}`);
                    break;
                    
                case 'dense':
                    denseLayerCount++;
                    // Dense layers scale significantly with neuron count
                    const neuronFactor = Math.sqrt(layer.config.units / 32); // Square root scaling
                    const baseDenseCost = 50 + (layer.config.units / 4);
                    
                    // Large dense layers are expensive
                    const sizeFactor = layer.config.units >= 256 ? 1.5 : 
                                     layer.config.units >= 128 ? 1.2 : 1.0;
                    
                    complexityScore += baseDenseCost * neuronFactor * sizeFactor;
                    totalParams += layer.config.units * 64;
                    console.log(`Dense layer ${denseLayerCount}: ${layer.config.units} neurons, complexity: ${(baseDenseCost * neuronFactor * sizeFactor).toFixed(1)}`);
                    break;
                    
                case 'maxpool':
                    // MaxPool has moderate cost but scales with pool size
                    const poolFactor = Math.pow(layer.config.poolSize / 2, 1.3); // 2x2 = 1.0, 3x3 = 1.4, 4x4 = 1.9
                    complexityScore += 25 * poolFactor;
                    break;
                    
                case 'flatten':
                    complexityScore += 10;
                    break;
                    
                case 'dropout':
                    complexityScore += 15;
                    break;
            }
        });
        
        // Network depth penalty - deeper networks take longer
        const depthFactor = 1 + (nonOutputLayers.length - 1) * 0.15;
        complexityScore *= depthFactor;
        
        // Batch size affects training time (larger batches = slightly faster per sample)
        const batchFactor = Math.max(0.7, 1 - (batchSize - 16) / 100);
        
        // More realistic time scaling: 600ms to 8000ms per epoch
        // But apply the 1-minute total limit in the training function
        let baseTime = Math.max(600, complexityScore * batchFactor * 2.5);
        
        // Cap individual epochs at 12 seconds for user experience
        const finalTime = Math.min(12000, baseTime);
        
        console.log(`Architecture analysis:
- ${convLayerCount} Conv2D layers, ${denseLayerCount} Dense layers
- Total layers: ${nonOutputLayers.length}
- Raw complexity score: ${complexityScore.toFixed(1)}
- Depth factor: ${depthFactor.toFixed(2)}
- Batch factor: ${batchFactor.toFixed(2)}
- Estimated time per epoch: ${finalTime.toFixed(0)}ms`);
        
        return finalTime;
    }

    async trainModel() {
        if (this.isTraining) {
            // If training is in progress, stop it
            this.stopTraining();
            return;
        }
        
        // Hide previous test results when starting new training
        const resultsDisplay = document.getElementById('results-display');
        if (resultsDisplay) {
            resultsDisplay.style.display = 'none';
        }
        
        // Remove detailed results and finish button if they exist
        const detailedResults = document.getElementById('detailed-results');
        if (detailedResults) {
            detailedResults.remove();
        }
        
        const finishBtn = document.getElementById('finish-task-btn');
        if (finishBtn) {
            finishBtn.remove();
        }
        
        // Check if we have any layers besides just the output layer
        const nonOutputLayers = this.layers.filter(layer => layer.type !== 'output');
        if (nonOutputLayers.length === 0) {
            this.showNotification('Please add at least one layer before the output layer to create a meaningful network!', 'warning');
            return;
        }
        
        this.isTraining = true;
        
        try {
            this.showLoading('Analyzing architecture...');
            
            const modelBuilt = await this.buildModel();
            if (!modelBuilt) {
                this.isTraining = false;
                this.hideLoading();
                return;
            }
            
            this.hideLoading();
            
            // Show training progress
            document.getElementById('training-progress').style.display = 'block';
            
            // Get training parameters
            const epochs = parseInt(document.getElementById('epochs').value);
            const batchSize = parseInt(document.getElementById('batch-size').value);
            
            // Calculate training time per epoch based on architecture
            const timePerEpoch = this.calculateTrainingTimePerEpoch(batchSize);
            
            // Dynamic safety check: Allow more time for complex architectures
            const nonOutputLayers = this.layers.filter(layer => layer.type !== 'output');
            const convLayerCount = nonOutputLayers.filter(layer => layer.type === 'conv2d').length;
            const totalLayerCount = nonOutputLayers.length;
            
            // Base time limit of 90 seconds, but allow more for complex architectures
            let maxTotalTime = 90000; // 90 seconds base
            
            // Add extra time for complex architectures
            if (convLayerCount >= 4) {
                maxTotalTime = 120000; // 2 minutes for 4+ conv layers
            } else if (convLayerCount >= 3) {
                maxTotalTime = 105000; // 1.75 minutes for 3+ conv layers
            } else if (totalLayerCount >= 6) {
                maxTotalTime = 105000; // 1.75 minutes for 6+ total layers
            }
            
            const estimatedTotalTime = epochs * timePerEpoch;
            let adjustedTimePerEpoch = timePerEpoch;
            
            if (estimatedTotalTime > maxTotalTime) {
                adjustedTimePerEpoch = Math.floor(maxTotalTime / epochs);
                console.log(`Complex architecture detected (${convLayerCount} conv layers, ${totalLayerCount} total layers)`);
                console.log(`Adjusting training time from ${timePerEpoch}ms to ${adjustedTimePerEpoch}ms per epoch to keep total under ${(maxTotalTime/1000).toFixed(1)} seconds`);
            }
            
            const finalEstimatedTime = epochs * adjustedTimePerEpoch;
            console.log(`Final training estimate: ${(finalEstimatedTime / 1000).toFixed(1)} seconds total (${adjustedTimePerEpoch}ms per epoch)`);
            
        // Reset training history
        this.trainingHistory = { 
            epochs: [], 
            trainLoss: [], 
            trainAccuracy: [], 
            valLoss: [], 
            valAccuracy: [] 
        };
        
        // Reset overfitting warning flag
        this.overfittingWarningShown = false;            // Update buttons during training
            const trainBtn = document.getElementById('train-btn');
            const testBtn = document.getElementById('test-btn');
            
            trainBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Training';
            testBtn.disabled = true; // Disable test button during training
            
            console.log(`Simulating training: ${epochs} epochs, batch size ${batchSize}, ~${adjustedTimePerEpoch}ms per epoch`);
            
            // Simulate realistic training progression
            await this.simulateTraining(epochs, adjustedTimePerEpoch);
            
            if (this.isTraining) { // Only show success if not manually stopped
                console.log('Training simulation completed');
                this.showNotification('Training completed successfully!', 'success');
                
                // Enable test button after successful training
                testBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Error during training:', error);
            this.showNotification('Error during training: ' + error.message, 'error');
        } finally {
            this.isTraining = false;
            this.hideLoading();
            
            // Reset train button
            const trainBtn = document.getElementById('train-btn');
            trainBtn.innerHTML = '<i class="fas fa-play"></i> Train Model';
        }
    }

    stopTraining() {
        this.isTraining = false;
        this.showNotification('Training paused by user', 'info');
        
        // Reset train button
        const trainBtn = document.getElementById('train-btn');
        trainBtn.innerHTML = '<i class="fas fa-play"></i> Train Model';
        
        // Enable test button if we have some training completed
        if (this.trainingHistory.epochs.length > 0) {
            document.getElementById('test-btn').disabled = false;
        } else {
            document.getElementById('test-btn').disabled = true;
        }
    }

    async simulateTraining(epochs, timePerEpoch) {
        const targetAccuracy = this.modelPerformance.accuracy;
        const startingLoss = 0.693; // ln(2) - random binary classification
        const targetLoss = -Math.log(targetAccuracy);
        const isOverfitting = this.modelPerformance.isOverfitting;
        
        // Track timing for ETA calculation
        const startTime = Date.now();
        
        for (let epoch = 1; epoch <= epochs; epoch++) {
            if (!this.isTraining) break;
            
            // Simulate realistic training progression
            const progress = epoch / epochs;
            
            let trainLoss, trainAccuracy, valLoss, valAccuracy;
            
            if (isOverfitting) {
                // Simulate overfitting - training metrics improve but validation plateaus/degrades
                const learningCurve = 1 - Math.exp(-4 * progress); // Faster initial learning
                
                // Training metrics keep improving (overfitting)
                trainAccuracy = Math.min(0.95, 0.5 + (0.45) * learningCurve);
                trainLoss = Math.max(0.05, startingLoss - (startingLoss - 0.05) * learningCurve);
                
                // Validation performance plateaus or degrades after epoch 60%
                let generalizationFactor = 1.0;
                if (progress > 0.6) {
                    generalizationFactor = 1.0 - (progress - 0.6) * 0.4; // More degradation
                }
                
                valAccuracy = Math.min(targetAccuracy * generalizationFactor, trainAccuracy * 0.9);
                valLoss = Math.max(targetLoss, trainLoss + (1 - generalizationFactor) * 0.5);
                
                // Add warning at 70% through training
                if (epoch === Math.floor(epochs * 0.7) && isOverfitting) {
                    this.showNotification('Warning: Overfitting detected! Validation loss increasing while training loss decreases.', 'warning');
                }
            } else {
                // Normal training progression with realistic validation gap
                const learningCurve = 1 - Math.exp(-3 * progress); // Exponential learning curve
                
                // Training metrics
                trainLoss = startingLoss - (startingLoss - targetLoss) * learningCurve;
                trainAccuracy = Math.min(targetAccuracy, 0.5 + (targetAccuracy - 0.5) * learningCurve);
                
                // Validation metrics (slightly worse than training, realistic gap)
                const validationGap = 0.02 + 0.03 * progress; // Increasing gap over time
                valLoss = trainLoss + validationGap;
                valAccuracy = Math.max(0.45, trainAccuracy - validationGap * 2);
            }
            
            // Add some realistic noise
            const noiseFactor = 0.02 * (1 - progress * 0.5); // Less noise as training progresses
            const trainNoisyLoss = trainLoss + (Math.random() - 0.5) * noiseFactor;
            const trainNoisyAccuracy = trainAccuracy + (Math.random() - 0.5) * noiseFactor * 0.5;
            const valNoisyLoss = valLoss + (Math.random() - 0.5) * noiseFactor * 1.2; // More validation noise
            const valNoisyAccuracy = valAccuracy + (Math.random() - 0.5) * noiseFactor * 0.6;
            
            const logs = {
                trainLoss: Math.max(0.05, trainNoisyLoss),
                trainAcc: Math.max(0.4, Math.min(0.99, trainNoisyAccuracy)),
                valLoss: Math.max(0.05, valNoisyLoss),
                valAcc: Math.max(0.35, Math.min(0.98, valNoisyAccuracy))
            };
            
            // Calculate ETA
            const elapsedTime = Date.now() - startTime;
            const avgTimePerEpoch = elapsedTime / epoch;
            const remainingEpochs = epochs - epoch;
            const etaMs = remainingEpochs * avgTimePerEpoch;
            
            // Use dynamic training time based on architecture complexity
            // Add some randomness to make it feel more realistic (±20%)
            const actualTime = timePerEpoch + (Math.random() - 0.5) * timePerEpoch * 0.4;
            await new Promise(resolve => setTimeout(resolve, Math.max(200, actualTime)));
            
            // Update progress AFTER the epoch completes
            this.updateTrainingProgress(epoch, epochs, logs, etaMs);
        }
    }

    updateTrainingProgress(epoch, totalEpochs, logs, etaMs = 0) {
        const progressPercent = (epoch / totalEpochs) * 100;
        
        // Update progress bar
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
        document.getElementById('progress-text').textContent = `${progressPercent.toFixed(0)}%`;
        
        // Update training stats with both training and validation metrics
        document.getElementById('current-epoch').textContent = `${epoch}/${totalEpochs}`;
        document.getElementById('training-loss').textContent = logs.trainLoss.toFixed(4);
        document.getElementById('training-accuracy').textContent = (logs.trainAcc * 100).toFixed(2) + '%';
        
        // Update or create validation metrics display
        this.updateValidationMetrics(logs);
        
        // Add ETA display if available
        if (etaMs > 0 && epoch < totalEpochs) {
            const etaSeconds = Math.ceil(etaMs / 1000);
            const etaMinutes = Math.floor(etaSeconds / 60);
            const etaSecondsRemainder = etaSeconds % 60;
            const etaText = etaMinutes > 0 ? `${etaMinutes}m ${etaSecondsRemainder}s` : `${etaSecondsRemainder}s`;
            
            // Find or create ETA display element
            let etaElement = document.getElementById('training-eta');
            if (!etaElement) {
                etaElement = document.createElement('div');
                etaElement.id = 'training-eta';
                etaElement.style.cssText = 'color: var(--text-secondary); font-size: 0.9em; margin-top: 5px;';
                document.querySelector('.training-stats').appendChild(etaElement);
            }
            etaElement.textContent = `ETA: ${etaText}`;
        }
        
        // Add epoch-by-epoch logging to console for detailed tracking
        console.log(`Epoch ${epoch}/${totalEpochs} - Train Loss: ${logs.trainLoss.toFixed(4)}, Train Acc: ${(logs.trainAcc * 100).toFixed(2)}%, Val Loss: ${logs.valLoss.toFixed(4)}, Val Acc: ${(logs.valAcc * 100).toFixed(2)}%`);
        
        // Store history for plotting
        this.trainingHistory.epochs.push(epoch);
        this.trainingHistory.trainLoss.push(logs.trainLoss);
        this.trainingHistory.trainAccuracy.push(logs.trainAcc);
        this.trainingHistory.valLoss.push(logs.valLoss);
        this.trainingHistory.valAccuracy.push(logs.valAcc);
        
        // Update charts
        this.updateTrainingCharts();
        
        // Check for overfitting patterns
        this.checkOverfittingPattern(epoch);
    }
    
    updateValidationMetrics(logs) {
        // Find or create validation metrics display
        let valLossElement = document.getElementById('validation-loss');
        let valAccElement = document.getElementById('validation-accuracy');
        
        if (!valLossElement) {
            // Create validation metrics section
            const trainingStats = document.querySelector('.training-stats');
            const valSection = document.createElement('div');
            valSection.className = 'validation-stats';
            valSection.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-glow);';
            valSection.innerHTML = `
                <h4 style="color: var(--primary-purple); margin-bottom: 10px; font-size: 0.9em;">Validation Metrics</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <span style="color: var(--text-secondary);">Val Loss:</span>
                        <span id="validation-loss" style="color: var(--primary-cyan); font-weight: 600; margin-left: 8px;"></span>
                    </div>
                    <div>
                        <span style="color: var(--text-secondary);">Val Accuracy:</span>
                        <span id="validation-accuracy" style="color: var(--accent-gold); font-weight: 600; margin-left: 8px;"></span>
                    </div>
                </div>
            `;
            trainingStats.appendChild(valSection);
            
            valLossElement = document.getElementById('validation-loss');
            valAccElement = document.getElementById('validation-accuracy');
        }
        
        valLossElement.textContent = logs.valLoss.toFixed(4);
        valAccElement.textContent = (logs.valAcc * 100).toFixed(2) + '%';
    }
    
    checkOverfittingPattern(currentEpoch) {
        // Check for overfitting patterns after we have enough data
        if (currentEpoch < 10) return;
        
        const recentEpochs = 5; // Look at last 5 epochs
        const startIdx = Math.max(0, this.trainingHistory.epochs.length - recentEpochs);
        
        const recentTrainLoss = this.trainingHistory.trainLoss.slice(startIdx);
        const recentValLoss = this.trainingHistory.valLoss.slice(startIdx);
        
        // Calculate trends
        const trainLossTrend = this.calculateTrend(recentTrainLoss);
        const valLossTrend = this.calculateTrend(recentValLoss);
        
        // Check for diverging losses (training decreasing, validation increasing)
        const gapIncreasing = valLossTrend > 0 && trainLossTrend < 0;
        const currentGap = this.trainingHistory.valLoss[this.trainingHistory.valLoss.length - 1] - 
                          this.trainingHistory.trainLoss[this.trainingHistory.trainLoss.length - 1];
        
        // Show overfitting warning if gap is large and increasing
        if (gapIncreasing && currentGap > 0.1 && !this.overfittingWarningShown) {
            this.showNotification('Overfitting detected: Validation loss increasing while training loss decreases!', 'warning');
            this.overfittingWarningShown = true;
        }
    }
    
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        // Simple linear trend calculation
        const n = values.length;
        const xSum = (n - 1) * n / 2; // Sum of indices 0, 1, 2, ..., n-1
        const ySum = values.reduce((sum, val) => sum + val, 0);
        const xySum = values.reduce((sum, val, idx) => sum + val * idx, 0);
        const xxSum = (n - 1) * n * (2 * n - 1) / 6; // Sum of squares
        
        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        return slope;
    }

    updateTrainingCharts() {
        // Update both loss and accuracy charts
        this.updateLossChart();
        this.updateAccuracyChart();
    }

    updateLossChart() {
        // Enhanced canvas-based loss chart with training and validation curves
        const canvas = document.getElementById('loss-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.trainingHistory.trainLoss.length < 2) return;
        
        const padding = 40;
        const width = canvas.width - 2 * padding;
        const height = canvas.height - 2 * padding;
        
        // Calculate ranges
        const allLosses = [...this.trainingHistory.trainLoss, ...this.trainingHistory.valLoss];
        const maxLoss = Math.max(...allLosses);
        const minLoss = Math.min(...allLosses);
        const lossRange = maxLoss - minLoss || 1;
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + height);
        ctx.lineTo(padding + width, padding + height);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < 5; i++) {
            const y = padding + (height * i) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }
        
        // Draw training loss line
        if (this.trainingHistory.trainLoss.length > 1) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.trainingHistory.trainLoss.forEach((loss, i) => {
                const x = padding + (i / (this.trainingHistory.trainLoss.length - 1)) * width;
                const y = padding + height - ((loss - minLoss) / lossRange) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw validation loss line
        if (this.trainingHistory.valLoss.length > 1) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line for validation
            ctx.beginPath();
            
            this.trainingHistory.valLoss.forEach((loss, i) => {
                const x = padding + (i / (this.trainingHistory.valLoss.length - 1)) * width;
                const y = padding + height - ((loss - minLoss) / lossRange) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        }
        
        // Add labels and legend
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Training Loss', canvas.width / 2, canvas.height - 5);
        
        // Add legend
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('■ Training Loss', padding, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('■ Validation Loss', padding + 120, 20);
        
        // Add loss values
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(maxLoss.toFixed(3), padding - 5, padding + 5);
        ctx.fillText(minLoss.toFixed(3), padding - 5, padding + height + 5);
    }
    
    updateAccuracyChart() {
        // Create accuracy chart if it doesn't exist
        let canvas = document.getElementById('accuracy-chart');
        if (!canvas) {
            // Create accuracy chart canvas
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                const accuracyDiv = document.createElement('div');
                accuracyDiv.innerHTML = `
                    <h5 style="color: var(--accent-gold); margin-bottom: 10px; text-align: center;">Training & Validation Accuracy</h5>
                    <canvas id="accuracy-chart" width="300" height="200" style="border: 1px solid var(--border-glow); border-radius: 8px; background: var(--bg-card);"></canvas>
                `;
                chartContainer.appendChild(accuracyDiv);
                canvas = document.getElementById('accuracy-chart');
            } else {
                return; // No chart container found
            }
        }
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.trainingHistory.trainAccuracy.length < 2) return;
        
        const padding = 40;
        const width = canvas.width - 2 * padding;
        const height = canvas.height - 2 * padding;
        
        // Calculate ranges (accuracy typically 0-1)
        const allAccuracies = [...this.trainingHistory.trainAccuracy, ...this.trainingHistory.valAccuracy];
        const maxAcc = Math.max(...allAccuracies);
        const minAcc = Math.min(...allAccuracies);
        const accRange = maxAcc - minAcc || 1;
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + height);
        ctx.lineTo(padding + width, padding + height);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < 5; i++) {
            const y = padding + (height * i) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }
        
        // Draw training accuracy line
        if (this.trainingHistory.trainAccuracy.length > 1) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            this.trainingHistory.trainAccuracy.forEach((acc, i) => {
                const x = padding + (i / (this.trainingHistory.trainAccuracy.length - 1)) * width;
                const y = padding + height - ((acc - minAcc) / accRange) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw validation accuracy line
        if (this.trainingHistory.valAccuracy.length > 1) {
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dashed line for validation
            ctx.beginPath();
            
            this.trainingHistory.valAccuracy.forEach((acc, i) => {
                const x = padding + (i / (this.trainingHistory.valAccuracy.length - 1)) * width;
                const y = padding + height - ((acc - minAcc) / accRange) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash
        }
        
        // Add labels and legend
        ctx.fillStyle = '#374151';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Training Accuracy', canvas.width / 2, canvas.height - 5);
        
        // Add legend
        ctx.textAlign = 'left';
        ctx.fillStyle = '#10b981';
        ctx.fillText('■ Training Acc', padding, 20);
        ctx.fillStyle = '#8b5cf6';
        ctx.fillText('■ Validation Acc', padding + 120, 20);
        
        // Add accuracy values
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText((maxAcc * 100).toFixed(1) + '%', padding - 5, padding + 5);
        ctx.fillText((minAcc * 100).toFixed(1) + '%', padding - 5, padding + height + 5);
    }

    async testModel() {
        if (!this.isModelBuilt) {
            this.showNotification('Please train the model first!', 'warning');
            return;
        }
        
        try {
            this.showLoading('Testing model...');
            
            // Generate realistic test results based on model architecture
            const baseAccuracy = this.modelPerformance.accuracy;
            const testAccuracy = baseAccuracy + (Math.random() - 0.5) * 0.05; // Small test variance
            const finalAccuracy = Math.max(0.4, Math.min(0.98, testAccuracy));
            
            // Generate individual predictions for each test image
            const testResults = this.generateTestPredictions(finalAccuracy);
            const grimosResults = this.generateGrimosPredictions();
            
            console.log(`Test accuracy: ${(finalAccuracy * 100).toFixed(2)}%`);
            
            // Display results with images
            this.displayTestResults(finalAccuracy, testResults, grimosResults);
            
            // Note: Score is no longer automatically updated here
            // Users must click "Finish Task" button to save their score
            
        } catch (error) {
            console.error('Error during testing:', error);
            this.showNotification('Error during testing: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    generateTestPredictions(targetAccuracy) {
        const results = [];
        const totalTests = this.testImages.thanos.length + this.testImages.grimace.length;
        const correctPredictions = Math.round(totalTests * targetAccuracy);
        
        // Create prediction results for Thanos images
        this.testImages.thanos.forEach((imagePath, index) => {
            const shouldBeCorrect = results.filter(r => r.correct).length < correctPredictions && Math.random() > 0.3;
            const prediction = shouldBeCorrect ? 0 : 1; // 0 = Thanos, 1 = Grimace
            const confidence = shouldBeCorrect ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4;
            
            results.push({
                image: imagePath,
                actual: 0, // Thanos
                predicted: prediction,
                confidence: confidence,
                correct: prediction === 0,
                label: 'Thanos'
            });
        });
        
        // Create prediction results for Grimace images
        this.testImages.grimace.forEach((imagePath, index) => {
            const shouldBeCorrect = results.filter(r => r.correct).length < correctPredictions && Math.random() > 0.3;
            const prediction = shouldBeCorrect ? 1 : 0; // 0 = Thanos, 1 = Grimace
            const confidence = shouldBeCorrect ? 0.75 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4;
            
            results.push({
                image: imagePath,
                actual: 1, // Grimace
                predicted: prediction,
                confidence: confidence,
                correct: prediction === 1,
                label: 'Grimace'
            });
        });
        
        return results;
    }

    generateGrimosPredictions() {
        // Grimos predictions - these should be funny and confused!
        
        return this.testImages.grimos.map((imagePath, index) => {
            // Grimos should confuse the model - random predictions with low confidence
            const prediction = Math.random() > 0.5 ? 1 : 0;
            const confidence = 0.3 + Math.random() * 0.4; // Low confidence
            
            return {
                image: imagePath,
                actual: "grimos", // Special case
                predicted: prediction,
                confidence: confidence,
                label: 'Grimos (Grimace as Thanos)'
            };
        });
    }

    displayTestResults(accuracy, testResults, grimosResults) {
        const resultsDisplay = document.getElementById('results-display');
        resultsDisplay.style.display = 'block';
        
        // Calculate stats
        const correct = testResults.filter(r => r.correct).length;
        const total = testResults.length;
        const accuracyPercent = (accuracy * 100);
        
        // Update accuracy display
        document.getElementById('accuracy-value').textContent = `${accuracyPercent.toFixed(1)}%`;
        
        // Update performance details
        document.getElementById('correct-predictions').textContent = correct;
        document.getElementById('incorrect-predictions').textContent = total - correct;
        document.getElementById('test-size').textContent = total;
        
        // Color code accuracy circle based on performance
        const accuracyCircle = document.querySelector('.accuracy-circle');
        if (accuracyPercent >= 92) {
            accuracyCircle.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else if (accuracyPercent >= 80) {
            accuracyCircle.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        } else {
            accuracyCircle.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }
        
        // Show score earned if above threshold
        if (accuracyPercent >= 92) {
            // Calculate weighted score based on accuracy percentage
            const baseScore = 100; // Base score for 92%
            const bonusPercentage = accuracyPercent - 92; // Extra percentage above 92%
            const bonusWeight = 5; // 5 points per extra percentage point
            const totalScore = Math.round(baseScore + (bonusPercentage * bonusWeight));
            
            const scoreEarned = document.getElementById('score-earned');
            const pointsEarned = document.getElementById('points-earned');
            pointsEarned.textContent = totalScore.toString();
            scoreEarned.style.display = 'block';
            
            // Store the calculated score for later use
            this.calculatedScore = totalScore;
            this.finalAccuracy = accuracyPercent;
            
            // Add finish button
            this.addFinishButton(totalScore, accuracyPercent);
        }
        
        // Display detailed test results with images
        this.createDetailedResultsDisplay(testResults, grimosResults);
    }

    addFinishButton(totalScore, accuracyPercent) {
        // Remove existing finish button if present
        const existingButton = document.getElementById('finish-task-btn');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create finish button section
        const finishSection = document.createElement('div');
        finishSection.id = 'finish-task-btn';
        finishSection.className = 'finish-task-section';
        
        finishSection.innerHTML = `
            <h4 class="finish-task-title">
                <i class="fas fa-trophy"></i>
                Excellent Performance!
            </h4>
            <p class="finish-task-description">
                You achieved ${accuracyPercent.toFixed(1)}% accuracy and earned ${totalScore} points!<br>
                Click below to save your score and complete the task.
            </p>
            <button id="finish-task-button" class="finish-task-button">
                <i class="fas fa-check-circle"></i>
                Finish Task & Save Score
            </button>
        `;
        
        // Add click event listener
        const button = finishSection.querySelector('#finish-task-button');
        button.addEventListener('click', () => this.finishTask());
        
        // Add to results display
        document.getElementById('results-display').appendChild(finishSection);
    }

    createDetailedResultsDisplay(testResults, grimosResults) {
        // Find or create the detailed results container
        let detailedContainer = document.getElementById('detailed-results');
        if (!detailedContainer) {
            detailedContainer = document.createElement('div');
            detailedContainer.id = 'detailed-results';
            detailedContainer.style.cssText = `
                margin-top: 30px;
                padding: 25px;
                background: var(--bg-card);
                border-radius: 15px;
                border: 1px solid var(--border-glow);
            `;
            document.getElementById('results-display').appendChild(detailedContainer);
        }
        
        detailedContainer.innerHTML = `
            <h3 style="color: var(--primary-cyan); margin-bottom: 20px; text-align: center;">
                Detailed Test Results
            </h3>
            
            <!-- Regular Test Results -->
            <div class="test-section">
                <h4 style="color: var(--accent-gold); margin-bottom: 15px;">Standard Test Results</h4>
                <div class="predictions-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${testResults.map(result => this.createPredictionCard(result)).join('')}
                </div>
            </div>
            
            <!-- Grimos Section -->
            <div class="grimos-section" style="border-top: 2px solid var(--primary-purple); padding-top: 20px;">
                <h4 style="color: var(--primary-purple); margin-bottom: 10px;">
                    <i class="fas fa-mask"></i> Grimos Analysis (Not counted in accuracy)
                </h4>
                <p style="color: var(--text-secondary); margin-bottom: 15px; font-style: italic;">
                    These images of Grimace dressed as Thanos are designed to confuse our AI! Let's see how well it handles this identity crisis...
                </p>
                <div class="grimos-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${grimosResults.map(result => this.createGrimosCard(result)).join('')}
                </div>
            </div>
        `;
    }

    createPredictionCard(result) {
        const isCorrect = result.correct;
        const confidencePercent = (result.confidence * 100).toFixed(1);
        const predictedLabel = result.predicted === 0 ? 'Thanos' : 'Grimace';
        
        return `
            <div class="prediction-card" style="
                background: ${isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
                border: 1px solid ${isCorrect ? 'var(--secondary-teal)' : '#ef4444'};
                border-radius: 12px;
                padding: 15px;
                text-align: center;
            ">
                <img src="${result.image}" alt="${result.label}" style="
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 10px;
                " onerror="this.style.display='none'">
                <div style="font-size: 0.9em;">
                    <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 5px;">
                        ${result.label}
                    </div>
                    <div style="color: ${isCorrect ? 'var(--secondary-teal)' : '#ef4444'}; margin-bottom: 5px;">
                        Predicted: ${predictedLabel}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.85em;">
                        Confidence: ${confidencePercent}%
                    </div>
                    <div style="margin-top: 8px;">
                        <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}" style="
                            color: ${isCorrect ? 'var(--secondary-teal)' : '#ef4444'};
                            font-size: 1.2em;
                        "></i>
                    </div>
                </div>
            </div>
        `;
    }

    createGrimosCard(result) {
        const confidencePercent = (result.confidence * 100).toFixed(1);
        const predictedLabel = result.predicted === 0 ? 'Thanos' : 'Grimace';
        
        return `
            <div class="grimos-card">
                <img src="${result.image}" alt="${result.label}" onerror="this.style.display='none'">
                <div style="font-size: 0.9em;">
                    <div style="color: var(--primary-purple); font-weight: 600; margin-bottom: 5px;">
                        ${result.label}
                    </div>
                    <div style="color: var(--accent-gold); margin-bottom: 5px;">
                        AI thinks: ${predictedLabel}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.85em; margin-bottom: 8px;">
                        Confidence: ${confidencePercent}% (Very confused!)
                    </div>
                </div>
            </div>
        `;
    }

    async updateScore() {
        try {
            const response = await fetch('/updateScore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    score: this.calculatedScore || 100 // Use calculated score or fallback to 100
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Update displayed score
                    const currentScoreEl = document.getElementById('current-score');
                    if (currentScoreEl) {
                        currentScoreEl.textContent = result.newScore;
                    }
                    
                    this.showNotification(`Score updated! +${this.calculatedScore || 100} points for achieving ${this.finalAccuracy?.toFixed(1) || '>92'}% accuracy!`, 'success');
                }
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    }

    async finishTask() {
        try {
            this.showLoading('Saving your score...');
            
            // Update score in database
            await this.updateScore();
            
            // Show completion message
            this.showNotification('Congratulations! Task completed successfully!', 'success');
            
            // Disable the finish button
            const finishButton = document.getElementById('finish-task-button');
            if (finishButton) {
                finishButton.disabled = true;
                finishButton.innerHTML = '<i class="fas fa-check"></i> Task Completed!';
                finishButton.style.background = '#6b7280';
                finishButton.style.cursor = 'not-allowed';
            }
            
            // Automatically redirect to final page after 5 seconds
            setTimeout(() => {
                window.location.href = '/final';
            }, 5000);
            
        } catch (error) {
            console.error('Error finishing task:', error);
            this.showNotification('Error saving score. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    resetNetwork() {
        // Reset layers (keep only output layer)
        this.layers = this.layers.filter(layer => layer.id === 'output');
        this.updateLayerDisplay();
        
        // Reset model state
        this.isModelBuilt = false;
        this.modelPerformance = null;
        
        // Reset UI
        document.getElementById('training-progress').style.display = 'none';
        document.getElementById('results-display').style.display = 'none';
        document.getElementById('test-btn').disabled = true;
        
        // Remove detailed results if they exist
        const detailedResults = document.getElementById('detailed-results');
        if (detailedResults) {
            detailedResults.remove();
        }
        
        // Remove ETA display if it exists
        const etaElement = document.getElementById('training-eta');
        if (etaElement) {
            etaElement.remove();
        }
        
        // Remove finish button if it exists
        const finishButton = document.getElementById('finish-task-btn');
        if (finishButton) {
            finishButton.remove();
        }
        
        // Reset train button
        const trainBtn = document.getElementById('train-btn');
        trainBtn.innerHTML = '<i class="fas fa-play"></i> Train Model';
        trainBtn.onclick = () => this.trainModel();
        
        // Reset training state
        this.isTraining = false;
        
        // Reset calculated score
        this.calculatedScore = null;
        this.finalAccuracy = null;
        
        // Reset training history
        this.trainingHistory = { 
            epochs: [], 
            trainLoss: [], 
            trainAccuracy: [], 
            valLoss: [], 
            valAccuracy: [] 
        };
        
        this.showNotification('Network reset successfully!', 'info');
    }

    showLoading(message) {
        const overlay = document.getElementById('loading-overlay');
        const text = document.getElementById('loading-text');
        text.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        // Set background color based on type
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else if (type === 'warning') {
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the deep learning task when the page loads
let deepLearningTask;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, configuring TensorFlow.js...');
    
    // Configure TensorFlow.js backend first
    await configureTensorFlow();
    
    console.log('Initializing Deep Learning Task...');
    deepLearningTask = new DeepLearningTask();
});

// Check if game is active
document.addEventListener('DOMContentLoaded', function() {
    if (!window.gameConfig.gameActive) {
        // Show waiting message
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; background: rgba(255,255,255,0.9); border-radius: 15px; margin: 50px auto; max-width: 600px;">
                <i class="fas fa-clock" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
                <h1 style="color: #374151; margin-bottom: 10px;">Neural Network Builder</h1>
                <p style="color: #6b7280; font-size: 1.1rem; margin-bottom: 20px;">
                    The instructor hasn't started the deep learning session yet.
                </p>
                <p style="color: #6b7280;">
                    Please wait for the instructor to begin the activity.
                </p>
                <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 10px; border-left: 4px solid #3b82f6;">
                    <i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 8px;"></i>
                    <strong>What you'll do:</strong> Build and train a neural network to classify images between Thanos and Grimace!
                </div>
            </div>
        `;
    }
});
