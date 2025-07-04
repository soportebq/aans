// DBSCAN Q5: JavaScript para Métricas de Distancia
// Archivo: dbscan_q5.js

// ===== DATOS EDUCATIVOS DISEÑADOS PARA MOSTRAR DIFERENCIAS ENTRE MÉTRICAS =====
const sampleData = [
    // Cluster 1 (izquierda-arriba) - DENSO, patrones geométricos claros
    {x: 120, y: 100, id: 1}, {x: 140, y: 110, id: 2}, {x: 130, y: 90, id: 3},
    {x: 150, y: 105, id: 4}, {x: 115, y: 120, id: 5}, {x: 135, y: 115, id: 6},
    
    // Cluster 2 (derecha-arriba) - MODERADO, forma alargada
    {x: 400, y: 110, id: 7}, {x: 420, y: 120, id: 8}, {x: 430, y: 100, id: 9},
    {x: 440, y: 115, id: 10}, {x: 415, y: 130, id: 11},
    
    // Cluster 3 (centro-abajo) - DENSO, forma cuadrada (sensible a Manhattan)
    {x: 280, y: 280, id: 12}, {x: 300, y: 290, id: 13}, {x: 290, y: 270, id: 14},
    {x: 310, y: 285, id: 15}, {x: 275, y: 300, id: 16}, {x: 295, y: 265, id: 17},
    
    // Cluster 4 (izquierda-centro) - DIAGONAL, sensible a Chebyshev
    {x: 100, y: 200, id: 18}, {x: 120, y: 220, id: 19}, {x: 110, y: 230, id: 20},
    {x: 90, y: 210, id: 21}, {x: 130, y: 240, id: 22},
    
    // Cluster 5 (derecha-centro) - DISPERSO en línea horizontal
    {x: 450, y: 200, id: 23}, {x: 470, y: 205, id: 24}, {x: 460, y: 195, id: 25},
    {x: 480, y: 200, id: 26},
    
    // Puntos aislados (outliers) estratégicamente ubicados
    {x: 200, y: 150, id: 27}, {x: 350, y: 180, id: 28}, {x: 500, y: 300, id: 29},
    {x: 50, y: 320, id: 30}, {x: 520, y: 50, id: 31}
];

// ===== FUNCIONES DE DISTANCIA =====
const metrics = {
    euclidean: {
        name: 'Euclidiana',
        func: (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)),
        description: 'Distancia en línea recta',
        efficiency: 'Media (requiere √)',
        shape: 'Circular'
    },
    manhattan: {
        name: 'Manhattan',
        func: (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y),
        description: 'Suma de diferencias absolutas',
        efficiency: 'Alta (solo sumas)',
        shape: 'Cuadrada/Rombo'
    },
    chebyshev: {
        name: 'Chebyshev',
        func: (p1, p2) => Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y)),
        description: 'Máxima diferencia',
        efficiency: 'Muy alta (solo max)',
        shape: 'Cuadrada'
    }
};

// ===== VARIABLES GLOBALES =====
let svg, width, height, currentMetric = 'euclidean', currentEpsilon = 40, currentMinPts = 3;
let clusterResults = { clusters: [], noise: [], corePoints: [], borderPoints: [] };

// ===== FUNCIÓN PARA DIMENSIONES RESPONSIVE CON ESCALADO =====
function getResponsiveDimensions() {
    const container = document.querySelector('.demo-section');
    let containerWidth = container ? container.offsetWidth - 40 : 800;
    
    // Limitar ancho máximo y asegurar mínimo
    containerWidth = Math.min(Math.max(containerWidth, 280), 800);
    
    return {
        width: containerWidth,
        height: Math.max(containerWidth * 0.6, 350),
        // Factor de escala para que todo quepa en pantallas pequeñas
        scale: containerWidth < 400 ? containerWidth / 550 : 1
    };
}

