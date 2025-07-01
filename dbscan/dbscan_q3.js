// JavaScript específico para dbscan_q3.html - Efectos del parámetro Epsilon

// Datos de ejemplo para las demostraciones
const sampleData = [
    // Cluster 1 (izquierda)
    {x: 120, y: 150, id: 1}, {x: 130, y: 160, id: 2}, {x: 125, y: 140, id: 3},
    {x: 135, y: 155, id: 4}, {x: 115, y: 165, id: 5}, {x: 140, y: 145, id: 6},
    
    // Cluster 2 (derecha)
    {x: 380, y: 180, id: 7}, {x: 390, y: 190, id: 8}, {x: 375, y: 170, id: 9},
    {x: 385, y: 185, id: 10}, {x: 395, y: 175, id: 11}, {x: 370, y: 195, id: 12},
    
    // Cluster 3 (centro superior)
    {x: 250, y: 100, id: 13}, {x: 260, y: 110, id: 14}, {x: 245, y: 95, id: 15},
    {x: 255, y: 105, id: 16},
    
    // Puntos dispersos (potencial ruido)
    {x: 200, y: 250, id: 17}, {x: 450, y: 120, id: 18}, {x: 80, y: 80, id: 19}
];

// Función para simular DBSCAN
function simulateDBSCAN(points, eps, minPts) {
    const result = points.map(p => ({...p, cluster: 'noise', neighbors: 0, isCore: false}));
    
    // Calcular vecinos y determinar core points
    result.forEach(point => {
        const neighbors = result.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighbors = neighbors.length;
        point.isCore = neighbors.length >= minPts;
    });
    
    // Asignar clusters usando algoritmo simplificado
    let clusterIndex = 1;
    const visited = new Set();
    
    result.forEach(point => {
        if (point.isCore && !visited.has(point.id)) {
            // Expandir cluster desde este core point
            const queue = [point];
            point.cluster = `cluster${clusterIndex}`;
            visited.add(point.id);
            
            while (queue.length > 0) {
                const current = queue.shift();
                const neighbors = result.filter(other => 
                    other.id !== current.id && 
                    Math.sqrt(Math.pow(current.x - other.x, 2) + Math.pow(current.y - other.y, 2)) <= eps
                );
                
                neighbors.forEach(neighbor => {
                    if (!visited.has(neighbor.id)) {
                        visited.add(neighbor.id);
                        neighbor.cluster = `cluster${clusterIndex}`;
                        if (neighbor.isCore) {
                            queue.push(neighbor);
                        }
                    }
                });
            }
            clusterIndex++;
        }
    });
    
    return result;
}

// Función para crear visualización estática
function createStaticVisualization(svgId, eps) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    
    const points = simulateDBSCAN(sampleData, eps, 3);
    const colors = {
        cluster1: '#3498db',
        cluster2: '#e74c3c', 
        cluster3: '#f39c12',
        cluster4: '#9b59b6',
        noise: '#95a5a6'
    };
    
    // Escala para ajustar al SVG
    const scale = 0.6;
    
    // Dibujar círculos de epsilon para algunos core points
    const corePoints = points.filter(p => p.isCore).slice(0, 2);
    corePoints.forEach(point => {
        svg.append("circle")
            .attr("cx", point.x * scale)
            .attr("cy", point.y * 0.7)
            .attr("r", eps * scale)
            .attr("fill", "rgba(52,152,219,0.1)")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2")
            .attr("opacity", 0.7);
    });
    
    // Dibujar puntos
    svg.selectAll(".static-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "static-point")
        .attr("cx", d => d.x * scale)
        .attr("cy", d => d.y * 0.7)
        .attr("r", d => d.isCore ? 6 : 4)
        .attr("fill", d => colors[d.cluster] || colors.noise)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5);
    
    // Mostrar estadísticas
    const clusterCount = new Set(points.filter(p => p.cluster !== 'noise').map(p => p.cluster)).size;
    const noiseCount = points.filter(p => p.cluster === 'noise').length;
    
    svg.append("text")
        .attr("x", 10)
        .attr("y", 180)
        .attr("font-size", "11px")
        .attr("fill", "#2c3e50")
        .attr("font-weight", "bold")
        .text(`Clusters: ${clusterCount}, Noise: ${noiseCount}`);
}

