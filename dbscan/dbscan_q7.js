// DBSCAN Q7: JavaScript para Valores Pequeños de Epsilon
// Archivo: dbscan_q7.js

// ===== DATASETS EDUCATIVOS PARA MOSTRAR EFECTOS DE EPSILON PEQUEÑO =====
const datasets = {
    dense: [
        // Cluster denso 1 - Puntos MUY concentrados (ideal para epsilon pequeño)
        {x: 100, y: 130, id: 1}, {x: 110, y: 140, id: 2}, {x: 105, y: 125, id: 3},
        {x: 115, y: 135, id: 4}, {x: 95, y: 145, id: 5}, {x: 120, y: 130, id: 6},
        {x: 108, y: 150, id: 7}, {x: 102, y: 120, id: 8}, {x: 118, y: 128, id: 9},
        
        // Cluster denso 2 - MUY concentrado
        {x: 400, y: 160, id: 10}, {x: 410, y: 170, id: 11}, {x: 405, y: 155, id: 12},
        {x: 415, y: 165, id: 13}, {x: 395, y: 175, id: 14}, {x: 420, y: 160, id: 15},
        {x: 408, y: 180, id: 16}, {x: 402, y: 150, id: 17}, {x: 418, y: 158, id: 18},
        
        // Cluster denso 3 - MUY concentrado
        {x: 250, y: 260, id: 19}, {x: 260, y: 270, id: 20}, {x: 255, y: 255, id: 21},
        {x: 265, y: 265, id: 22}, {x: 245, y: 275, id: 23}, {x: 270, y: 260, id: 24},
        
        // Pocos outliers genuinos
        {x: 50, y: 50, id: 25}, {x: 500, y: 80, id: 26}, {x: 80, y: 320, id: 27}
    ],
    
    sparse: [
        // Clusters naturalmente dispersos (problemático para epsilon pequeño)
        {x: 80, y: 100, id: 1}, {x: 140, y: 160, id: 2}, {x: 120, y: 130, id: 3},
        {x: 160, y: 120, id: 4}, {x: 100, y: 180, id: 5}, {x: 180, y: 140, id: 6},
        
        {x: 320, y: 130, id: 7}, {x: 380, y: 190, id: 8}, {x: 360, y: 160, id: 9},
        {x: 400, y: 130, id: 10}, {x: 340, y: 200, id: 11}, {x: 420, y: 170, id: 12},
        
        {x: 200, y: 260, id: 13}, {x: 280, y: 320, id: 14}, {x: 240, y: 290, id: 15},
        {x: 300, y: 260, id: 16}, {x: 220, y: 330, id: 17}, {x: 320, y: 300, id: 18},
        
        // Puntos intermedios
        {x: 160, y: 200, id: 19}, {x: 240, y: 180, id: 20}, {x: 280, y: 220, id: 21},
        
        // Outliers
        {x: 50, y: 50, id: 22}, {x: 450, y: 80, id: 23}, {x: 100, y: 350, id: 24}
    ],
    
    mixed: [
        // Combinación: cluster denso + cluster disperso para comparación directa
        // Cluster denso (izquierda)
        {x: 100, y: 150, id: 1}, {x: 110, y: 160, id: 2}, {x: 105, y: 145, id: 3},
        {x: 115, y: 155, id: 4}, {x: 95, y: 165, id: 5}, {x: 120, y: 150, id: 6},
        
        // Cluster disperso (derecha)  
        {x: 350, y: 120, id: 7}, {x: 410, y: 180, id: 8}, {x: 380, y: 150, id: 9},
        {x: 420, y: 130, id: 10}, {x: 360, y: 200, id: 11}, {x: 440, y: 160, id: 12},
        
        // Cluster medio (centro)
        {x: 240, y: 200, id: 13}, {x: 260, y: 220, id: 14}, {x: 250, y: 190, id: 15},
        {x: 270, y: 210, id: 16}, {x: 230, y: 230, id: 17},
        
        // Outliers
        {x: 50, y: 50, id: 18}, {x: 500, y: 80, id: 19}, {x: 150, y: 320, id: 20}
    ]
};

