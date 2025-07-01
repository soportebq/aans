// JavaScript específico para dbscan_q7.html - Valores Pequeños de Epsilon

// Datasets para diferentes tipos de datos
const datasets = {
    dense: [
        // Cluster denso 1 - muy concentrado
        {x: 120, y: 150, id: 1}, {x: 130, y: 160, id: 2}, {x: 125, y: 145, id: 3},
        {x: 135, y: 155, id: 4}, {x: 115, y: 165, id: 5}, {x: 140, y: 150, id: 6},
        {x: 128, y: 170, id: 7}, {x: 122, y: 140, id: 8}, {x: 138, y: 148, id: 9},
        
        // Cluster denso 2 - muy concentrado
        {x: 420, y: 180, id: 10}, {x: 430, y: 190, id: 11}, {x: 425, y: 175, id: 12},
        {x: 435, y: 185, id: 13}, {x: 415, y: 195, id: 14}, {x: 440, y: 180, id: 15},
        {x: 428, y: 200, id: 16}, {x: 422, y: 170, id: 17}, {x: 438, y: 178, id: 18},
        
        // Cluster denso 3 - muy concentrado
        {x: 270, y: 280, id: 19}, {x: 280, y: 290, id: 20}, {x: 275, y: 275, id: 21},
        {x: 285, y: 285, id: 22}, {x: 265, y: 295, id: 23}, {x: 290, y: 280, id: 24},
        
        // Pocos outliers genuinos
        {x: 50, y: 50, id: 25}, {x: 550, y: 100, id: 26}, {x: 100, y: 350, id: 27}
    ],
    
    sparse: [
        // Clusters dispersos
        {x: 100, y: 120, id: 1}, {x: 160, y: 180, id: 2}, {x: 140, y: 150, id: 3},
        {x: 180, y: 140, id: 4}, {x: 120, y: 200, id: 5}, {x: 200, y: 160, id: 6},
        
        {x: 350, y: 150, id: 7}, {x: 410, y: 210, id: 8}, {x: 380, y: 180, id: 9},
        {x: 420, y: 150, id: 10}, {x: 360, y: 220, id: 11}, {x: 440, y: 190, id: 12},
        
        {x: 250, y: 280, id: 13}, {x: 310, y: 340, id: 14}, {x: 280, y: 310, id: 15},
        {x: 320, y: 280, id: 16}, {x: 260, y: 350, id: 17}, {x: 340, y: 320, id: 18},
        
        // Muchos puntos dispersos
        {x: 80, y: 80, id: 19}, {x: 500, y: 90, id: 20}, {x: 150, y: 350, id: 21},
        {x: 550, y: 300, id: 22}, {x: 480, y: 320, id: 23}, {x: 90, y: 280, id: 24}
    ],
    
    mixed: [
        // Cluster muy denso
        {x: 120, y: 150, id: 1}, {x: 130, y: 160, id: 2}, {x: 125, y: 145, id: 3},
        {x: 135, y: 155, id: 4}, {x: 115, y: 165, id: 5}, {x: 140, y: 150, id: 6},
        
        // Cluster moderadamente disperso
        {x: 350, y: 150, id: 7}, {x: 410, y: 210, id: 8}, {x: 380, y: 180, id: 9},
        {x: 420, y: 150, id: 10}, {x: 360, y: 220, id: 11},
        
        // Cluster muy disperso
        {x: 200, y: 280, id: 12}, {x: 280, y: 340, id: 13}, {x: 250, y: 310, id: 14},
        {x: 320, y: 280, id: 15},
        
        // Outliers mezclados
        {x: 80, y: 80, id: 16}, {x: 500, y: 90, id: 17}, {x: 150, y: 350, id: 18},
        {x: 550, y: 300, id: 19}, {x: 480, y: 50, id: 20}, {x: 50, y: 280, id: 21}
    ]
};

