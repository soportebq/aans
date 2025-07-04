// JavaScript específico para dbscan_q3.html - Efectos de Diferentes Valores de Epsilon

// Dataset diseñado para mostrar efectos dramáticos del epsilon
const sampleData = [
    // Cluster 1 - MUY DENSO (izquierda)
    {x: 100, y: 150, id: 1}, {x: 110, y: 160, id: 2}, {x: 105, y: 140, id: 3},
    {x: 115, y: 155, id: 4}, {x: 95, y: 165, id: 5}, {x: 120, y: 145, id: 6},
    {x: 108, y: 170, id: 7}, {x: 92, y: 155, id: 8},
    
    // Cluster 2 - DENSO (centro-derecha)  
    {x: 350, y: 200, id: 9}, {x: 365, y: 210, id: 10}, {x: 355, y: 190, id: 11},
    {x: 370, y: 205, id: 12}, {x: 340, y: 215, id: 13}, {x: 375, y: 195, id: 14},
    {x: 345, y: 225, id: 15}, {x: 380, y: 185, id: 16},
    
    // Cluster 3 - MODERADO (centro-arriba)
    {x: 250, y: 100, id: 17}, {x: 270, y: 110, id: 18}, {x: 260, y: 85, id: 19},
    {x: 285, y: 105, id: 20}, {x: 235, y: 120, id: 21}, {x: 290, y: 95, id: 22},
    
    // Cluster 4 - DISPERSO (abajo-centro)
    {x: 200, y: 320, id: 23}, {x: 230, y: 340, id: 24}, {x: 220, y: 300, id: 25},
    {x: 250, y: 330, id: 26}, {x: 180, y: 350, id: 27},
    
    // Puntos aislados (siempre noise)
    {x: 50, y: 50, id: 28}, {x: 450, y: 80, id: 29}, {x: 100, y: 380, id: 30},
    {x: 480, y: 350, id: 31}, {x: 300, y: 50, id: 32},
    
    // Puntos bridge (conectores entre clusters - sensibles al epsilon)
    {x: 180, y: 180, id: 33}, {x: 200, y: 200, id: 34}, {x: 300, y: 150, id: 35}
];

// Función para obtener dimensiones responsive
function getResponsiveDimensions(containerId) {
    const container = document.querySelector(`#${containerId}`) || document.querySelector('.visual-section');
    let containerWidth = container ? container.parentElement.clientWidth : 600;
    
    let width, height;
    
    if (window.innerWidth <= 480) {
        width = Math.min(containerWidth - 20, 280);
        height = Math.min(width * 0.7, 200);
    } else if (window.innerWidth <= 767) {
        width = Math.min(containerWidth - 20, 350);
        height = Math.min(width * 0.7, 250);
    } else {
        width = containerId.includes('interactive') ? 
               Math.min(containerWidth - 40, 600) : 
               Math.min(containerWidth - 20, 250);
        height = containerId.includes('interactive') ? 
                Math.min(width * 0.67, 400) : 
                Math.min(width * 0.8, 200);
    }
    
    return { width, height };
}

// Función para escalar datos
function scaleData(data, targetWidth, targetHeight) {
    const originalWidth = 500;
    const originalHeight = 400;
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;
    
    return data.map(point => ({
        ...point,
        x: point.x * scaleX,
        y: point.y * scaleY
    }));
}

// Algoritmo DBSCAN optimizado y validado
function runDBSCAN(points, eps, minPts) {
    const result = points.map(p => ({
        ...p,
        neighbors: [],
        type: 'noise',
        cluster: 'noise',
        visited: false
    }));
    
    console.log(`🔬 Ejecutando DBSCAN: ${points.length} puntos, ε=${eps}, MinPts=${minPts}`);
    
    // Calcular vecinos para cada punto
    result.forEach(point => {
        point.neighbors = result.filter(other => {
            if (other.id === point.id) return false;
            const dist = Math.sqrt(
                Math.pow(point.x - other.x, 2) + 
                Math.pow(point.y - other.y, 2)
            );
            return dist <= eps;
        });
    });
    
    // Identificar core points
    const corePoints = [];
    result.forEach(point => {
        if (point.neighbors.length >= minPts) {
            point.type = 'core';
            corePoints.push(point);
        }
    });
    
    console.log(`🔵 Core points identificados: ${corePoints.length}`);
    corePoints.forEach((point, index) => {
        console.log(`   Core ${index + 1}: Punto ${point.id} con ${point.neighbors.length} vecinos`);
    });
    
    // Formar clusters usando BFS mejorado
    let clusterId = 1;
    result.forEach(point => {
        if (point.type === 'core' && point.cluster === 'noise') {
            point.cluster = clusterId;
            point.visited = true;
            
            const queue = [...point.neighbors];
            let clusterSize = 1;
            
            while (queue.length > 0) {
                const neighbor = queue.shift();
                if (neighbor.cluster === 'noise') {
                    neighbor.cluster = clusterId;
                    neighbor.type = neighbor.type === 'core' ? 'core' : 'border';
                    clusterSize++;
                    
                    if (neighbor.type === 'core' && !neighbor.visited) {
                        neighbor.visited = true;
                        queue.push(...neighbor.neighbors);
                    }
                }
            }
            
            console.log(`📊 Cluster ${clusterId} formado: ${clusterSize} puntos`);
            clusterId++;
        }
    });
    
    return result;
}