// ===== VARIABLES GLOBALES =====
let svg, width, height, currentDataset = 'dense', currentEpsilon = 25, currentMinPts = 3, showEpsilonCircles = true;
let clusterResults = { corePoints: [], borderPoints: [], noisePoints: [], clusters: [] };

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

// ===== ALGORITMO DBSCAN ESPECIALIZADO PARA ANÁLISIS DE EPSILON =====
function analyzeEpsilonEffects(points, eps, minPts) {
    console.log(`🔍 Analizando efectos de epsilon pequeño (${eps}) en dataset ${currentDataset}`);
    
    // Crear copia de puntos para análisis
    const pointsCopy = points.map(p => ({
        ...p,
        visited: false,
        cluster: -1,
        type: 'unclassified',
        neighbors: [],
        neighborCount: 0,
        distanceToNearestCore: Infinity
    }));
    
    // ===== PASO 1: CALCULAR VECINDARIOS =====
    console.log('📐 Calculando vecindarios con epsilon:', eps);
    pointsCopy.forEach(point => {
        const neighbors = pointsCopy.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighbors = neighbors;
        point.neighborCount = neighbors.length;
        console.log(`   📍 Punto ${point.id}: ${point.neighborCount} vecinos (umbral: ${minPts})`);
    });
    
    // ===== PASO 2: IDENTIFICAR CORE POINTS =====
    console.log('🎯 Identificando core points...');
    const corePoints = [];
    pointsCopy.forEach(point => {
        if (point.neighborCount >= minPts) {
            point.type = 'core';
            corePoints.push(point);
            console.log(`   🔵 Punto ${point.id} es CORE (${point.neighborCount} ≥ ${minPts})`);
        }
    });
    
    // ===== PASO 3: FORMAR CLUSTERS DESDE CORE POINTS =====
    console.log('🔗 Formando clusters...');
    let currentCluster = 0;
    const clusters = [];
    
    function expandCluster(corePoint, clusterId) {
        if (corePoint.visited) return;
        
        corePoint.visited = true;
        corePoint.cluster = clusterId;
        
        const queue = [...corePoint.neighbors];
        
        while (queue.length > 0) {
            const neighbor = queue.shift();
            
            if (!neighbor.visited) {
                neighbor.visited = true;
                neighbor.cluster = clusterId;
                
                // Si el vecino también es core, agregar sus vecinos
                if (neighbor.type === 'core') {
                    queue.push(...neighbor.neighbors.filter(nn => !nn.visited));
                }
            } else if (neighbor.cluster === -1) {
                neighbor.cluster = clusterId;
            }
        }
    }
    
    corePoints.forEach(corePoint => {
        if (!corePoint.visited) {
            console.log(`   🌟 Creando cluster ${currentCluster} desde core point ${corePoint.id}`);
            expandCluster(corePoint, currentCluster);
            currentCluster++;
        }
    });
    
    // ===== PASO 4: CLASIFICAR BORDER Y NOISE POINTS =====
    console.log('🏷️ Clasificando border y noise points...');
    const borderPoints = [];
    const noisePoints = [];
    
    pointsCopy.forEach(point => {
        if (point.type !== 'core') {
            // Calcular distancia al core point más cercano
            const nearestCoreDistance = Math.min(...corePoints.map(corePoint => 
                Math.sqrt(Math.pow(point.x - corePoint.x, 2) + Math.pow(point.y - corePoint.y, 2))
            ));
            point.distanceToNearestCore = nearestCoreDistance;
            
            if (nearestCoreDistance <= eps && point.cluster !== -1) {
                point.type = 'border';
                borderPoints.push(point);
                console.log(`   🟡 Punto ${point.id} es BORDER (distancia a core: ${nearestCoreDistance.toFixed(1)})`);
            } else {
                point.type = 'noise';
                point.cluster = -1;
                noisePoints.push(point);
                console.log(`   🔴 Punto ${point.id} es NOISE (distancia a core: ${nearestCoreDistance.toFixed(1)})`);
            }
        }
    });
    
    // ===== CREAR ARRAYS DE CLUSTERS =====
    for (let i = 0; i < currentCluster; i++) {
        const clusterPoints = pointsCopy.filter(p => p.cluster === i);
        clusters.push(clusterPoints);
        console.log(`   🎨 Cluster ${i}: ${clusterPoints.length} puntos (${clusterPoints.filter(p => p.type === 'core').length} core, ${clusterPoints.filter(p => p.type === 'border').length} border)`);
    }
    
    // ===== ANÁLISIS DE EFECTIVIDAD DE EPSILON =====
    const totalPoints = pointsCopy.length;
    const noiseRatio = (noisePoints.length / totalPoints * 100).toFixed(1);
    const coreRatio = (corePoints.length / totalPoints * 100).toFixed(1);
    
    let effectiveness = "Excelente";
    if (parseFloat(noiseRatio) > 60) {
        effectiveness = "Problemático (mucho ruido)";
    } else if (parseFloat(noiseRatio) > 40) {
        effectiveness = "Subóptimo";
    } else if (parseFloat(noiseRatio) > 20) {
        effectiveness = "Aceptable";
    } else if (parseFloat(coreRatio) > 80) {
        effectiveness = "Demasiado permisivo";
    }
    
    const results = {
        corePoints,
        borderPoints,
        noisePoints,
        clusters,
        allPoints: pointsCopy,
        effectiveness,
        stats: {
            noiseRatio,
            coreRatio,
            clusterCount: clusters.length
        }
    };
    
    console.log(`✅ Análisis de epsilon ${eps} completado:`, {
        dataset: currentDataset,
        corePoints: corePoints.length,
        borderPoints: borderPoints.length,
        noisePoints: noisePoints.length,
        clusters: clusters.length,
        effectiveness
    });
    
    return results;
}