// Función para actualizar la demostración interactiva
function updateClustering() {
    const eps = parseInt(document.getElementById('epsilon-slider').value);
    const minPts = parseInt(document.getElementById('minpts-input').value);
    
    const svg = d3.select("#interactive-demo");
    svg.selectAll("*").remove();
    
    const points = simulateDBSCAN(sampleData, eps, minPts);
    const colors = {
        cluster1: '#3498db',
        cluster2: '#e74c3c', 
        cluster3: '#f39c12',
        cluster4: '#9b59b6',
        cluster5: '#1abc9c',
        noise: '#95a5a6'
    };
    
    // Dibujar círculos de epsilon para core points
    const corePoints = points.filter(p => p.isCore);
    corePoints.forEach(point => {
        svg.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", eps)
            .attr("fill", "rgba(52,152,219,0.05)")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.6);
    });
    
    // Dibujar puntos
    svg.selectAll(".interactive-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "interactive-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.isCore ? 8 : 6)
        .attr("fill", d => colors[d.cluster] || colors.noise)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", d.isCore ? 12 : 9);
            
            const tooltip = svg.append("g").attr("id", "tooltip");
            tooltip.append("rect")
                .attr("x", d.x + 15)
                .attr("y", d.y - 50)
                .attr("width", 140)
                .attr("height", 70)
                .attr("fill", "rgba(0,0,0,0.9)")
                .attr("rx", 8);
            
            tooltip.append("text")
                .attr("x", d.x + 25)
                .attr("y", d.y - 30)
                .attr("fill", "white")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .text(`${d.isCore ? 'Core' : 'Border/Noise'} Point`);
            
            tooltip.append("text")
                .attr("x", d.x + 25)
                .attr("y", d.y - 15)
                .attr("fill", "white")
                .attr("font-size", "11px")
                .text(`Neighbors: ${d.neighbors}`);
            
            tooltip.append("text")
                .attr("x", d.x + 25)
                .attr("y", d.y)
                .attr("fill", "white")
                .attr("font-size", "11px")
                .text(`Cluster: ${d.cluster}`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", d.isCore ? 8 : 6);
            svg.select("#tooltip").remove();
        });
    
    // Actualizar estadísticas
    const clusterCount = new Set(points.filter(p => p.cluster !== 'noise').map(p => p.cluster)).size;
    const noiseCount = points.filter(p => p.cluster === 'noise').length;
    
    document.getElementById('stats-text').textContent = 
        `Epsilon: ${eps}, MinPts: ${minPts}, Clusters: ${clusterCount}, Noise: ${noiseCount}`;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Crear visualizaciones estáticas
    createStaticVisualization('small-epsilon', 15);
    createStaticVisualization('optimal-epsilon', 35);
    createStaticVisualization('large-epsilon', 80);
    
    // Configurar controles interactivos
    const epsilonSlider = document.getElementById('epsilon-slider');
    const epsilonInput = document.getElementById('epsilon-input');
    const minptsInput = document.getElementById('minpts-input');
    
    // Sincronizar slider e input
    epsilonSlider.addEventListener('input', function() {
        epsilonInput.value = this.value;
        updateClustering();
    });
    
    epsilonInput.addEventListener('input', function() {
        if (this.value >= 10 && this.value <= 100) {
            epsilonSlider.value = this.value;
            updateClustering();
        }
    });
    
    minptsInput.addEventListener('input', function() {
        updateClustering();
    });
    
    // Crear demo interactiva inicial
    updateClustering();
    
    console.log("DBSCAN Epsilon Demo cargada correctamente!");
});