// Función para obtener colores
function getClusterColor(point) {
    if (point.cluster === 'noise') return '#95a5a6';
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#27ae60'];
    return colors[(point.cluster - 1) % colors.length];
}

// Función para crear visualización estática
function createStaticVisualization(svgId, eps, minPts) {
    const svg = d3.select(`#${svgId}`);
    const { width, height } = getResponsiveDimensions(svgId);
    
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();
    
    const scaledData = scaleData(sampleData, width, height);
    const processedData = runDBSCAN(scaledData, eps, minPts);
    
    // Dibujar círculos de epsilon para TODOS los core points en visualizaciones estáticas
    const corePoints = processedData.filter(p => p.type === 'core');
    console.log(`🎨 ${svgId}: ${corePoints.length} core points con ε=${eps}`);
    
    corePoints.forEach((point, index) => {
        svg.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", eps)
            .attr("fill", "rgba(52,152,219,0.04)")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 0.8)
            .attr("stroke-dasharray", "2,2")
            .attr("opacity", 0.7)
            .attr("class", "epsilon-circle-static");
    });
    
    // Dibujar puntos
    svg.selectAll(".point")
        .data(processedData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => {
            if (d.type === 'core') return width <= 300 ? 5 : 6;
            if (d.type === 'border') return width <= 300 ? 4 : 5;
            return width <= 300 ? 3 : 4;
        })
        .attr("fill", d => getClusterColor(d))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5);
    
    const clusters = new Set(processedData.filter(p => p.cluster !== 'noise').map(p => p.cluster));
    console.log(`📊 ${svgId}: ε=${eps} → ${clusters.size} clusters, ${corePoints.length} círculos dibujados`);
}

// Función para crear visualización interactiva
function createInteractiveVisualization() {
    const svg = d3.select("#interactive-demo");
    const { width, height } = getResponsiveDimensions('interactive-demo');
    
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();
    
    const epsilon = parseInt(document.getElementById('epsilon-slider').value);
    const minPts = parseInt(document.getElementById('minpts-input').value);
    
    const scaledData = scaleData(sampleData, width, height);
    const processedData = runDBSCAN(scaledData, epsilon, minPts);
    
    // Dibujar círculos de epsilon para TODOS los core points
    const corePoints = processedData.filter(p => p.type === 'core');
    console.log(`🔵 Dibujando círculos para ${corePoints.length} core points`);
    
    corePoints.forEach((point, index) => {
        console.log(`📍 Círculo ${index + 1}: Punto ${point.id} en (${Math.round(point.x)}, ${Math.round(point.y)})`);
        
        svg.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", epsilon)
            .attr("fill", "rgba(52,152,219,0.06)")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4")
            .attr("opacity", 0.8)
            .attr("class", "epsilon-circle");
    });
    
    // Dibujar puntos
    svg.selectAll(".point")
        .data(processedData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => {
            if (d.type === 'core') return 8;
            if (d.type === 'border') return 6;
            return 4;
        })
        .attr("fill", d => getClusterColor(d))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", d.type === 'core' ? 12 : d.type === 'border' ? 9 : 6);
            showTooltip(svg, d);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", d.type === 'core' ? 8 : d.type === 'border' ? 6 : 4);
            svg.select("#tooltip").remove();
        });
    
    // Actualizar estadísticas y validar círculos
    updateStats(processedData, epsilon);
    validateEpsilonCircles(svg, corePoints.length);
    
    console.log(`🎮 Interactive: ε=${epsilon}, MinPts=${minPts} → ${corePoints.length} core points, ${corePoints.length} círculos dibujados`);
}

// Función para validar que se dibujaron todos los círculos
function validateEpsilonCircles(svg, expectedCount) {
    const drawnCircles = svg.selectAll(".epsilon-circle").size();
    console.log(`🔍 Validación: Se esperaban ${expectedCount} círculos, se dibujaron ${drawnCircles}`);
    
    if (drawnCircles !== expectedCount) {
        console.warn(`⚠️  ADVERTENCIA: Discrepancia en círculos de epsilon!`);
    } else {
        console.log(`✅ Todos los círculos de epsilon se dibujaron correctamente`);
    }
}

