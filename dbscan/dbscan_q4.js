// DBSCAN Q4: JavaScript para Sensibilidad de Parámetros
// Archivo: dbscan_q4.js

// ===== DATOS EDUCATIVOS DISEÑADOS PARA DEMOSTRAR SENSIBILIDAD =====
const dataPoints = [
    // Cluster 1 (izquierda) - MUY DENSO para mostrar efectos de epsilon pequeño
    {x: 100, y: 150, id: 1}, {x: 110, y: 160, id: 2}, {x: 105, y: 140, id: 3},
    {x: 115, y: 155, id: 4}, {x: 95, y: 165, id: 5}, {x: 120, y: 145, id: 6},
    {x: 108, y: 170, id: 7}, {x: 90, y: 155, id: 8}, {x: 125, y: 160, id: 9},
    
    // Cluster 2 (centro-derecha) - DENSO
    {x: 300, y: 200, id: 10}, {x: 315, y: 210, id: 11}, {x: 295, y: 190, id: 12},
    {x: 310, y: 205, id: 13}, {x: 285, y: 215, id: 14}, {x: 320, y: 195, id: 15},
    {x: 305, y: 225, id: 16}, {x: 290, y: 185, id: 17},
    
    // Cluster 3 (arriba-centro) - MODERADAMENTE DENSO
    {x: 200, y: 80, id: 18}, {x: 220, y: 90, id: 19}, {x: 215, y: 70, id: 20},
    {x: 235, y: 85, id: 21}, {x: 190, y: 95, id: 22}, {x: 225, y: 75, id: 23},
    
    // Cluster 4 (derecha-abajo) - DISPERSO para mostrar efectos de epsilon grande
    {x: 450, y: 280, id: 24}, {x: 470, y: 300, id: 25}, {x: 440, y: 260, id: 26},
    {x: 480, y: 290, id: 27}, {x: 430, y: 310, id: 28},
    
    // Cluster 5 (centro-abajo) - MUY DISPERSO
    {x: 250, y: 300, id: 29}, {x: 280, y: 320, id: 30}, {x: 220, y: 280, id: 31},
    {x: 290, y: 290, id: 32},
    
    // Puntos de transición (entre clusters) - CRÍTICOS PARA DEMOSTRAR SENSIBILIDAD
    {x: 180, y: 180, id: 33}, {x: 200, y: 200, id: 34}, {x: 160, y: 200, id: 35},
    
    // Outliers verdaderos - Para mostrar clasificación de ruido
    {x: 50, y: 50, id: 36}, {x: 500, y: 100, id: 37}, {x: 150, y: 320, id: 38},
    {x: 400, y: 50, id: 39}, {x: 350, y: 320, id: 40},
    
    // Puntos adicionales estratégicamente ubicados
    {x: 130, y: 120, id: 41}, {x: 270, y: 150, id: 42}, {x: 320, y: 250, id: 43},
    {x: 380, y: 180, id: 44}, {x: 420, y: 220, id: 45}
];

// ===== VARIABLES GLOBALES =====
let svg, width, height, currentEpsilon = 35, currentMinPts = 4;
let clusterResults = { clusters: [], noise: [], corePoints: [], borderPoints: [] };

// ===== FUNCIÓN PARA DIMENSIONES RESPONSIVE CON ESCALADO =====
function getResponsiveDimensions() {
    const container = document.querySelector('.demo-section');
    let containerWidth = container ? container.offsetWidth - 40 : 800;
    
    // Limitar ancho máximo y asegurar mínimo
    containerWidth = Math.min(Math.max(containerWidth, 280), 800);
    
    return {
        width: containerWidth,
        height: Math.max(containerWidth * 0.6, 300),
        // Factor de escala para que todo quepa en pantallas pequeñas
        scale: containerWidth < 400 ? containerWidth / 550 : 1
    };
}

