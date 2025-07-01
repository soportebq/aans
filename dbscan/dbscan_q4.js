// JavaScript específico para dbscan_q4.html - Sensibilidad a Parámetros

// Datos de ejemplo más ricos y variados para demostrar sensibilidad
const dataPoints = [
    // Cluster 1 (izquierda) - MUY DENSO
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
    
    // Cluster 4 (derecha-abajo) - DISPERSO
    {x: 450, y: 280, id: 24}, {x: 470, y: 300, id: 25}, {x: 440, y: 260, id: 26},
    {x: 480, y: 290, id: 27}, {x: 430, y: 310, id: 28},
    
    // Cluster 5 (centro-abajo) - MUY DISPERSO
    {x: 250, y: 300, id: 29}, {x: 280, y: 320, id: 30}, {x: 220, y: 280, id: 31},
    {x: 290, y: 290, id: 32},
    
    // Puntos de transición (entre clusters) - SENSIBLES AL EPSILON
    {x: 180, y: 180, id: 33}, {x: 200, y: 200, id: 34}, {x: 160, y: 200, id: 35},
    
    // Outliers verdaderos
    {x: 50, y: 50, id: 36}, {x: 500, y: 100, id: 37}, {x: 150, y: 320, id: 38},
    {x: 400, y: 50, id: 39}, {x: 350, y: 320, id: 40},
    
    // Puntos adicionales para demostrar sensibilidad
    {x: 130, y: 120, id: 41}, {x: 270, y: 150, id: 42}, {x: 320, y: 250, id: 43},
    {x: 380, y: 180, id: 44}, {x: 420, y: 220, id: 45}
];

// Función DBSCAN simplificada
function runDBSCAN(points, eps, minPts) {
    const result = points.map(p => ({...p, cluster: 'noise', neighbors: 0, isCore: false}));
    
    // Calcular vecinos
    result.forEach(point => {
        const neighbors = result.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighbors = neighbors.length;
        point.isCore = neighbors.length >= minPts;
    });
    
    // Formar clusters
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

// Función para crear visualización
function createVisualization(svgId, eps, minPts, scale = 1) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    
    const points = runDBSCAN(dataPoints, eps, minPts);
    const colors = {
        cluster1: '#3498db', cluster2: '#e74c3c', cluster3: '#f39c12',
        cluster4: '#9b59b6', noise: '#95a5a6'
    };
    
    // Dibujar círculos de epsilon para core points (solo en el gráfico principal)
    if (scale === 1) {
        const corePoints = points.filter(p => p.isCore);
        // Mostrar máximo 6 círculos para no sobrecargar
        const samplesToShow = Math.min(6, corePoints.length);
        const step = Math.max(1, Math.floor(corePoints.length / samplesToShow));
        
        for (let i = 0; i < corePoints.length; i += step) {
            const point = corePoints[i];
            svg.append("circle")
                .attr("cx", point.x * scale)
                .attr("cy", point.y * scale)
                .attr("r", eps * scale)
                .attr("fill", "rgba(52,152,219,0.03)")
                .attr("stroke", "#3498db")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4,4")
                .attr("opacity", 0.7);
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
        .attr("r", d => (d.isCore ? 8 : 6) * scale)
        .attr("fill", d => colors[d.cluster] || colors.noise)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5 * scale)
        .style("cursor", scale === 1 ? "pointer" : "default");
    
    // Agregar tooltips solo al gráfico principal
    if (scale === 1) {
        svg.selectAll(".point")
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
                    .text(`${d.isCore ? 'Core' : 'Border/Noise'}`);
                
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
    }
    
    return points;
}

// Función para actualizar la demo principal
function updateMainDemo() {
    const eps = parseInt(document.getElementById('eps-slider').value);
    const minPts = parseInt(document.getElementById('minpts-slider').value);
    
    console.log(`🔄 Actualizando demo: eps=${eps}, minPts=${minPts}`); // Debug
    
    // Sincronizar controles
    document.getElementById('eps-input').value = eps;
    document.getElementById('minpts-input').value = minPts;
    
    const points = createVisualization('main-demo', eps, minPts, 1);
    
    // Actualizar estadísticas
    const clusterCount = new Set(points.filter(p => p.cluster !== 'noise').map(p => p.cluster)).size;
    const noiseCount = points.filter(p => p.cluster === 'noise').length;
    const coreCount = points.filter(p => p.isCore).length;
    
    console.log(`📊 Resultados: ${clusterCount} clusters, ${noiseCount} noise, ${coreCount} core points`); // Debug
    
    document.getElementById('current-eps').textContent = eps;
    document.getElementById('current-minpts').textContent = minPts;
    document.getElementById('current-clusters').textContent = clusterCount;
    document.getElementById('current-noise').textContent = noiseCount;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Crear visualizaciones de comparación
    createVisualization('base-config', 35, 3, 0.5);
    createVisualization('small-change', 39, 3, 0.5);
    createVisualization('minpts-change', 35, 4, 0.5);
    
    // Configurar controles
    const epsSlider = document.getElementById('eps-slider');
    const epsInput = document.getElementById('eps-input');
    const minptsSlider = document.getElementById('minpts-slider');
    const minptsInput = document.getElementById('minpts-input');
    
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
        if (this.value >= 20 && this.value <= 80) {
            epsSlider.value = this.value;
            updateMainDemo();
        }
    });
    
    epsInput.addEventListener('change', function() {
        if (this.value >= 20 && this.value <= 80) {
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
    
    // Crear demo inicial
    updateMainDemo();
    
    console.log("Demo de sensibilidad DBSCAN cargada correctamente!");
});