// Algoritmo DBSCAN
function runDBSCAN(points, eps, minPts) {
    const result = points.map(p => ({...p, cluster: 'noise', neighbors: 0, isCore: false}));
    
    // Calcular vecinos para cada punto
    result.forEach(point => {
        const neighbors = result.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighbors = neighbors.length;
        point.isCore = neighbors.length >= minPts;
    });
    
    // Formar clusters usando expansión desde core points
    let clusterIndex = 1;
    const visited = new Set();
    
    result.forEach(point => {
        if (point.isCore && !visited.has(point.id)) {
            const stack = [point];
            point.cluster = `cluster${clusterIndex}`;
            visited.add(point.id);
            
            while (stack.length > 0) {
                const current = stack.pop();
                const neighbors = result.filter(other => 
                    other.id !== current.id && 
                    Math.sqrt(Math.pow(current.x - other.x, 2) + Math.pow(current.y - other.y, 2)) <= eps
                );
                
                neighbors.forEach(neighbor => {
                    if (!visited.has(neighbor.id)) {
                        visited.add(neighbor.id);
                        neighbor.cluster = `cluster${clusterIndex}`;
                        if (neighbor.isCore) {
                            stack.push(neighbor);
                        }
                    }
                });
            }
            clusterIndex++;
        }
    });
    
    return result;
}

// Función para calcular métricas de calidad
function calculateQualityMetrics(points, eps) {
    const totalPoints = points.length;
    const clusteredPoints = points.filter(p => p.cluster !== 'noise').length;
    const coverage = Math.round((clusteredPoints / totalPoints) * 100);
    
    // Estimación de precisión basada en epsilon
    let precision;
    if (eps <= 25) precision = Math.min(95, 75 + eps);
    else if (eps <= 50) precision = Math.max(60, 100 - eps);
    else precision = Math.max(30, 80 - eps);
    
    return { coverage, precision: Math.round(precision) };
}

// Función para crear visualización
function createVisualization(svgId, points, eps, minPts, scale = 1) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    
    const colors = {
        cluster1: '#3498db', cluster2: '#e74c3c', cluster3: '#f39c12',
        cluster4: '#9b59b6', cluster5: '#1abc9c', noise: '#95a5a6'
    };
    
    console.log(`🎨 Creando visualización ${svgId} con eps=${eps}, minPts=${minPts}, ${points.length} puntos`);
    
    // Mostrar círculos de epsilon para core points (solo en demo principal)
    if (scale === 1) {
        const corePoints = points.filter(p => p.isCore);
        console.log(`🔵 Core points: ${corePoints.length}`);
        
        // Mostrar máximo 5 círculos para no sobrecargar
        const samplesToShow = Math.min(5, corePoints.length);
        for (let i = 0; i < samplesToShow; i++) {
            const point = corePoints[i];
            svg.append("circle")
                .attr("cx", point.x)
                .attr("cy", point.y)
                .attr("r", eps)
                .attr("fill", "rgba(52,152,219,0.06)")
                .attr("stroke", "#3498db")
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", "4,4")
                .attr("opacity", 0.8);
        }
    }
    
    // Dibujar puntos
    svg.selectAll(".point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => d.x * scale)
        .attr("cy", d => d.y * scale)
        .attr("r", d => {
            if (d.isCore) return 8 * scale;
            if (d.cluster !== 'noise') return 6 * scale;
            return 4 * scale;
        })
        .attr("fill", d => colors[d.cluster] || colors.noise)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5 * scale)
        .style("cursor", scale === 1 ? "pointer" : "default");
    
    // Agregar tooltips solo al gráfico principal
    if (scale === 1) {
        svg.selectAll(".point")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", d.isCore ? 12 : d.cluster !== 'noise' ? 9 : 7);
                
                const tooltip = svg.append("g").attr("id", "tooltip");
                tooltip.append("rect")
                    .attr("x", d.x + 15)
                    .attr("y", d.y - 60)
                    .attr("width", 150)
                    .attr("height", 80)
                    .attr("fill", "rgba(0,0,0,0.9)")
                    .attr("rx", 8);
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y - 35)
                    .attr("fill", "white")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .text(`Punto ${d.id}`);
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y - 20)
                    .attr("fill", "white")
                    .attr("font-size", "11px")
                    .text(`Tipo: ${d.isCore ? 'Core' : d.cluster !== 'noise' ? 'Border' : 'Noise'}`);
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y - 5)
                    .attr("fill", "white")
                    .attr("font-size", "11px")
                    .text(`Vecinos: ${d.neighbors}`);
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y + 10)
                    .attr("fill", "white")
                    .attr("font-size", "11px")
                    .text(`Cluster: ${d.cluster}`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("r", d.isCore ? 8 : d.cluster !== 'noise' ? 6 : 4);
                svg.select("#tooltip").remove();
            });
    }
    
    console.log(`✅ Visualización ${svgId} completada`);
    return points;
}