// ===== ALGORITMO DBSCAN COMPLETO Y ROBUSTO =====
function runDBSCAN(points, eps, minPts) {
    console.log(`🔍 INICIANDO DBSCAN con eps=${eps}, minPts=${minPts}`);
    
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
    
    // Función para calcular distancia euclidiana
    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    
    // Función para encontrar vecinos dentro del radio eps
    function getNeighbors(point) {
        const neighbors = pointsCopy.filter(p => 
            p.id !== point.id && distance(point, p) <= eps
        );
        console.log(`   📍 Punto ${point.id}: ${neighbors.length} vecinos encontrados`);
        return neighbors;
    }
    
    // Función para expandir cluster (DFS)
    function expandCluster(point, neighbors, clusterId) {
        // Marcar punto inicial como core
        point.cluster = clusterId;
        point.type = 'core';
        console.log(`   🎯 Punto ${point.id} marcado como CORE del cluster ${clusterId}`);
        
        let i = 0;
        while (i < neighbors.length) {
            const neighbor = neighbors[i];
            
            if (!neighbor.visited) {
                neighbor.visited = true;
                const neighborNeighbors = getNeighbors(neighbor);
                
                // Si el vecino también es core point, agregar sus vecinos
                if (neighborNeighbors.length >= minPts) {
                    console.log(`   🎯 Punto ${neighbor.id} también es CORE, expandiendo...`);
                    neighbor.type = 'core';
                    
                    // Agregar nuevos vecinos únicos
                    neighborNeighbors.forEach(nn => {
                        if (!neighbors.some(existing => existing.id === nn.id)) {
                            neighbors.push(nn);
                        }
                    });
                }
            }
            
            // Asignar al cluster si no está asignado
            if (neighbor.cluster === -1) {
                neighbor.cluster = clusterId;
                if (neighbor.type !== 'core') {
                    neighbor.type = 'border';
                    console.log(`   🔵 Punto ${neighbor.id} marcado como BORDER del cluster ${clusterId}`);
                }
            }
            
            i++;
        }
    }
    
    // ===== ALGORITMO PRINCIPAL DBSCAN =====
    console.log("🚀 Ejecutando algoritmo principal...");
    
    for (const point of pointsCopy) {
        if (point.visited) continue;
        
        point.visited = true;
        const neighbors = getNeighbors(point);
        
        if (neighbors.length < minPts) {
            // Punto no es core (podría ser border o noise)
            point.type = 'noise'; // Temporalmente
            console.log(`   ❌ Punto ${point.id}: No es core (${neighbors.length} < ${minPts})`);
        } else {
            // Punto es core, crear nuevo cluster
            console.log(`   ✅ Punto ${point.id}: ES CORE, creando cluster ${currentCluster}`);
            expandCluster(point, neighbors, currentCluster);
            currentCluster++;
        }
    }
    
    // ===== CLASIFICACIÓN FINAL DE PUNTOS =====
    console.log("🏷️ Clasificación final de puntos:");
    
    pointsCopy.forEach(point => {
        if (point.type === 'core') {
            corePoints.push(point);
        } else if (point.cluster !== -1) {
            // Es border point (pertenece a cluster pero no es core)
            point.type = 'border';
            borderPoints.push(point);
        } else {
            // Es noise (no pertenece a ningún cluster)
            point.type = 'noise';
            noisePoints.push(point);
        }
        
        console.log(`   📊 Punto ${point.id}: ${point.type.toUpperCase()} - Cluster: ${point.cluster === -1 ? 'NOISE' : point.cluster}`);
    });
    
    // Crear arrays de clusters
    for (let i = 0; i < currentCluster; i++) {
        const clusterPoints = pointsCopy.filter(p => p.cluster === i);
        clusters.push(clusterPoints);
        console.log(`   🎨 Cluster ${i}: ${clusterPoints.length} puntos`);
    }
    
    const results = {
        clusters,
        noise: noisePoints,
        corePoints,
        borderPoints,
        allPoints: pointsCopy
    };
    
    console.log(`✅ DBSCAN COMPLETADO:`, {
        totalClusters: clusters.length,
        corePoints: corePoints.length,
        borderPoints: borderPoints.length,
        noisePoints: noisePoints.length,
        totalPoints: pointsCopy.length
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
    d3.select("#sensitivity-visualization").selectAll("*").remove();
    
    const dims = getResponsiveDimensions();
    width = dims.width;
    height = dims.height;
    const scale = dims.scale;
    
    // Crear SVG responsive
    svg = d3.select("#sensitivity-visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "2px solid #bdc3c7")
        .style("border-radius", "10px")
        .style("background", "#f8f9fa");
    
    // Crear grupo con transformación de escala para móviles
    const mainGroup = svg.append("g")
        .attr("transform", `scale(${scale}) translate(${scale < 1 ? 20 : 0}, ${scale < 1 ? 10 : 0})`);
    
    // Ejecutar DBSCAN con parámetros actuales
    clusterResults = runDBSCAN(dataPoints, currentEpsilon, currentMinPts);
    
    // ===== DIBUJAR CÍRCULOS DE EPSILON PRIMERO (DEBAJO DE LOS PUNTOS) =====
    console.log(`🎯 Dibujando círculos de epsilon con radio ${currentEpsilon} (escala: ${scale})`);
    console.log(`📊 Core points encontrados: ${clusterResults.corePoints.length}`);
    
    // Grupo para círculos de epsilon
    const epsilonGroup = mainGroup.append("g").attr("class", "epsilon-circles");
    
    if (clusterResults.corePoints && clusterResults.corePoints.length > 0) {
        clusterResults.corePoints.forEach((corePoint, index) => {
            console.log(`   ✓ Dibujando círculo ${index + 1}: Core point ID ${corePoint.id} en (${corePoint.x}, ${corePoint.y})`);
            
            epsilonGroup.append("circle")
                .attr("cx", corePoint.x)
                .attr("cy", corePoint.y)
                .attr("r", currentEpsilon)
                .attr("fill", "rgba(52, 152, 219, 0.1)")
                .attr("stroke", "#3498db")
                .attr("stroke-width", scale < 1 ? 1.5 : 2)
                .attr("stroke-dasharray", scale < 1 ? "6,3" : "8,4")
                .attr("opacity", 0.6)
                .style("pointer-events", "none");
        });
        
        console.log(`✅ ${clusterResults.corePoints.length} círculos de epsilon dibujados correctamente`);
    } else {
        console.warn("⚠️ No se encontraron core points para dibujar círculos");
    }
    
    // ===== DIBUJAR PUNTOS COLOREADOS POR CLUSTER (ENCIMA DE LOS CÍRCULOS) =====
    const pointsGroup = svg.append("g").attr("class", "data-points");
    
    clusterResults.allPoints.forEach(point => {
        let color, size, strokeColor, strokeWidth;
        
        if (point.type === 'noise') {
            color = '#95a5a6';
            size = 6;
            strokeColor = '#7f8c8d';
            strokeWidth = 2;
        } else if (point.type === 'core') {
            color = clusterColors[point.cluster % clusterColors.length];
            size = 10;
            strokeColor = '#2c3e50';
            strokeWidth = 3;
        } else { // border
            color = clusterColors[point.cluster % clusterColors.length];
            size = 8;
            strokeColor = '#34495e';
            strokeWidth = 2;
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
            .text(`ID: ${point.id} | Tipo: ${point.type} | Cluster: ${point.cluster === -1 ? 'Ruido' : point.cluster}`);
    });
    
    // ===== AGREGAR LEYENDA MEJORADA =====
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 140}, 20)`);
    
    // Fondo para la leyenda
    legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 130)
        .attr("height", 120)
        .attr("fill", "white")
        .attr("stroke", "#bdc3c7")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("opacity", 0.9);
    
    // Core points
    legend.append("circle")
        .attr("cx", 10).attr("cy", 10).attr("r", 10)
        .attr("fill", "#e74c3c").attr("stroke", "#2c3e50").attr("stroke-width", 3);
    legend.append("text")
        .attr("x", 25).attr("y", 15)
        .style("font-size", "12px").style("fill", "#2c3e50").style("font-weight", "bold")
        .text("Core point");
    
    // Border points
    legend.append("circle")
        .attr("cx", 10).attr("cy", 30).attr("r", 8)
        .attr("fill", "#3498db").attr("stroke", "#34495e").attr("stroke-width", 2);
    legend.append("text")
        .attr("x", 25).attr("y", 35)
        .style("font-size", "12px").style("fill", "#2c3e50")
        .text("Border point");
    
    // Noise points
    legend.append("circle")
        .attr("cx", 10).attr("cy", 50).attr("r", 6)
        .attr("fill", "#95a5a6").attr("stroke", "#7f8c8d").attr("stroke-width", 2);
    legend.append("text")
        .attr("x", 25).attr("y", 55)
        .style("font-size", "12px").style("fill", "#2c3e50")
        .text("Ruido");
    
    // Epsilon circles
    legend.append("circle")
        .attr("cx", 10).attr("cy", 75).attr("r", 12)
        .attr("fill", "rgba(52, 152, 219, 0.1)")
        .attr("stroke", "#3498db")
        .attr("stroke-dasharray", "4,2")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);
    legend.append("text")
        .attr("x", 25).attr("y", 80)
        .style("font-size", "12px").style("fill", "#2c3e50").style("font-weight", "bold")
        .text(`Radio ε=${currentEpsilon}`);
    
    // Información adicional
    legend.append("text")
        .attr("x", 5).attr("y", 100)
        .style("font-size", "10px").style("fill", "#7f8c8d")
        .text(`${clusterResults.clusters.length} clusters, ${clusterResults.noise.length} ruido`);
    
    // ===== ACTUALIZAR ESTADÍSTICAS =====
    updateStatistics();
    
    console.log("🎨 Visualización completa creada con éxito");
}

// ===== ACTUALIZAR ESTADÍSTICAS EN LA UI =====
function updateStatistics() {
    document.getElementById('clusterCount').textContent = clusterResults.clusters.length;
    document.getElementById('noiseCount').textContent = clusterResults.noise.length;
    document.getElementById('coreCount').textContent = clusterResults.corePoints.length;
    document.getElementById('borderCount').textContent = clusterResults.borderPoints.length;
}

// ===== INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando DBSCAN Q4 - Sensibilidad de Parámetros');
    
    // ===== CONFIGURAR CONTROLES INTERACTIVOS =====
    const epsilonSlider = document.getElementById('epsilonSlider');
    const minPtsSlider = document.getElementById('minPtsSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const minPtsValue = document.getElementById('minPtsValue');
    const resetButton = document.getElementById('resetDemo');
    
    // Event listeners para sliders - CAMBIOS EN TIEMPO REAL
    epsilonSlider.addEventListener('input', function() {
        currentEpsilon = parseInt(this.value);
        epsilonValue.textContent = currentEpsilon;
        console.log(`📏 Epsilon cambiado a: ${currentEpsilon} - Actualizando visualización...`);
        
        // Actualizar automáticamente sin botón
        createVisualization();
    });
    
    minPtsSlider.addEventListener('input', function() {
        currentMinPts = parseInt(this.value);
        minPtsValue.textContent = currentMinPts;
        console.log(`📊 MinPts cambiado a: ${currentMinPts} - Actualizando visualización...`);
        
        // Actualizar automáticamente sin botón
        createVisualization();
    });
    
    // Event listener para botón de reset
    resetButton.addEventListener('click', function() {
        console.log('🔄 Reiniciando a valores óptimos');
        currentEpsilon = 35;
        currentMinPts = 4;
        epsilonSlider.value = 35;
        minPtsSlider.value = 4;
        epsilonValue.textContent = 35;
        minPtsValue.textContent = 4;
        createVisualization();
    });
    
    // ===== CREAR VISUALIZACIÓN INICIAL =====
    createVisualization();
    
    // ===== RESPONSIVE RESIZE =====
    window.addEventListener('resize', function() {
        setTimeout(createVisualization, 200);
    });
    
    console.log('✅ DBSCAN Q4 inicializado correctamente');
});

// ===== VALIDACIÓN FINAL =====
console.log('📋 DBSCAN Q4 JavaScript cargado - Funciones disponibles:');
console.log('   ✓ runDBSCAN() - Algoritmo completo');
console.log('   ✓ createVisualization() - Visualización con círculos ε');
console.log('   ✓ updateStatistics() - Actualización de métricas');
console.log('   ✓ Controles interactivos configurados');
console.log('   ✓ Responsive design habilitado');