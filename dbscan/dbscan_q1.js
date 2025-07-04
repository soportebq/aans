// JavaScript específico para dbscan_q1.html - Versión Simplificada y Funcional

// Datos base - Diseñados para mostrar el efecto del epsilon
const baseData = [
    // Cluster 1 - MUY DENSO (izquierda)
    {x: 120, y: 150, id: 1}, {x: 130, y: 160, id: 2}, {x: 125, y: 140, id: 3},
    {x: 135, y: 155, id: 4}, {x: 115, y: 165, id: 5}, {x: 140, y: 145, id: 6},
    
    // Cluster 2 - DENSO (derecha)
    {x: 380, y: 180, id: 7}, {x: 390, y: 190, id: 8}, {x: 385, y: 170, id: 9},
    {x: 395, y: 185, id: 10}, {x: 375, y: 195, id: 11}, {x: 400, y: 175, id: 12},
    
    // Cluster 3 - MODERADO (centro arriba)
    {x: 280, y: 100, id: 13}, {x: 300, y: 110, id: 14}, {x: 290, y: 90, id: 15},
    {x: 310, y: 105, id: 16}, {x: 270, y: 115, id: 17},
    
    // Cluster 4 - DISPERSO (abajo)
    {x: 200, y: 300, id: 18}, {x: 240, y: 320, id: 19}, {x: 220, y: 280, id: 20},
    {x: 260, y: 310, id: 21}, {x: 180, y: 330, id: 22},
    
    // Puntos aislados (noise)
    {x: 50, y: 50, id: 23}, {x: 450, y: 80, id: 24}, {x: 100, y: 350, id: 25},
    {x: 500, y: 300, id: 26}, {x: 350, y: 50, id: 27}
];

// Función para obtener dimensiones
function getResponsiveDimensions() {
    const container = document.querySelector('.visual-section') || document.body;
    const containerWidth = container.clientWidth || 600;
    
    let width = Math.min(containerWidth - 40, 600);
    let height = Math.min(width * 0.67, 400);
    
    // Mínimos para móviles
    if (window.innerWidth <= 480) {
        width = Math.max(width, 280);
        height = Math.max(height, 200);
    }
    
    return { width, height };
}

// Función para escalar puntos
function scalePoints(points, width, height) {
    const scaleX = width / 600;
    const scaleY = height / 400;
    
    return points.map(p => ({
        ...p,
        x: p.x * scaleX,
        y: p.y * scaleY
    }));
}

// Algoritmo DBSCAN mejorado
function runDBSCAN(points, eps, minPts) {
    const result = points.map(p => ({
        ...p,
        neighbors: [],
        type: 'noise',
        cluster: 'noise',
        visited: false
    }));
    
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
    
    // Determinar core points primero
    result.forEach(point => {
        if (point.neighbors.length >= minPts) {
            point.type = 'core';
        }
    });
    
    console.log(`🔍 Identificados ${result.filter(p => p.type === 'core').length} core points con ε=${eps}, MinPts=${minPts}`);
    
    // Formar clusters usando BFS
    let clusterId = 1;
    result.forEach(point => {
        if (point.type === 'core' && point.cluster === 'noise') {
            // Nuevo cluster
            point.cluster = clusterId;
            point.visited = true;
            
            // Expandir cluster usando cola (BFS)
            const queue = [...point.neighbors];
            
            while (queue.length > 0) {
                const neighbor = queue.shift();
                
                if (neighbor.cluster === 'noise') {
                    neighbor.cluster = clusterId;
                    neighbor.type = neighbor.type === 'core' ? 'core' : 'border';
                    
                    // Si es core point, agregar sus vecinos a la cola
                    if (neighbor.type === 'core' && !neighbor.visited) {
                        neighbor.visited = true;
                        queue.push(...neighbor.neighbors);
                    }
                }
            }
            
            console.log(`📊 Cluster ${clusterId} formado con ${result.filter(p => p.cluster === clusterId).length} puntos`);
            clusterId++;
        }
    });
    
    return result;
}

