// JavaScript específico para dbscan_q5.html - Métrica de Distancia

// Datos de ejemplo mejorados y más sensibles a métricas
const sampleData = [
    // Cluster 1 (izquierda-arriba) - DENSO, 6 puntos
    {x: 150, y: 120, id: 1}, {x: 170, y: 130, id: 2}, {x: 160, y: 110, id: 3},
    {x: 180, y: 125, id: 4}, {x: 145, y: 140, id: 5}, {x: 165, y: 135, id: 6},
    
    // Cluster 2 (derecha-arriba) - MODERADO, 5 puntos
    {x: 420, y: 130, id: 7}, {x: 440, y: 140, id: 8}, {x: 430, y: 120, id: 9},
    {x: 450, y: 135, id: 10}, {x: 415, y: 150, id: 11},
    
    // Cluster 3 (centro-abajo) - DENSO, 6 puntos
    {x: 280, y: 300, id: 12}, {x: 300, y: 310, id: 13}, {x: 290, y: 290, id: 14},
    {x: 310, y: 305, id: 15}, {x: 275, y: 320, id: 16}, {x: 295, y: 285, id: 17},
    
    // Cluster 4 (izquierda-centro) - DISPERSO, 4 puntos
    {x: 120, y: 220, id: 18}, {x: 140, y: 240, id: 19}, {x: 110, y: 250, id: 20},
    {x: 130, y: 260, id: 21},
    
    // Puntos aislados (outliers)
    {x: 220, y: 180, id: 22}, {x: 360, y: 200, id: 23}, {x: 500, y: 280, id: 24},
    {x: 80, y: 350, id: 25}, {x: 520, y: 80, id: 26}
];

// Funciones de distancia
const metrics = {
    euclidean: (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)),
    manhattan: (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y),
    chebyshev: (p1, p2) => Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y))
};

// DBSCAN con métrica personalizable
function dbscanWithMetric(points, eps, minPts, metric) {
    const result = points.map(p => ({...p, cluster: 'noise', neighbors: 0, isCore: false}));
    const distFunc = metrics[metric];
    
    result.forEach(point => {
        const neighbors = result.filter(other => 
            other.id !== point.id && distFunc(point, other) <= eps
        );
        point.neighbors = neighbors.length;
        point.isCore = neighbors.length >= minPts;
    });
    
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
                    other.id !== current.id && distFunc(current, other) <= eps
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

// Crear visualización
function createVisualization(svgId, points, eps, metric, scale = 1) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    
    const colors = {
        cluster1: '#3498db', cluster2: '#e74c3c', cluster3: '#f39c12',
        cluster4: '#9b59b6', noise: '#95a5a6'
    };
    
    console.log(`Creando visualización en ${svgId} con métrica ${metric}, eps=${eps}, ${points.length} puntos`);
    
    // Mostrar forma de vecindad para TODOS los core points (solo en demo principal)
    if (scale === 1) {
        const corePoints = points.filter(p => p.isCore);
        console.log(`🔵 Core points encontrados: ${corePoints.length}`, corePoints.map(p => p.id));
        
        // Mostrar TODOS los core points pero con diferente intensidad
        corePoints.forEach((centerPoint, index) => {
            const opacity = Math.max(0.3, 0.8 - (index * 0.1)); // Degradar opacidad
            
            console.log(`Dibujando forma ${metric} para core point ${centerPoint.id} en (${centerPoint.x}, ${centerPoint.y})`);
            
            if (metric === 'euclidean') {
                svg.append("circle")
                    .attr("cx", centerPoint.x)
                    .attr("cy", centerPoint.y)
                    .attr("r", eps)
                    .attr("fill", "rgba(52,152,219,0.03)")
                    .attr("stroke", "#3498db")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4,4")
                    .attr("opacity", opacity);
            } else if (metric === 'manhattan') {
                const pointsStr = `${centerPoint.x},${centerPoint.y-eps} ${centerPoint.x+eps},${centerPoint.y} ${centerPoint.x},${centerPoint.y+eps} ${centerPoint.x-eps},${centerPoint.y}`;
                svg.append("polygon")
                    .attr("points", pointsStr)
                    .attr("fill", "rgba(231,76,60,0.03)")
                    .attr("stroke", "#e74c3c")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4,4")
                    .attr("opacity", opacity);
            } else if (metric === 'chebyshev') {
                svg.append("rect")
                    .attr("x", centerPoint.x - eps)
                    .attr("y", centerPoint.y - eps)
                    .attr("width", eps * 2)
                    .attr("height", eps * 2)
                    .attr("fill", "rgba(243,156,18,0.03)")
                    .attr("stroke", "#f39c12")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4,4")
                    .attr("opacity", opacity);
            }
        });
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
    
    console.log(`Visualización ${svgId} creada con ${points.length} puntos`);
    return points;
}

// Actualizar demo principal
function updateDemo() {
    const metric = document.getElementById('metric-selector').value;
    const eps = parseInt(document.getElementById('eps-slider').value);
    const minPts = parseInt(document.getElementById('minpts-slider').value);
    
    console.log(`🔄 Actualizando demo: métrica=${metric}, eps=${eps}, minPts=${minPts}`);
    
    document.getElementById('eps-value').textContent = eps;
    document.getElementById('minpts-value').textContent = minPts;
    
    const points = dbscanWithMetric(sampleData, eps, minPts, metric);
    console.log(`📊 DBSCAN completado: ${points.length} puntos procesados`);
    
    createVisualization('metrics-demo', points, eps, metric, 1);
    
    // Actualizar estadísticas
    const clusterCount = new Set(points.filter(p => p.cluster !== 'noise').map(p => p.cluster)).size;
    const noiseCount = points.filter(p => p.cluster === 'noise').length;
    const coreCount = points.filter(p => p.isCore).length;
    
    console.log(`📈 Resultados: ${clusterCount} clusters, ${noiseCount} noise, ${coreCount} core points`);
    
    const metricNames = {
        euclidean: 'Euclidiana',
        manhattan: 'Manhattan', 
        chebyshev: 'Chebyshev'
    };
    
    document.getElementById('current-metric').textContent = metricNames[metric];
    document.getElementById('current-clusters').textContent = clusterCount;
    document.getElementById('current-noise').textContent = noiseCount;
    document.getElementById('epsilon-used').textContent = eps;
    document.getElementById('minpts-used').textContent = minPts;
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Crear comparaciones estáticas
    createVisualization('euclidean-demo', dbscanWithMetric(sampleData, 45, 3, 'euclidean'), 45, 'euclidean', 0.5);
    createVisualization('manhattan-demo', dbscanWithMetric(sampleData, 45, 3, 'manhattan'), 45, 'manhattan', 0.5);
    createVisualization('chebyshev-demo', dbscanWithMetric(sampleData, 45, 3, 'chebyshev'), 45, 'chebyshev', 0.5);
    
    // Event listeners
    document.getElementById('metric-selector').addEventListener('change', updateDemo);
    document.getElementById('eps-slider').addEventListener('input', updateDemo);
    document.getElementById('minpts-slider').addEventListener('input', updateDemo);
    
    // Crear demo inicial
    updateDemo();
    
    console.log("Demo de métricas DBSCAN cargada correctamente!");
});