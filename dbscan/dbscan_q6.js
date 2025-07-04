// DBSCAN Q6: JavaScript para Conceptos Fundamentales
// Archivo: dbscan_q6.js

// ===== DATOS EDUCATIVOS DISEÑADOS PARA MOSTRAR LOS 3 CONCEPTOS =====
const conceptData = [
    // Cluster denso 1 (izquierda) - Puntos más separados para ver efectos
    {x: 100, y: 130, id: 1}, {x: 130, y: 140, id: 2}, {x: 120, y: 110, id: 3},
    {x: 150, y: 125, id: 4}, {x: 110, y: 160, id: 5}, {x: 140, y: 105, id: 6},
    {x: 125, y: 145, id: 7}, {x: 145, y: 115, id: 8},
    
    // Cluster denso 2 (derecha) - Más separación horizontal
    {x: 400, y: 160, id: 9}, {x: 430, y: 170, id: 10}, {x: 420, y: 140, id: 11},
    {x: 450, y: 155, id: 12}, {x: 410, y: 185, id: 13}, {x: 440, y: 135, id: 14},
    {x: 425, y: 175, id: 15}, {x: 455, y: 145, id: 16},
    
    // Cluster moderado 3 (centro-arriba) - Más espaciado para sensibilidad
    {x: 260, y: 80, id: 17}, {x: 300, y: 90, id: 18}, {x: 280, y: 60, id: 19},
    {x: 320, y: 75, id: 20}, {x: 270, y: 105, id: 21}, {x: 310, y: 55, id: 22},
    
    // Cluster disperso 4 (centro-abajo) - Muy espaciado para mostrar sensibilidad a minPts
    {x: 230, y: 280, id: 23}, {x: 280, y: 290, id: 24}, {x: 250, y: 260, id: 25},
    {x: 300, y: 275, id: 26}, {x: 240, y: 310, id: 27},
    
    // Puntos intermedios estratégicos (potenciales BORDER según parámetros)
    {x: 180, y: 160, id: 28}, {x: 200, y: 180, id: 29}, {x: 340, y: 130, id: 30},
    {x: 360, y: 150, id: 31}, {x: 200, y: 240, id: 32}, {x: 320, y: 200, id: 33},
    
    // Puntos de transición (críticos para mostrar efectos de epsilon)
    {x: 170, y: 200, id: 34}, {x: 350, y: 180, id: 35}, {x: 190, y: 120, id: 36},
    
    // Puntos aislados (NOISE garantizado con parámetros normales)
    {x: 50, y: 300, id: 37}, {x: 500, y: 50, id: 38}, {x: 30, y: 30, id: 39},
    {x: 520, y: 320, id: 40}, {x: 150, y: 330, id: 41}
];

// ===== VARIABLES GLOBALES =====
let svg, width, height, currentEpsilon = 40, currentMinPts = 3, showEpsilonCircles = true;
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

// ===== ALGORITMO DBSCAN ENFOCADO EN CONCEPTOS FUNDAMENTALES =====
function analyzeConceptsDBSCAN(points, eps, minPts) {
    console.log(`🔍 Analizando conceptos DBSCAN con eps=${eps}, minPts=${minPts}`);
    
    // Crear copia de puntos para análisis
    const pointsCopy = points.map(p => ({
        ...p,
        visited: false,
        cluster: -1,
        type: 'unclassified',
        neighbors: [],
        neighborCount: 0
    }));
    
    // ===== PASO 1: CALCULAR VECINDARIOS PARA TODOS LOS PUNTOS =====
    console.log('📐 Calculando vecindarios...');
    pointsCopy.forEach(point => {
        const neighbors = pointsCopy.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighbors = neighbors;
        point.neighborCount = neighbors.length;
        console.log(`   📍 Punto ${point.id}: ${point.neighborCount} vecinos`);
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
            // Verificar si está cerca de algún core point
            const nearCorePoint = corePoints.some(corePoint => 
                Math.sqrt(Math.pow(point.x - corePoint.x, 2) + Math.pow(point.y - corePoint.y, 2)) <= eps
            );
            
            if (nearCorePoint && point.cluster !== -1) {
                point.type = 'border';
                borderPoints.push(point);
                console.log(`   🟡 Punto ${point.id} es BORDER (cerca de core, cluster ${point.cluster})`);
            } else {
                point.type = 'noise';
                point.cluster = -1;
                noisePoints.push(point);
                console.log(`   🔴 Punto ${point.id} es NOISE (aislado)`);
            }
        }
    });
    
    // ===== CREAR ARRAYS DE CLUSTERS =====
    for (let i = 0; i < currentCluster; i++) {
        const clusterPoints = pointsCopy.filter(p => p.cluster === i);
        clusters.push(clusterPoints);
        console.log(`   🎨 Cluster ${i}: ${clusterPoints.length} puntos (${clusterPoints.filter(p => p.type === 'core').length} core, ${clusterPoints.filter(p => p.type === 'border').length} border)`);
    }
    
    const results = {
        corePoints,
        borderPoints,
        noisePoints,
        clusters,
        allPoints: pointsCopy
    };
    
    console.log(`✅ Análisis DBSCAN completado:`, {
        corePoints: corePoints.length,
        borderPoints: borderPoints.length,
        noisePoints: noisePoints.length,
        clusters: clusters.length,
        totalPoints: pointsCopy.length
    });
    
    return results;
}

