// JavaScript específico para dbscan_q6.html - Conceptos Fundamentales

// Datos simples pero efectivos (25 puntos)
const data = [
    // Cluster denso 1 - izquierda
    {x: 150, y: 150, id: 1}, {x: 170, y: 160, id: 2}, {x: 160, y: 140, id: 3},
    {x: 180, y: 155, id: 4}, {x: 145, y: 170, id: 5}, {x: 175, y: 145, id: 6},
    {x: 155, y: 165, id: 7}, {x: 185, y: 150, id: 8},
    
    // Cluster denso 2 - derecha
    {x: 450, y: 180, id: 9}, {x: 470, y: 190, id: 10}, {x: 460, y: 170, id: 11},
    {x: 480, y: 185, id: 12}, {x: 445, y: 200, id: 13}, {x: 475, y: 175, id: 14},
    {x: 465, y: 195, id: 15},
    
    // Cluster disperso 3 - centro
    {x: 300, y: 100, id: 16}, {x: 320, y: 110, id: 17}, {x: 310, y: 90, id: 18},
    {x: 330, y: 105, id: 19}, {x: 295, y: 120, id: 20},
    
    // Puntos aislados (noise)
    {x: 100, y: 300, id: 21}, {x: 500, y: 100, id: 22}, {x: 250, y: 250, id: 23},
    {x: 550, y: 300, id: 24}, {x: 80, y: 80, id: 25}
];

// Función DBSCAN simplificada
function runDBSCAN(points, eps, minPts) {
    const result = points.map(p => ({...p, neighbors: 0, type: 'noise'}));
    
    // Contar vecinos
    result.forEach(point => {
        const neighbors = result.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighbors = neighbors.length;
    });
    
    // Clasificar
    result.forEach(point => {
        if (point.neighbors >= minPts) {
            point.type = 'core';
        } else {
            // Verificar si está cerca de un core point
            const nearCore = result.some(other => 
                other.neighbors >= minPts &&
                Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
            );
            point.type = nearCore ? 'border' : 'noise';
        }
    });
    
    return result;
}

// Función de visualización
function updateVisualization() {
    const eps = parseInt(document.getElementById('eps-slider').value);
    const minPts = parseInt(document.getElementById('minpts-slider').value);
    
    document.getElementById('eps-value').textContent = eps;
    document.getElementById('minpts-value').textContent = minPts;
    
    const processedData = runDBSCAN(data, eps, minPts);
    
    const svg = d3.select("#concepts-demo");
    svg.selectAll("*").remove();
    
    // Dibujar círculos de epsilon para core points
    const corePoints = processedData.filter(p => p.type === 'core');
    corePoints.forEach(point => {
        svg.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", eps)
            .attr("fill", "rgba(52,152,219,0.1)")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.6);
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
            if (d.type === 'core') return 10;
            if (d.type === 'border') return 7;
            return 5;
        })
        .attr("fill", d => {
            if (d.type === 'core') return '#3498db';
            if (d.type === 'border') return '#f39c12';
            return '#e74c3c';
        })
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", d.type === 'core' ? 14 : d.type === 'border' ? 10 : 8);
            
            const tooltip = svg.append("g").attr("id", "tooltip");
            tooltip.append("rect")
                .attr("x", d.x + 15)
                .attr("y", d.y - 60)
                .attr("width", 140)
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
                .text(`Tipo: ${d.type.toUpperCase()}`);
            
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
                .text(`Pos: (${d.x}, ${d.y})`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", d.type === 'core' ? 10 : d.type === 'border' ? 7 : 5);
            svg.select("#tooltip").remove();
        });
    
    // Actualizar estadísticas
    const coreCount = processedData.filter(p => p.type === 'core').length;
    const borderCount = processedData.filter(p => p.type === 'border').length;
    const noiseCount = processedData.filter(p => p.type === 'noise').length;
    
    document.getElementById('current-eps').textContent = eps;
    document.getElementById('current-minpts').textContent = minPts;
    document.getElementById('core-count').textContent = coreCount;
    document.getElementById('border-count').textContent = borderCount;
    document.getElementById('noise-count').textContent = noiseCount;
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('eps-slider').addEventListener('input', updateVisualization);
    document.getElementById('minpts-slider').addEventListener('input', updateVisualization);
    
    // Crear visualización inicial
    updateVisualization();
    
    console.log("Demo de conceptos DBSCAN cargada correctamente!");
});