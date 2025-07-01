// JavaScript específico para dbscan_q1.html - Fundamentos y Clasificación del Algoritmo

// Crear visualización interactiva de DBSCAN
const svg = d3.select("#dbscan-demo");
const width = 600;
const height = 400;

// Limpiar SVG
svg.selectAll("*").remove();

// Datos de ejemplo para demostrar DBSCAN
const points = [
    // Cluster 1
    {x: 150, y: 150, type: 'core', cluster: 1},
    {x: 160, y: 160, type: 'core', cluster: 1},
    {x: 140, y: 170, type: 'core', cluster: 1},
    {x: 170, y: 140, type: 'border', cluster: 1},
    {x: 130, y: 160, type: 'border', cluster: 1},
    
    // Cluster 2
    {x: 400, y: 200, type: 'core', cluster: 2},
    {x: 420, y: 210, type: 'core', cluster: 2},
    {x: 410, y: 190, type: 'core', cluster: 2},
    {x: 390, y: 220, type: 'border', cluster: 2},
    {x: 430, y: 180, type: 'border', cluster: 2},
    
    // Noise points
    {x: 300, y: 100, type: 'noise', cluster: 0},
    {x: 100, y: 300, type: 'noise', cluster: 0},
    {x: 500, y: 350, type: 'noise', cluster: 0}
];

const eps = 40; // Radio epsilon

// Dibujar círculos de epsilon para core points
points.filter(p => p.type === 'core').forEach(point => {
    svg.append("circle")
        .attr("cx", point.x)
        .attr("cy", point.y)
        .attr("r", eps)
        .attr("fill", "rgba(52,152,219,0.1)")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.7);
});

// Dibujar puntos
svg.selectAll(".point")
    .data(points)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.type === 'core' ? 8 : 6)
    .attr("fill", d => {
        if (d.type === 'core') return '#3498db';
        if (d.type === 'border') return '#f39c12';
        return '#e74c3c';
    })
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
        // Destacar punto al pasar el mouse
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d.type === 'core' ? 12 : 10);
        
        // Mostrar información
        const tooltip = svg.append("g")
            .attr("id", "tooltip");
        
        tooltip.append("rect")
            .attr("x", d.x + 15)
            .attr("y", d.y - 30)
            .attr("width", 120)
            .attr("height", 50)
            .attr("fill", "rgba(0,0,0,0.8)")
            .attr("rx", 5);
        
        tooltip.append("text")
            .attr("x", d.x + 25)
            .attr("y", d.y - 10)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .text(`Tipo: ${d.type.toUpperCase()}`);
        
        tooltip.append("text")
            .attr("x", d.x + 25)
            .attr("y", d.y + 5)
            .attr("fill", "white")
            .attr("font-size", "12px")
            .text(`Cluster: ${d.cluster === 0 ? 'Noise' : d.cluster}`);
    })
    .on("mouseout", function(event, d) {
        // Restaurar tamaño original
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", d.type === 'core' ? 8 : 6);
        
        // Remover tooltip
        svg.select("#tooltip").remove();
    });

// Añadir etiquetas de parámetros
svg.append("text")
    .attr("x", 20)
    .attr("y", 30)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#2c3e50")
    .text("Parámetros DBSCAN:");

svg.append("text")
    .attr("x", 20)
    .attr("y", 50)
    .attr("font-size", "14px")
    .attr("fill", "#2c3e50")
    .text(`ε (epsilon) = ${eps} px`);

svg.append("text")
    .attr("x", 20)
    .attr("y", 70)
    .attr("font-size", "14px")
    .attr("fill", "#2c3e50")
    .text("MinPts = 3");

console.log("Visualización DBSCAN creada con éxito!");