// Función para obtener colores
function getPointColor(point) {
    if (point.cluster === 'noise') return '#e74c3c';
    const colors = ['#3498db', '#27ae60', '#f39c12', '#9b59b6', '#e67e22'];
    return colors[(point.cluster - 1) % colors.length];
}

// Función principal de visualización
function createDBSCANVisualization() {
    console.log("🎨 Creando visualización DBSCAN...");
    
    const svg = d3.select("#dbscan-visualization");
    if (svg.empty()) {
        console.error("❌ No se encontró el SVG");
        return;
    }
    
    const { width, height } = getResponsiveDimensions();
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();
    
    // Obtener parámetros
    const epsilon = parseInt(document.getElementById('epsilon')?.value || 40);
    const minPts = parseInt(document.getElementById('minpts')?.value || 3);
    
    // Procesar datos
    const scaledPoints = scalePoints(baseData, width, height);
    const processedPoints = runDBSCAN(scaledPoints, epsilon, minPts);
    
    console.log(`⚙️ Parámetros: ε=${epsilon}, MinPts=${minPts}`);
    console.log(`📊 Procesados: ${processedPoints.length} puntos`);
    
    // Dibujar círculos de epsilon para core points
    const corePoints = processedPoints.filter(p => p.type === 'core');
    console.log(`🔵 Core points encontrados: ${corePoints.length}`);
    
    // Mostrar círculos de epsilon para todos los core points
    corePoints.forEach((point, index) => {
        console.log(`📍 Dibujando círculo ${index + 1} en (${Math.round(point.x)}, ${Math.round(point.y)})`);
        
        svg.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", epsilon)
            .attr("fill", "rgba(52,152,219,0.08)")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.7)
            .attr("class", "epsilon-circle");
    });
    
    // Dibujar puntos
    svg.selectAll(".point")
        .data(processedPoints)
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
        .attr("fill", d => getPointColor(d))
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
    
    // Estadísticas
    const stats = calculateStats(processedPoints);
    console.log(`✅ Resultado: ${stats.clusters} clusters, ${stats.core} core, ${stats.border} border, ${stats.noise} noise`);
    
    // Actualizar controles
    updateControls(epsilon, minPts);
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

// Función para calcular estadísticas
function calculateStats(points) {
    const clusters = new Set();
    let core = 0, border = 0, noise = 0;
    
    points.forEach(p => {
        if (p.type === 'core') core++;
        else if (p.type === 'border') border++;
        else noise++;
        
        if (p.cluster !== 'noise') {
            clusters.add(p.cluster);
        }
    });
    
    return { clusters: clusters.size, core, border, noise };
}

// Función para actualizar controles
function updateControls(epsilon, minPts) {
    const epsilonValue = document.getElementById('epsilon-value');
    const minptsValue = document.getElementById('minpts-value');
    
    if (epsilonValue) epsilonValue.value = epsilon;
    if (minptsValue) minptsValue.value = minPts;
}

// Función alias para compatibilidad
function updateVisualization() {
    createDBSCANVisualization();
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando DBSCAN Q1...");
    
    // Verificar elementos
    const svgElement = document.getElementById('dbscan-visualization');
    if (!svgElement) {
        console.error("❌ SVG no encontrado");
        return;
    }
    
    // Configurar event listeners
    const epsilonSlider = document.getElementById('epsilon');
    const minptsSlider = document.getElementById('minpts');
    
    if (epsilonSlider) {
        epsilonSlider.addEventListener('input', createDBSCANVisualization);
    }
    
    if (minptsSlider) {
        minptsSlider.addEventListener('input', createDBSCANVisualization);
    }
    
    // Crear visualización inicial
    setTimeout(createDBSCANVisualization, 100);
});

// Redimensionar
window.addEventListener('resize', function() {
    setTimeout(createDBSCANVisualization, 200);
});

console.log("✅ DBSCAN Q1 JavaScript cargado!");