// ===== ALGORITMO DBSCAN CON MÉTRICA PERSONALIZABLE =====
function runDBSCANWithMetric(points, eps, minPts, metricName) {
    console.log(`🔍 Ejecutando DBSCAN con métrica ${metricName}, eps=${eps}, minPts=${minPts}`);
    
    const metric = metrics[metricName];
    const distanceFunc = metric.func;
    
    // Reinicializar todos los puntos
    const pointsCopy = points.map(p => ({
        ...p,
        visited: false,
        cluster: -1,
        type: 'unclassified'
    }));
    
    const clusters = [];
    let currentCluster = 0;
    const corePoints = [];
    const borderPoints = [];
    const noisePoints = [];
    
    // Función para encontrar vecinos dentro del radio eps
    function getNeighbors(point) {
        const neighbors = pointsCopy.filter(p => 
            p.id !== point.id && distanceFunc(point, p) <= eps
        );
        console.log(`   📍 Punto ${point.id} (${metric.name}): ${neighbors.length} vecinos`);
        return neighbors;
    }
    
    // Función para expandir cluster
    function expandCluster(point, neighbors, clusterId) {
        point.cluster = clusterId;
        point.type = 'core';
        console.log(`   🎯 Punto ${point.id} es CORE del cluster ${clusterId}`);
        
        let i = 0;
        while (i < neighbors.length) {
            const neighbor = neighbors[i];
            
            if (!neighbor.visited) {
                neighbor.visited = true;
                const neighborNeighbors = getNeighbors(neighbor);
                
                if (neighborNeighbors.length >= minPts) {
                    console.log(`   🎯 Punto ${neighbor.id} también es CORE`);
                    neighbor.type = 'core';
                    
                    // Agregar nuevos vecinos únicos
                    neighborNeighbors.forEach(nn => {
                        if (!neighbors.some(existing => existing.id === nn.id)) {
                            neighbors.push(nn);
                        }
                    });
                }
            }
            
            if (neighbor.cluster === -1) {
                neighbor.cluster = clusterId;
                if (neighbor.type !== 'core') {
                    neighbor.type = 'border';
                    console.log(`   🔵 Punto ${neighbor.id} es BORDER del cluster ${clusterId}`);
                }
            }
            
            i++;
        }
    }
    
    // ===== ALGORITMO PRINCIPAL =====
    console.log(`🚀 Iniciando DBSCAN con métrica ${metric.name}...`);
    
    for (const point of pointsCopy) {
        if (point.visited) continue;
        
        point.visited = true;
        const neighbors = getNeighbors(point);
        
        if (neighbors.length < minPts) {
            point.type = 'noise';
            console.log(`   ❌ Punto ${point.id}: No es core (${neighbors.length} < ${minPts})`);
        } else {
            console.log(`   ✅ Punto ${point.id}: ES CORE, creando cluster ${currentCluster}`);
            expandCluster(point, neighbors, currentCluster);
            currentCluster++;
        }
    }
    
    // ===== CLASIFICACIÓN FINAL =====
    pointsCopy.forEach(point => {
        if (point.type === 'core') {
            corePoints.push(point);
        } else if (point.cluster !== -1) {
            point.type = 'border';
            borderPoints.push(point);
        } else {
            point.type = 'noise';
            noisePoints.push(point);
        }
    });
    
    // Crear arrays de clusters
    for (let i = 0; i < currentCluster; i++) {
        const clusterPoints = pointsCopy.filter(p => p.cluster === i);
        clusters.push(clusterPoints);
    }
    
    const results = {
        clusters,
        noise: noisePoints,
        corePoints,
        borderPoints,
        allPoints: pointsCopy,
        metric: metricName
    };
    
    console.log(`✅ DBSCAN (${metric.name}) COMPLETADO:`, {
        clusters: clusters.length,
        corePoints: corePoints.length,
        borderPoints: borderPoints.length,
        noisePoints: noisePoints.length
    });
    
    return results;
}

// ===== COLORES PARA VISUALIZACIÓN =====
const clusterColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#27ae60', '#8e44ad'
];