// ===== COLORES PARA VISUALIZACIÓN =====
const conceptColors = {
    core: '#3498db',      // Azul para core points
    border: '#f39c12',    // Naranja para border points
    noise: '#e74c3c',     // Rojo para noise points
    epsilon: '#9b59b6'    // Morado para círculos epsilon
};

const clusterColors = [
    '#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#27ae60', '#8e44ad'
];

// ===== FUNCIÓN DE VISUALIZACIÓN COMPLETA =====
function createConceptsVisualization() {
    // Limpiar visualización anterior
    d3.select("#concepts-visualization").selectAll("*").remove();
    
    const dims = getResponsiveDimensions();
    width = dims.width;
    height = dims.height;
    const scale = dims.scale;
    
    // Crear SVG responsive
    svg = d3.select("#concepts-visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "2px solid #bdc3c7")
        .style("border-radius", "10px")
        .style("background", "#f8f9fa");
    
    // Crear grupo con transformación de escala para móviles
    const mainGroup = svg.append("g")
        .attr("transform", `scale(${scale}) translate(${scale < 1 ? 20 : 0}, ${scale < 1 ? 10 : 0})`);
    
    // Ejecutar análisis DBSCAN
    clusterResults = analyzeConceptsDBSCAN(conceptData, currentEpsilon, currentMinPts);
    
    // ===== DIBUJAR CÍRCULOS DE EPSILON (SI ESTÁ HABILITADO) =====
    if (showEpsilonCircles) {
        console.log(`🎯 Dibujando ${clusterResults.corePoints.length} círculos de epsilon`);
        
        const epsilonGroup = mainGroup.append("g").attr("class", "epsilon-circles");
        
        clusterResults.corePoints.forEach((corePoint, index) => {
            epsilonGroup.append("circle")
                .attr("cx", corePoint.x)
                .attr("cy", corePoint.y)
                .attr("r", currentEpsilon)
                .attr("fill", "rgba(52, 152, 219, 0.08)")
                .attr("stroke", conceptColors.epsilon)
                .attr("stroke-width", scale < 1 ? 1 : 1.5)
                .attr("stroke-dasharray", "6,3")
                .attr("opacity", 0.7)
                .style("pointer-events", "none");
            
            console.log(`   ✓ Círculo ${index + 1}: Core point ${corePoint.id}`);
        });
    }
    
    // ===== DIBUJAR LÍNEAS DE CONECTIVIDAD ENTRE PUNTOS DEL MISMO CLUSTER =====
    const connectionsGroup = mainGroup.append("g").attr("class", "connections");
    
    clusterResults.clusters.forEach((cluster, clusterIndex) => {
        const clusterColor = clusterColors[clusterIndex % clusterColors.length];
        
        cluster.forEach(point => {
            if (point.type === 'core') {
                // Dibujar líneas desde core points a sus vecinos en el mismo cluster
                point.neighbors.forEach(neighbor => {
                    if (neighbor.cluster === point.cluster) {
                        connectionsGroup.append("line")
                            .attr("x1", point.x)
                            .attr("y1", point.y)
                            .attr("x2", neighbor.x)
                            .attr("y2", neighbor.y)
                            .attr("stroke", clusterColor)
                            .attr("stroke-width", scale < 1 ? 0.5 : 1)
                            .attr("opacity", 0.3)
                            .style("pointer-events", "none");
                    }
                });
            }
        });
    });
    
    // ===== DIBUJAR PUNTOS COLOREADOS POR TIPO =====
    const pointsGroup = mainGroup.append("g").attr("class", "data-points");
    
    clusterResults.allPoints.forEach(point => {
        let color, size, strokeColor, strokeWidth;
        
        if (point.type === 'noise') {
            color = conceptColors.noise;
            size = scale < 1 ? 6 : 8;
            strokeColor = '#c0392b';
            strokeWidth = scale < 1 ? 2 : 3;
        } else if (point.type === 'core') {
            color = conceptColors.core;
            size = scale < 1 ? 9 : 12;
            strokeColor = '#2980b9';
            strokeWidth = scale < 1 ? 2 : 3;
        } else { // border
            color = conceptColors.border;
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
            .text(`ID: ${point.id} | Tipo: ${point.type.toUpperCase()} | Vecinos: ${point.neighborCount} | Cluster: ${point.cluster === -1 ? 'Ninguno' : point.cluster}`);
    });

    // ===== AGREGAR LEYENDA MEJORADA =====
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - (scale < 1 ? 130 : 150)}, ${scale < 1 ? 10 : 20})`);
    
    // Fondo para la leyenda
    const legendWidth = scale < 1 ? 120 : 140;
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
        .attr("fill", conceptColors.core).attr("stroke", "#2980b9").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 35).attr("y", 20)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Core Points");
    
    // Border points
    legend.append("circle")
        .attr("cx", 15).attr("cy", 35).attr("r", scale < 1 ? 7 : 10)
        .attr("fill", conceptColors.border).attr("stroke", "#e67e22").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 35).attr("y", 40)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Border Points");
    
    // Noise points
    legend.append("circle")
        .attr("cx", 15).attr("cy", 55).attr("r", scale < 1 ? 6 : 8)
        .attr("fill", conceptColors.noise).attr("stroke", "#c0392b").attr("stroke-width", scale < 1 ? 2 : 3);
    legend.append("text")
        .attr("x", 35).attr("y", 60)
        .style("font-size", fontSize).style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Noise Points");
    
    // Epsilon circles (si están habilitados)
    if (showEpsilonCircles) {
        legend.append("circle")
            .attr("cx", 15).attr("cy", 75).attr("r", scale < 1 ? 10 : 12)
            .attr("fill", "rgba(52, 152, 219, 0.08)")
            .attr("stroke", conceptColors.epsilon)
            .attr("stroke-dasharray", "4,2")
            .attr("stroke-width", scale < 1 ? 1 : 1.5);
        legend.append("text")
            .attr("x", 35).attr("y", 80)
            .style("font-size", fontSize).style("fill", "#2c3e50")
            .text(`Radio ε=${currentEpsilon}`);
    }
    
    // Información de parámetros
    legend.append("text")
        .attr("x", 10).attr("y", 105)
        .style("font-size", scale < 1 ? "9px" : "10px").style("fill", "#7f8c8d")
        .text(`MinPts = ${currentMinPts}`);
    
    // Estadísticas (solo en pantallas más grandes)
    if (scale >= 1) {
        legend.append("text")
            .attr("x", 10).attr("y", 125)
            .style("font-size", "10px").style("fill", "#7f8c8d")
            .text(`${clusterResults.clusters.length} clusters`);
            
        legend.append("text")
            .attr("x", 10).attr("y", 140)
            .style("font-size", "10px").style("fill", "#7f8c8d")
            .text(`${clusterResults.allPoints.length} puntos totales`);
    }
    
    // ===== ACTUALIZAR ESTADÍSTICAS =====
    updateConceptStatistics();
    
    console.log(`🎨 Visualización de conceptos completa con escala ${scale}`);
}

// ===== ACTUALIZAR ESTADÍSTICAS EN LA UI =====
function updateConceptStatistics() {
    document.getElementById('coreCount').textContent = clusterResults.corePoints.length;
    document.getElementById('borderCount').textContent = clusterResults.borderPoints.length;
    document.getElementById('noiseCount').textContent = clusterResults.noisePoints.length;
    document.getElementById('clusterCount').textContent = clusterResults.clusters.length;
    document.getElementById('minPtsDisplay').textContent = currentMinPts;
}

// ===== INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando DBSCAN Q6 - Conceptos Fundamentales');
    
    // ===== CONFIGURAR CONTROLES INTERACTIVOS =====
    const epsilonSlider = document.getElementById('epsilonSlider');
    const minPtsSlider = document.getElementById('minPtsSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const minPtsValue = document.getElementById('minPtsValue');
    const showEpsilonCheckbox = document.getElementById('showEpsilonCircles');
    const resetButton = document.getElementById('resetDemo');
    
    // Event listeners para sliders - CAMBIOS EN TIEMPO REAL
    epsilonSlider.addEventListener('input', function() {
        currentEpsilon = parseInt(this.value);
        epsilonValue.textContent = currentEpsilon;
        console.log(`📏 Epsilon cambiado a: ${currentEpsilon} - Actualizando conceptos...`);
        createConceptsVisualization();
    });
    
    minPtsSlider.addEventListener('input', function() {
        currentMinPts = parseInt(this.value);
        minPtsValue.textContent = currentMinPts;
        console.log(`📊 MinPts cambiado a: ${currentMinPts} - Actualizando conceptos...`);
        createConceptsVisualization();
    });
    
    // Event listener para checkbox de círculos epsilon
    showEpsilonCheckbox.addEventListener('change', function() {
        showEpsilonCircles = this.checked;
        console.log(`👁️ Círculos epsilon: ${showEpsilonCircles ? 'Mostrar' : 'Ocultar'} - Actualizando...`);
        createConceptsVisualization();
    });
    
    // Event listener para botón de reset
    resetButton.addEventListener('click', function() {
        console.log('🔄 Reiniciando a valores óptimos para conceptos');
        currentEpsilon = 40;  // Reducido de 45 para mejor separación
        currentMinPts = 3;    // Reducido de 4 para más sensibilidad
        showEpsilonCircles = true;
        epsilonSlider.value = 40;
        minPtsSlider.value = 3;
        epsilonValue.textContent = 40;
        minPtsValue.textContent = 3;
        showEpsilonCheckbox.checked = true;
        createConceptsVisualization();
    });
    
    // ===== CREAR VISUALIZACIÓN INICIAL =====
    createConceptsVisualization();
    
    // ===== RESPONSIVE RESIZE =====
    window.addEventListener('resize', function() {
        setTimeout(createConceptsVisualization, 200);
    });
    
    console.log('✅ DBSCAN Q6 inicializado correctamente');
});

// ===== FUNCIONES ADICIONALES PARA ANÁLISIS EDUCATIVO =====

// Función para analizar la distribución de tipos de puntos
function analyzePointDistribution() {
    const total = clusterResults.allPoints.length;
    const coreRatio = (clusterResults.corePoints.length / total * 100).toFixed(1);
    const borderRatio = (clusterResults.borderPoints.length / total * 100).toFixed(1);
    const noiseRatio = (clusterResults.noisePoints.length / total * 100).toFixed(1);
    
    console.log(`📊 Distribución de puntos:`, {
        core: `${clusterResults.corePoints.length} (${coreRatio}%)`,
        border: `${clusterResults.borderPoints.length} (${borderRatio}%)`,
        noise: `${clusterResults.noisePoints.length} (${noiseRatio}%)`,
        total: total
    });
    
    return { coreRatio, borderRatio, noiseRatio };
}

// Función para generar recomendaciones sobre parámetros
function generateParameterRecommendations() {
    const distribution = analyzePointDistribution();
    const recommendations = [];
    
    if (parseFloat(distribution.noiseRatio) > 50) {
        recommendations.push("⚠️ Demasiado ruido: Considera reducir MinPts o aumentar ε");
    }
    
    if (parseFloat(distribution.coreRatio) > 80) {
        recommendations.push("⚠️ Demasiados core points: Considera aumentar MinPts");
    }
    
    if (parseFloat(distribution.coreRatio) < 10) {
        recommendations.push("⚠️ Muy pocos core points: Considera reducir MinPts o aumentar ε");
    }
    
    if (clusterResults.clusters.length === 1 && clusterResults.noisePoints.length < 3) {
        recommendations.push("💡 Posible sobre-clustering: Considera reducir ε");
    }
    
    if (recommendations.length === 0) {
        recommendations.push("✅ Parámetros balanceados - Buena distribución de conceptos");
    }
    
    console.log("💡 Recomendaciones:", recommendations);
    return recommendations;
}

// ===== VALIDACIÓN FINAL =====
console.log('📋 DBSCAN Q6 JavaScript cargado - Funciones disponibles:');
console.log('   ✓ analyzeConceptsDBSCAN() - Análisis detallado por conceptos');
console.log('   ✓ createConceptsVisualization() - Visualización educativa');
console.log('   ✓ updateConceptStatistics() - Estadísticas en tiempo real');
console.log('   ✓ analyzePointDistribution() - Análisis de distribución');
console.log('   ✓ generateParameterRecommendations() - Recomendaciones automáticas');
console.log('   ✓ Controles interactivos con checkbox para círculos ε');
console.log('   ✓ Responsive design con escalado automático');
console.log('   ✓ 38 puntos estratégicamente distribuidos para mostrar conceptos');