// Función para mostrar tooltip
function showTooltip(svg, d) {
    const tooltip = svg.append("g").attr("id", "tooltip");
    
    const tooltipX = d.x + 15;
    const tooltipY = d.y - 50;
    
    tooltip.append("rect")
        .attr("x", tooltipX)
        .attr("y", tooltipY)
        .attr("width", 120)
        .attr("height", 60)
        .attr("fill", "rgba(0,0,0,0.9)")
        .attr("rx", 5);
    
    tooltip.append("text")
        .attr("x", tooltipX + 10)
        .attr("y", tooltipY + 20)
        .attr("fill", "white")
        .attr("font-size", "12px")
        .text(`Punto ${d.id}`);
    
    tooltip.append("text")
        .attr("x", tooltipX + 10)
        .attr("y", tooltipY + 35)
        .attr("fill", "white")
        .attr("font-size", "11px")
        .text(`Tipo: ${d.type.toUpperCase()}`);
    
    tooltip.append("text")
        .attr("x", tooltipX + 10)
        .attr("y", tooltipY + 50)
        .attr("fill", "white")
        .attr("font-size", "11px")
        .text(`Cluster: ${d.cluster === 'noise' ? 'NOISE' : 'C' + d.cluster}`);
}

// Función para actualizar estadísticas
function updateStats(processedData, epsilon) {
    const clusters = new Set(processedData.filter(p => p.cluster !== 'noise').map(p => p.cluster));
    const noiseCount = processedData.filter(p => p.cluster === 'noise').length;
    const coreCount = processedData.filter(p => p.type === 'core').length;
    
    document.getElementById('current-epsilon').textContent = epsilon;
    document.getElementById('clusters-found').textContent = clusters.size;
    document.getElementById('noise-points').textContent = noiseCount;
    document.getElementById('core-points').textContent = coreCount;
}

// Función para actualizar controles
function updateControls() {
    const epsilonSlider = document.getElementById('epsilon-slider');
    const epsilonInput = document.getElementById('epsilon-input');
    const minptsSlider = document.getElementById('minpts-slider');
    const minptsInput = document.getElementById('minpts-input');
    
    // Sincronizar valores
    epsilonInput.value = epsilonSlider.value;
    minptsInput.value = minptsSlider.value;
}

// Función principal para actualizar clustering
function updateClustering() {
    updateControls();
    createInteractiveVisualization();
}

// Función para crear todas las visualizaciones estáticas
function initializeStaticVisualizations() {
    console.log("🎨 Creando visualizaciones estáticas...");
    
    // Crear gráficos estáticos con diferentes valores de epsilon
    console.log("📊 Epsilon pequeño (15):");
    createStaticVisualization('small-epsilon', 15, 3);
    
    console.log("📊 Epsilon óptimo (35):");
    createStaticVisualization('optimal-epsilon', 35, 3);
    
    console.log("📊 Epsilon grande (80):");
    createStaticVisualization('large-epsilon', 80, 3);
    
    console.log("✅ Visualizaciones estáticas completadas");
    console.log("💡 Observa cómo cambia la cantidad de círculos azules (core points) en cada caso:");
    console.log("   - Epsilon 15: Pocos círculos pequeños");
    console.log("   - Epsilon 35: Círculos medianos bien distribuidos");  
    console.log("   - Epsilon 80: Círculos grandes que se superponen");
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando DBSCAN Q3...");
    
    // Verificar elementos DOM
    const requiredElements = ['epsilon-slider', 'epsilon-input', 'minpts-input', 'interactive-demo'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error("❌ Elementos faltantes:", missingElements);
        return;
    }
    
    // Configurar event listeners
    const epsilonSlider = document.getElementById('epsilon-slider');
    const epsilonInput = document.getElementById('epsilon-input');
    const minptsSlider = document.getElementById('minpts-slider');
    const minptsInput = document.getElementById('minpts-input');
    
    // Event listeners para epsilon
    epsilonSlider.addEventListener('input', function() {
        epsilonInput.value = this.value;
        createInteractiveVisualization();
    });
    
    epsilonInput.addEventListener('input', function() {
        if (this.value >= 10 && this.value <= 100) {
            epsilonSlider.value = this.value;
            createInteractiveVisualization();
        }
    });
    
    // Event listeners para minPts
    minptsSlider.addEventListener('input', function() {
        minptsInput.value = this.value;
        createInteractiveVisualization();
    });
    
    minptsInput.addEventListener('input', function() {
        if (this.value >= 2 && this.value <= 8) {
            minptsSlider.value = this.value;
            createInteractiveVisualization();
        }
    });
    
    // Crear visualizaciones
    setTimeout(() => {
        initializeStaticVisualizations();
        createInteractiveVisualization();
    }, 100);
});

// Redimensionar cuando cambie el tamaño de ventana
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializeStaticVisualizations();
        createInteractiveVisualization();
    }, 200);
});

// Manejar cambios de orientación en móviles
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        initializeStaticVisualizations();
        createInteractiveVisualization();
    }, 400);
});

console.log("✅ DBSCAN Q3 JavaScript cargado correctamente!");