// Función para actualizar la demostración principal
function updateMainDemo() {
    const eps = parseInt(document.getElementById('eps-slider').value);
    const minPts = parseInt(document.getElementById('minpts-slider').value);
    const dataType = document.getElementById('data-type').value;
    
    console.log(`🔄 Actualizando demo principal: eps=${eps}, minPts=${minPts}, dataType=${dataType}`);
    
    // Sincronizar controles
    document.getElementById('eps-input').value = eps;
    document.getElementById('minpts-input').value = minPts;
    
    // Obtener dataset según el tipo seleccionado
    const currentData = datasets[dataType];
    const processedData = runDBSCAN(currentData, eps, minPts);
    
    // Crear visualización principal
    createVisualization('main-demo', processedData, eps, minPts, 1);
    
    // Calcular estadísticas
    const clusterCount = new Set(processedData.filter(p => p.cluster !== 'noise').map(p => p.cluster)).size;
    const noiseCount = processedData.filter(p => p.cluster === 'noise').length;
    const coreCount = processedData.filter(p => p.isCore).length;
    const metrics = calculateQualityMetrics(processedData, eps);
    
    console.log(`📊 Estadísticas: ${clusterCount} clusters, ${noiseCount} noise, ${coreCount} core, ${metrics.precision}% precision`);
    
    // Actualizar estadísticas en la UI
    document.getElementById('current-eps').textContent = eps;
    document.getElementById('current-minpts').textContent = minPts;
    document.getElementById('total-clusters').textContent = clusterCount;
    document.getElementById('noise-points').textContent = noiseCount;
    document.getElementById('precision-score').textContent = metrics.precision + '%';
    document.getElementById('data-coverage').textContent = metrics.coverage + '%';
}

// Función para crear las demostraciones de comparación
function createComparisonDemos() {
    console.log("🎨 Creando demos de comparación...");
    
    // Usar datos densos para la comparación
    const denseData = datasets.dense;
    
    // Demo con epsilon pequeño (óptimo para datos densos)
    const smallEpsData = runDBSCAN([...denseData], 20, 3);
    createVisualization('small-eps-demo', smallEpsData, 20, 3, 0.6);
    
    // Demo con epsilon medio
    const mediumEpsData = runDBSCAN([...denseData], 40, 3);
    createVisualization('medium-eps-demo', mediumEpsData, 40, 3, 0.6);
    
    // Demo con epsilon grande (problemático)
    const largeEpsData = runDBSCAN([...denseData], 60, 3);
    createVisualization('large-eps-demo', largeEpsData, 60, 3, 0.6);
    
    console.log("✅ Demos de comparación completados");
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando DBSCAN Pregunta 7...");
    
    // Crear demos de comparación estáticos
    createComparisonDemos();
    
    // Configurar event listeners para controles
    const epsSlider = document.getElementById('eps-slider');
    const epsInput = document.getElementById('eps-input');
    const minptsSlider = document.getElementById('minpts-slider');
    const minptsInput = document.getElementById('minpts-input');
    const dataTypeSelect = document.getElementById('data-type');
    
    // Event listeners para epsilon
    epsSlider.addEventListener('input', function() {
        epsInput.value = this.value;
        updateMainDemo();
    });
    
    epsSlider.addEventListener('change', function() {
        epsInput.value = this.value;
        updateMainDemo();
    });
    
    epsInput.addEventListener('input', function() {
        if (this.value >= 15 && this.value <= 75) {
            epsSlider.value = this.value;
            updateMainDemo();
        }
    });
    
    epsInput.addEventListener('change', function() {
        if (this.value >= 15 && this.value <= 75) {
            epsSlider.value = this.value;
            updateMainDemo();
        }
    });
    
    // Event listeners para MinPts
    minptsSlider.addEventListener('input', function() {
        minptsInput.value = this.value;
        updateMainDemo();
    });
    
    minptsSlider.addEventListener('change', function() {
        minptsInput.value = this.value;
        updateMainDemo();
    });
    
    minptsInput.addEventListener('input', function() {
        if (this.value >= 2 && this.value <= 6) {
            minptsSlider.value = this.value;
            updateMainDemo();
        }
    });
    
    minptsInput.addEventListener('change', function() {
        if (this.value >= 2 && this.value <= 6) {
            minptsSlider.value = this.value;
            updateMainDemo();
        }
    });
    
    // Event listener para tipo de datos
    dataTypeSelect.addEventListener('change', updateMainDemo);
    
    // Crear demo inicial
    updateMainDemo();
    
    console.log("✅ DBSCAN Pregunta 7 inicializada correctamente!");
});