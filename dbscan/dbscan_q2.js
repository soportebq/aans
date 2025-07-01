// JavaScript específico para dbscan_q2.html - Diferencia entre Densidad vs Conectividad

// Crear visualizaciones comparativas
const width = 350;
const height = 300;

// Datos de ejemplo - mismo dataset para ambos enfoques
const dataPoints = [
    // Cluster denso 1
    {x: 80, y: 100, id: 1}, {x: 90, y: 110, id: 2}, {x: 85, y: 95, id: 3},
    {x: 95, y: 105, id: 4}, {x: 75, y: 115, id: 5},
    
    // Cluster denso 2  
    {x: 250, y: 180, id: 6}, {x: 260, y: 190, id: 7}, {x: 245, y: 175, id: 8},
    {x: 255, y: 185, id: 9}, {x: 240, y: 195, id: 10},
    
    // Puntos dispersos (outliers)
    {x: 150, y: 50, id: 11}, {x: 200, y: 120, id: 12}, {x: 320, y: 80, id: 13},
    
    // Puntos de conexión (bridge)
    {x: 160, y: 140, id: 14}, {x: 180, y: 150, id: 15}
];

// Función para crear visualización de densidad (DBSCAN)
function createDensityVisualization() {
    const svg = d3.select("#density-demo");
    svg.selectAll("*").remove();
    
    const eps = 25;
    const minPts = 3;
    
    // Simular DBSCAN
    const points = dataPoints.map(p => ({...p}));
    
    // Identificar core points
    points.forEach(point => {
        const neighbors = points.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighborCount = neighbors.length;
        point.type = neighbors.length >= minPts ? 'core' : 'border';
        
        // Asignar clusters basándose en densidad
        if (point.x < 120 && point.y < 130) {
            point.cluster = point.type === 'core' ? 1 : (point.neighborCount > 0 ? 1 : 'noise');
        } else if (point.x > 230 && point.y > 160) {
            point.cluster = point.type === 'core' ? 2 : (point.neighborCount > 0 ? 2 : 'noise');
        } else {
            point.cluster = 'noise';
        }
    });
    
    // Dibujar círculos de epsilon para algunos core points
    points.filter(p => p.type === 'core').slice(0, 2).forEach(point => {
        svg.append("circle")
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", eps)
            .attr("fill", "rgba(231,76,60,0.1)")
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");
    });
    
    // Dibujar puntos
    svg.selectAll(".density-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "density-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.type === 'core' ? 7 : 5)
        .attr("fill", d => {
            if (d.cluster === 1) return '#e74c3c';
            if (d.cluster === 2) return '#3498db';
            return '#95a5a6';
        })
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", d.type === 'core' ? 10 : 8);
            
            // Tooltip
            const tooltip = svg.append("g").attr("id", "tooltip-density");
            tooltip.append("rect")
                .attr("x", d.x + 10)
                .attr("y", d.y - 40)
                .attr("width", 100)
                .attr("height", 60)
                .attr("fill", "rgba(0,0,0,0.8)")
                .attr("rx", 5);
            
            tooltip.append("text")
                .attr("x", d.x + 15)
                .attr("y", d.y - 20)
                .attr("fill", "white")
                .attr("font-size", "11px")
                .text(`${d.type} point`);
            
            tooltip.append("text")
                .attr("x", d.x + 15)
                .attr("y", d.y - 5)
                .attr("fill", "white")
                .attr("font-size", "11px")
                .text(`${d.neighborCount} neighbors`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", d.type === 'core' ? 7 : 5);
            svg.select("#tooltip-density").remove();
        });
    
    // Etiqueta
    svg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "#e74c3c")
        .text(`ε=${eps}, MinPts=${minPts}`);
}

// Función para crear visualización de conectividad (Hierarchical)
function createConnectivityVisualization() {
    const svg = d3.select("#connectivity-demo");
    svg.selectAll("*").remove();
    
    const points = dataPoints.map(p => ({...p}));
    
    // Simular clustering jerárquico - conectar puntos más cercanos
    const connections = [];
    const clusters = {};
    
    // Calcular distancias y crear conexiones
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const dist = Math.sqrt(
                Math.pow(points[i].x - points[j].x, 2) + 
                Math.pow(points[i].y - points[j].y, 2)
            );
            connections.push({
                from: points[i],
                to: points[j],
                distance: dist
            });
        }
    }
    
    // Ordenar por distancia y tomar las conexiones más cortas
    connections.sort((a, b) => a.distance - b.distance);
    const shortConnections = connections.slice(0, 8);
    
    // Asignar clusters basándose en conectividad
    points.forEach((point, index) => {
        if (point.x < 120 && point.y < 130) {
            point.cluster = 1;
        } else if (point.x > 230 && point.y > 160) {
            point.cluster = 2;
        } else if (point.x > 150 && point.x < 200) {
            point.cluster = 3;
        } else {
            point.cluster = 'unassigned';
        }
    });
    
    // Dibujar conexiones
    svg.selectAll(".connection")
        .data(shortConnections)
        .enter()
        .append("line")
        .attr("class", "connection")
        .attr("x1", d => d.from.x)
        .attr("y1", d => d.from.y)
        .attr("x2", d => d.to.x)
        .attr("y2", d => d.to.y)
        .attr("stroke", "#bdc3c7")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
    
    // Dibujar puntos
    svg.selectAll(".connectivity-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "connectivity-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 6)
        .attr("fill", d => {
            if (d.cluster === 1) return '#e74c3c';
            if (d.cluster === 2) return '#3498db';
            if (d.cluster === 3) return '#f39c12';
            return '#95a5a6';
        })
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 9);
            
            // Highlight connections
            svg.selectAll(".connection")
                .attr("opacity", conn => 
                    (conn.from.id === d.id || conn.to.id === d.id) ? 1 : 0.2
                )
                .attr("stroke", conn => 
                    (conn.from.id === d.id || conn.to.id === d.id) ? "#3498db" : "#bdc3c7"
                );
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", 6);
            svg.selectAll(".connection")
                .attr("opacity", 0.6)
                .attr("stroke", "#bdc3c7");
        });
    
    // Etiqueta
    svg.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "#3498db")
        .text("Single Linkage");
}

// Crear ambas visualizaciones
createDensityVisualization();
createConnectivityVisualization();

console.log("Visualizaciones de densidad vs conectividad creadas!");