// ===== FUNCIÓN DE VISUALIZACIÓN COMPLETA =====
function createVisualization() {
    // Limpiar visualización anterior
    d3.select("#metric-visualization").selectAll("*").remove();
    
    const dims = getResponsiveDimensions();
    width = dims.width;
    height = dims.height;
    const scale = dims.scale;
    
    // Crear SVG responsive
    svg = d3.select("#metric-visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "2px solid #bdc3c7")
        .style("border-radius", "10px")
        .style("background", "#f8f9fa");
    
    // Crear grupo con transformación de escala para móviles
    const mainGroup = svg.append("g")
        .attr("transform", `scale(${scale}) translate(${scale < 1 ? 20 : 0}, ${scale < 1 ? 10 : 0})`);
    
    // Ejecutar DBSCAN con métrica actual
    clusterResults = runDBSCANWithMetric(sampleData, currentEpsilon, currentMinPts, currentMetric);
    
    // ===== DIBUJAR CÍRCULOS DE EPSILON PARA CORE POINTS =====
    console.log(`🎯 Dibujando círculos de epsilon (${metrics[currentMetric].name})`);
    
    const epsilonGroup = mainGroup.append("g").attr("class", "epsilon-circles");
    
    if (clusterResults.corePoints && clusterResults.corePoints.length > 0) {
        clusterResults.corePoints.forEach((corePoint, index) => {
            // Dibujar círculo diferente según la métrica
            if (currentMetric === 'euclidean') {
                // Círculo normal para Euclidiana
                epsilonGroup.append("circle")
                    .attr("cx", corePoint.x)
                    .attr("cy", corePoint.y)
                    .attr("r", currentEpsilon)
                    .attr("fill", "rgba(52, 152, 219, 0.1)")
                    .attr("stroke", "#3498db")
                    .attr("stroke-width", scale < 1 ? 1.5 : 2)
                    .attr("stroke-dasharray", "8,4")
                    .attr("opacity", 0.6);
            } else if (currentMetric === 'manhattan') {
                // Rombo para Manhattan
                const diamond = `M ${corePoint.x},${corePoint.y - currentEpsilon} 
                               L ${corePoint.x + currentEpsilon},${corePoint.y} 
                               L ${corePoint.x},${corePoint.y + currentEpsilon} 
                               L ${corePoint.x - currentEpsilon},${corePoint.y} Z`;
                
                epsilonGroup.append("path")
                    .attr("d", diamond)
                    .attr("fill", "rgba(241, 196, 15, 0.1)")
                    .attr("stroke", "#f1c40f")
                    .attr("stroke-width", scale < 1 ? 1.5 : 2)
                    .attr("stroke-dasharray", "8,4")
                    .attr("opacity", 0.6);
            } else if (currentMetric === 'chebyshev') {
                // Cuadrado para Chebyshev
                epsilonGroup.append("rect")
                    .attr("x", corePoint.x - currentEpsilon)
                    .attr("y", corePoint.y - currentEpsilon)
                    .attr("width", currentEpsilon * 2)
                    .attr("height", currentEpsilon * 2)
                    .attr("fill", "rgba(155, 89, 182, 0.1)")
                    .attr("stroke", "#9b59b6")
                    .attr("stroke-width", scale < 1 ? 1.5 : 2)
                    .attr("stroke-dasharray", "8,4")
                    .attr("opacity", 0.6);
            }
            
            console.log(`   ✓ Forma ${index + 1}: Core point ${corePoint.id} (${metrics[currentMetric].name})`);
        });
    }
    
    // ===== DIBUJAR PUNTOS COLOREADOS POR CLUSTER =====
    const pointsGroup = mainGroup.append("g").attr("class", "data-points");
    
    clusterResults.allPoints.forEach(point => {
        let color, size, strokeColor, strokeWidth;
        
        if (point.type === 'noise') {
            color = '#95a5a6';
            size = scale < 1 ? 5 : 6;
            strokeColor = '#7f8c8d';
            strokeWidth = scale < 1 ? 1.5 : 2;
        } else if (point.type === 'core') {
            color = clusterColors[point.cluster % clusterColors.length];
            size = scale < 1 ? 8 : 10;
            strokeColor = '#2c3e50';
            strokeWidth = scale < 1 ? 2 : 3;
        } else { // border
            color = clusterColors[point.cluster % clusterColors.length];
            size = scale < 1 ? 6 : 8;
            strokeColor = '#34495e';
            strokeWidth = scale < 1 ? 1.5 : 2;
        }
        
        pointsGroup.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", size)
            .attr("fill", color)
            .attr("stroke", strokeColor)
            .attr("stroke-width", strokeWidth)
            .style("cursor", "pointer")
            .append("title")
            .text(`ID: ${point.id} | Tipo: ${point.type} | Cluster: ${point.cluster === -1 ? 'Ruido' : point.cluster} | Métrica: ${metrics[currentMetric].name}`);
    });

    // ===== AGREGAR LEYENDA MEJORADA =====
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - (scale < 1 ? 120 : 140)}, ${scale < 1 ? 10 : 20})`);
    
    // Fondo para la leyenda
    const legendWidth = scale < 1 ? 110 : 130;
    const legendHeight = scale < 1 ? 120 : 140;
    const fontSize = scale < 1 ? "10px" : "12px";
    
    legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "white")
        .attr("stroke", "#bdc3c7")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("opacity", 0.9);
    
    // Core points
    legend.append("circle")
        .attr("cx", 10).attr("cy", 10).attr("r", scale < 1 ? 8 : 10)
        .attr("fill", "#e74c3c").attr("stroke", "#2c3e50").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 25).attr("y", 15)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Core point");
    
    // Border points
    legend.append("circle")
        .attr("cx", 10).attr("cy", 28).attr("r", scale < 1 ? 6 : 8)
        .attr("fill", "#3498db").attr("stroke", "#34495e").attr("stroke-width", scale < 1 ? 1.5 : 2);
    legend.append("text")
        .attr("x", 25).attr("y", 33)
        .style("font-size", fontSize).style("fill", "#2c3e50")
        .text("Border point");
    
    // Noise points
    legend.append("circle")
        .attr("cx", 10).attr("cy", 46).attr("r", scale < 1 ? 5 : 6)
        .attr("fill", "#95a5a6").attr("stroke", "#7f8c8d").attr("stroke-width", scale < 1 ? 1.5 : 2);
    legend.append("text")
        .attr("x", 25).attr("y", 51)
        .style("font-size", fontSize).style("fill", "#2c3e50")
        .text("Ruido");
    
    // Forma de métrica actual
    let shapeY = 64;
    if (currentMetric === 'euclidean') {
        legend.append("circle")
            .attr("cx", 10).attr("cy", shapeY).attr("r", scale < 1 ? 10 : 12)
            .attr("fill", "rgba(52, 152, 219, 0.1)")
            .attr("stroke", "#3498db")
            .attr("stroke-dasharray", "4,2")
            .attr("stroke-width", scale < 1 ? 1.5 : 2);
    } else if (currentMetric === 'manhattan') {
        const size = scale < 1 ? 8 : 10;
        const diamond = `M ${10},${shapeY - size} L ${10 + size},${shapeY} L ${10},${shapeY + size} L ${10 - size},${shapeY} Z`;
        legend.append("path")
            .attr("d", diamond)
            .attr("fill", "rgba(241, 196, 15, 0.1)")
            .attr("stroke", "#f1c40f")
            .attr("stroke-dasharray", "4,2")
            .attr("stroke-width", scale < 1 ? 1.5 : 2);
    } else if (currentMetric === 'chebyshev') {
        const size = scale < 1 ? 8 : 10;
        legend.append("rect")
            .attr("x", 10 - size).attr("y", shapeY - size)
            .attr("width", size * 2).attr("height", size * 2)
            .attr("fill", "rgba(155, 89, 182, 0.1)")
            .attr("stroke", "#9b59b6")
            .attr("stroke-dasharray", "4,2")
            .attr("stroke-width", scale < 1 ? 1.5 : 2);
    }
    
    legend.append("text")
        .attr("x", 25).attr("y", shapeY + 5)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text(`${metrics[currentMetric].name}`);
    
    // Información adicional (solo en pantallas más grandes)
    if (scale >= 1) {
        legend.append("text")
            .attr("x", 5).attr("y", 100)
            .style("font-size", "10px").style("fill", "#7f8c8d")
            .text(`ε=${currentEpsilon}, minPts=${currentMinPts}`);
            
        legend.append("text")
            .attr("x", 5).attr("y", 115)
            .style("font-size", "10px").style("fill", "#7f8c8d")
            .text(`${clusterResults.clusters.length} clusters, ${clusterResults.noise.length} ruido`);
    }
    
    // ===== ACTUALIZAR ESTADÍSTICAS =====
    updateStatistics();
    
    console.log(`🎨 Visualización completa (${metrics[currentMetric].name}) con escala ${scale}`);
}

// ===== ACTUALIZAR ESTADÍSTICAS EN LA UI =====
function updateStatistics() {
    document.getElementById('currentMetric').textContent = metrics[currentMetric].name;
    document.getElementById('clusterCount').textContent = clusterResults.clusters.length;
    document.getElementById('noiseCount').textContent = clusterResults.noise.length;
    document.getElementById('efficiency').textContent = metrics[currentMetric].efficiency;
}

// ===== INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando DBSCAN Q5 - Métricas de Distancia');
    
    // ===== CONFIGURAR CONTROLES INTERACTIVOS =====
    const metricSelect = document.getElementById('metricSelect');
    const epsilonSlider = document.getElementById('epsilonSlider');
    const minPtsSlider = document.getElementById('minPtsSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const minPtsValue = document.getElementById('minPtsValue');
    const resetButton = document.getElementById('resetDemo');
    
    // Event listener para selector de métrica - CAMBIO AUTOMÁTICO
    metricSelect.addEventListener('change', function() {
        currentMetric = this.value;
        console.log(`📐 Métrica cambiada a: ${metrics[currentMetric].name} - Actualizando visualización...`);
        createVisualization();
    });
    
    // Event listeners para sliders - CAMBIOS EN TIEMPO REAL
    epsilonSlider.addEventListener('input', function() {
        currentEpsilon = parseInt(this.value);
        epsilonValue.textContent = currentEpsilon;
        console.log(`📏 Epsilon cambiado a: ${currentEpsilon} - Actualizando visualización...`);
        createVisualization();
    });
    
    minPtsSlider.addEventListener('input', function() {
        currentMinPts = parseInt(this.value);
        minPtsValue.textContent = currentMinPts;
        console.log(`📊 MinPts cambiado a: ${currentMinPts} - Actualizando visualización...`);
        createVisualization();
    });
    
    // Event listener para botón de reset
    resetButton.addEventListener('click', function() {
        console.log('🔄 Reiniciando a valores óptimos');
        currentMetric = 'euclidean';
        currentEpsilon = 40;
        currentMinPts = 3;
        metricSelect.value = 'euclidean';
        epsilonSlider.value = 40;
        minPtsSlider.value = 3;
        epsilonValue.textContent = 40;
        minPtsValue.textContent = 3;
        createVisualization();
    });
    
    // ===== CREAR VISUALIZACIÓN INICIAL =====
    createVisualization();
    
    // ===== RESPONSIVE RESIZE =====
    window.addEventListener('resize', function() {
        setTimeout(createVisualization, 200);
    });
    
    console.log('✅ DBSCAN Q5 inicializado correctamente');
});

// ===== VALIDACIÓN FINAL =====
console.log('📋 DBSCAN Q5 JavaScript cargado - Funciones disponibles:');
console.log('   ✓ runDBSCANWithMetric() - Algoritmo con métricas');
console.log('   ✓ createVisualization() - Visualización con formas específicas');
console.log('   ✓ updateStatistics() - Actualización de métricas');
console.log('   ✓ Controles interactivos configurados');
console.log('   ✓ Responsive design con escalado automático');
console.log('   ✓ Tres métricas: Euclidiana, Manhattan, Chebyshev');