// ===== COLORES PARA VISUALIZACIÓN =====
const epsilonColors = {
    core: '#3498db',      // Azul para core points
    border: '#f39c12',    // Naranja para border points  
    noise: '#e74c3c',     // Rojo para noise points
    epsilon: '#9b59b6'    // Morado para círculos epsilon
};

const clusterColors = [
    '#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#27ae60', '#8e44ad'
];

// ===== FUNCIÓN DE VISUALIZACIÓN COMPLETA CON CÍRCULOS EPSILON CORREGIDOS =====
function createEpsilonVisualization() {
    // Limpiar visualización anterior
    d3.select("#epsilon-comparison").selectAll("*").remove();
    
    const dims = getResponsiveDimensions();
    width = dims.width;
    height = dims.height;
    const scale = dims.scale;
    
    console.log(`🎨 Creando visualización con dimensiones: ${width}x${height}, escala: ${scale}`);
    
    // Crear SVG responsive
    svg = d3.select("#epsilon-comparison")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "2px solid #bdc3c7")
        .style("border-radius", "10px")
        .style("background", "#f8f9fa");
    
    // Crear grupo con transformación de escala para móviles
    const mainGroup = svg.append("g")
        .attr("transform", `scale(${scale}) translate(${scale < 1 ? 20 : 0}, ${scale < 1 ? 10 : 0})`);
    
    // Obtener dataset actual y ejecutar análisis
    const currentData = datasets[currentDataset];
    clusterResults = analyzeEpsilonEffects(currentData, currentEpsilon, currentMinPts);
    
    // ===== DIBUJAR CÍRCULOS DE EPSILON PRIMERO (DEBAJO DE LOS PUNTOS) =====
    if (showEpsilonCircles && clusterResults.corePoints.length > 0) {
        console.log(`🎯 Dibujando ${clusterResults.corePoints.length} círculos de epsilon`);
        
        const epsilonGroup = mainGroup.append("g").attr("class", "epsilon-circles");
        
        clusterResults.corePoints.forEach((corePoint, index) => {
            console.log(`   ✓ Dibujando círculo ${index + 1}: Core point ${corePoint.id} en (${corePoint.x}, ${corePoint.y})`);
            
            epsilonGroup.append("circle")
                .attr("cx", corePoint.x)
                .attr("cy", corePoint.y)
                .attr("r", currentEpsilon)
                .attr("fill", "rgba(155, 89, 182, 0.08)")
                .attr("stroke", epsilonColors.epsilon)
                .attr("stroke-width", scale < 1 ? 1.5 : 2)
                .attr("stroke-dasharray", "8,4")
                .attr("opacity", 0.7)
                .style("pointer-events", "none");
        });
        
        console.log(`✅ ${clusterResults.corePoints.length} círculos de epsilon dibujados correctamente`);
    } else if (showEpsilonCircles) {
        console.warn("⚠️ No hay core points para dibujar círculos de epsilon");
    }
    
    // ===== DIBUJAR LÍNEAS DE CONECTIVIDAD ENTRE CORE POINTS Y SUS VECINOS =====
    if (currentEpsilon <= 35) { // Solo mostrar conexiones con epsilon pequeño para no saturar
        const connectionsGroup = mainGroup.append("g").attr("class", "connections");
        
        clusterResults.corePoints.forEach(corePoint => {
            corePoint.neighbors.forEach(neighbor => {
                if (neighbor.cluster === corePoint.cluster && neighbor.cluster !== -1) {
                    const clusterColor = clusterColors[corePoint.cluster % clusterColors.length];
                    
                    connectionsGroup.append("line")
                        .attr("x1", corePoint.x)
                        .attr("y1", corePoint.y)
                        .attr("x2", neighbor.x)
                        .attr("y2", neighbor.y)
                        .attr("stroke", clusterColor)
                        .attr("stroke-width", scale < 1 ? 0.8 : 1.2)
                        .attr("opacity", 0.4)
                        .style("pointer-events", "none");
                }
            });
        });
    }
    
    // ===== DIBUJAR PUNTOS COLOREADOS POR TIPO =====
    const pointsGroup = mainGroup.append("g").attr("class", "data-points");
    
    clusterResults.allPoints.forEach(point => {
        let color, size, strokeColor, strokeWidth;
        
        if (point.type === 'noise') {
            color = epsilonColors.noise;
            size = scale < 1 ? 6 : 8;
            strokeColor = '#c0392b';
            strokeWidth = scale < 1 ? 2 : 3;
        } else if (point.type === 'core') {
            color = epsilonColors.core;
            size = scale < 1 ? 9 : 12;
            strokeColor = '#2980b9';
            strokeWidth = scale < 1 ? 2 : 3;
        } else { // border
            color = epsilonColors.border;
            size = scale < 1 ? 7 : 10;
            strokeColor = '#e67e22';
            strokeWidth = scale < 1 ? 2 : 3;
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
            .text(`ID: ${point.id} | Tipo: ${point.type.toUpperCase()} | Vecinos: ${point.neighborCount} | Cluster: ${point.cluster === -1 ? 'Ninguno' : point.cluster} | Dist. core más cercano: ${point.distanceToNearestCore.toFixed(1)}`);
    });

    // ===== AGREGAR LEYENDA MEJORADA =====
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - (scale < 1 ? 140 : 160)}, ${scale < 1 ? 10 : 20})`);
    
    // Fondo para la leyenda
    const legendWidth = scale < 1 ? 130 : 150;
    const legendHeight = scale < 1 ? 140 : 160;
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
        .attr("opacity", 0.95);
    
    // Core points
    legend.append("circle")
        .attr("cx", 15).attr("cy", 15).attr("r", scale < 1 ? 9 : 12)
        .attr("fill", epsilonColors.core).attr("stroke", "#2980b9").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 35).attr("y", 20)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Core Points");
    
    // Border points
    legend.append("circle")
        .attr("cx", 15).attr("cy", 35).attr("r", scale < 1 ? 7 : 10)
        .attr("fill", epsilonColors.border).attr("stroke", "#e67e22").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 35).attr("y", 40)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Border Points");
    
    // Noise points
    legend.append("circle")
        .attr("cx", 15).attr("cy", 55).attr("r", scale < 1 ? 6 : 8)
        .attr("fill", epsilonColors.noise).attr("stroke", "#c0392b").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 35).attr("y", 60)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Noise Points");
    
    // Epsilon circles (si están habilitados)
    if (showEpsilonCircles) {
        legend.append("circle")
            .attr("cx", 15).attr("cy", 75).attr("r", scale < 1 ? 10 : 12)
            .attr("fill", "rgba(155, 89, 182, 0.08)")
            .attr("stroke", epsilonColors.epsilon)
            .attr("stroke-dasharray", "4,2")
            .attr("stroke-width", scale < 1 ? 1.5 : 2);
        legend.append("text")
            .attr("x", 35).attr("y", 80)
            .style("font-size", fontSize).style("fill", "#2c3e50")
            .text(`Radio ε=${currentEpsilon}`);
    }
    
    // Información del dataset
    legend.append("text")
        .attr("x", 10).attr("y", 105)
        .style("font-size", scale < 1 ? "9px" : "10px").style("fill", "#7f8c8d")
        .text(`Dataset: ${getDatasetDisplayName()}`);
    
    // Estadísticas (solo en pantallas más grandes)
    if (scale >= 1) {
        legend.append("text")
            .attr("x", 10).attr("y", 125)
            .style("font-size", "10px").style("fill", "#7f8c8d")
            .text(`Efectividad: ${clusterResults.effectiveness}`);
            
        legend.append("text")
            .attr("x", 10).attr("y", 140)
            .style("font-size", "10px").style("fill", "#7f8c8d")
            .text(`${clusterResults.clusters.length} clusters, ${clusterResults.stats.noiseRatio}% ruido`);
    }
    
    // ===== ACTUALIZAR ESTADÍSTICAS =====
    updateEpsilonStatistics();
    
    console.log(`🎨 Visualización de epsilon completa con escala ${scale}`);
}

// ===== FUNCIÓN AUXILIAR PARA NOMBRES DE DATASETS =====
function getDatasetDisplayName() {
    const names = {
        'dense': 'Densos',
        'sparse': 'Dispersos', 
        'mixed': 'Mixtos'
    };
    return names[currentDataset] || currentDataset;
}

// ===== ACTUALIZAR ESTADÍSTICAS EN LA UI =====
function updateEpsilonStatistics() {
    document.getElementById('currentDataset').textContent = getDatasetDisplayName();
    document.getElementById('clusterCount').textContent = clusterResults.clusters.length;
    document.getElementById('noiseCount').textContent = clusterResults.noisePoints.length;
    document.getElementById('epsilonEffectiveness').textContent = clusterResults.effectiveness;
}

// ===== INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando DBSCAN Q7 - Valores Pequeños de Epsilon');
    
    // ===== CONFIGURAR CONTROLES INTERACTIVOS =====
    const datasetSelect = document.getElementById('datasetSelect');
    const epsilonSlider = document.getElementById('epsilonSlider');
    const minPtsSlider = document.getElementById('minPtsSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const minPtsValue = document.getElementById('minPtsValue');
    const showEpsilonCheckbox = document.getElementById('showEpsilonCircles');
    const resetButton = document.getElementById('resetDemo');
    
    // Event listener para selector de dataset - CAMBIO AUTOMÁTICO
    datasetSelect.addEventListener('change', function() {
        currentDataset = this.value;
        console.log(`📊 Dataset cambiado a: ${getDatasetDisplayName()} - Actualizando visualización...`);
        createEpsilonVisualization();
    });
    
    // Event listeners para sliders - CAMBIOS EN TIEMPO REAL
    epsilonSlider.addEventListener('input', function() {
        currentEpsilon = parseInt(this.value);
        epsilonValue.textContent = currentEpsilon;
        console.log(`📏 Epsilon cambiado a: ${currentEpsilon} - Actualizando efectos...`);
        createEpsilonVisualization();
    });
    
    minPtsSlider.addEventListener('input', function() {
        currentMinPts = parseInt(this.value);
        minPtsValue.textContent = currentMinPts;
        console.log(`📊 MinPts cambiado a: ${currentMinPts} - Actualizando efectos...`);
        createEpsilonVisualization();
    });
    
    // Event listener para checkbox de círculos epsilon
    showEpsilonCheckbox.addEventListener('change', function() {
        showEpsilonCircles = this.checked;
        console.log(`👁️ Círculos epsilon: ${showEpsilonCircles ? 'Mostrar' : 'Ocultar'} - Actualizando...`);
        createEpsilonVisualization();
    });
    
    // Event listener para botón de reset
    resetButton.addEventListener('click', function() {
        console.log('🔄 Reiniciando demo de epsilon pequeño');
        currentDataset = 'dense';
        currentEpsilon = 25;
        currentMinPts = 3;
        showEpsilonCircles = true;
        datasetSelect.value = 'dense';
        epsilonSlider.value = 25;
        minPtsSlider.value = 3;
        epsilonValue.textContent = 25;
        minPtsValue.textContent = 3;
        showEpsilonCheckbox.checked = true;
        createEpsilonVisualization();
    });
    
    // ===== CREAR VISUALIZACIÓN INICIAL =====
    createEpsilonVisualization();
    
    // ===== RESPONSIVE RESIZE =====
    window.addEventListener('resize', function() {
        setTimeout(createEpsilonVisualization, 200);
    });
    
    console.log('✅ DBSCAN Q7 inicializado correctamente');
});

// ===== FUNCIONES ADICIONALES PARA ANÁLISIS EDUCATIVO =====

// Función para analizar efectividad por tipo de dataset
function analyzeDatasetSuitability() {
    const avgDistances = calculateAverageDistances();
    const recommendations = [];
    
    if (currentDataset === 'dense' && currentEpsilon <= 30) {
        recommendations.push("✅ Combinación ideal: datos densos + epsilon pequeño");
    } else if (currentDataset === 'sparse' && currentEpsilon <= 30) {
        recommendations.push("⚠️ Problemático: datos dispersos + epsilon pequeño = mucho ruido");
    } else if (currentDataset === 'mixed') {
        recommendations.push("💡 Dataset mixto: observa diferencias entre clusters densos y dispersos");
    }
    
    console.log("💡 Análisis de idoneidad:", recommendations);
    return { avgDistances, recommendations };
}

// Función para calcular distancias promedio
function calculateAverageDistances() {
    const points = datasets[currentDataset];
    let totalDistance = 0;
    let count = 0;
    
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const distance = Math.sqrt(
                Math.pow(points[i].x - points[j].x, 2) + 
                Math.pow(points[i].y - points[j].y, 2)
            );
            totalDistance += distance;
            count++;
        }
    }
    
    const avgDistance = totalDistance / count;
    console.log(`📊 Distancia promedio en dataset ${currentDataset}: ${avgDistance.toFixed(2)}`);
    return avgDistance;
}

// ===== VALIDACIÓN FINAL =====
console.log('📋 DBSCAN Q7 JavaScript cargado - Funciones disponibles:');
console.log('   ✓ analyzeEpsilonEffects() - Análisis especializado en epsilon pequeño');
console.log('   ✓ createEpsilonVisualization() - Visualización con círculos epsilon CORREGIDOS');
console.log('   ✓ updateEpsilonStatistics() - Estadísticas de efectividad');
console.log('   ✓ analyzeDatasetSuitability() - Análisis de idoneidad');
console.log('   ✓ calculateAverageDistances() - Métricas de distancia');
console.log('   ✓ 3 datasets educativos: denso, disperso, mixto');
console.log('   ✓ Responsive design con escalado automático');
console.log('   ✓ CÍRCULOS EPSILON CORREGIDOS - Ahora se muestran correctamente');