// JavaScript específico para dbscan_q2.html - Diferencia entre Densidad vs Conectividad

// Función para obtener dimensiones responsive
function getResponsiveDimensions() {
    const container = document.querySelector('.svg-container') || document.querySelector('.demo-section');
    let containerWidth;
    
    if (container) {
        containerWidth = container.clientWidth;
    } else {
        containerWidth = window.innerWidth - 40; // Margen de seguridad
    }
    
    let width, height;
    
    if (window.innerWidth <= 480) {
        // Móviles pequeños
        width = Math.min(containerWidth - 30, 280);
        height = Math.min(width * 0.8, 220);
    } else if (window.innerWidth <= 767) {
        // Móviles grandes
        width = Math.min(containerWidth - 30, 320);
        height = Math.min(width * 0.75, 250);
    } else if (window.innerWidth <= 1023) {
        // Tablets
        width = Math.min(containerWidth - 40, 350);
        height = Math.min(width * 0.7, 280);
    } else {
        // Desktop
        width = Math.min(containerWidth - 40, 350);
        height = Math.min(width * 0.86, 300);
    }
    
    return { width, height };
}

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

// Función para escalar datos según el tamaño del SVG
function scaleDataPoints(points, targetWidth, targetHeight) {
    const originalWidth = 350;
    const originalHeight = 300;
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;
    
    return points.map(point => ({
        ...point,
        x: point.x * scaleX,
        y: point.y * scaleY
    }));
}

// Función para crear visualización de densidad (DBSCAN)
function createDensityVisualization() {
    const svg = d3.select("#density-demo");
    const { width, height } = getResponsiveDimensions();
    
    // Configurar dimensiones del SVG
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();
    
    const eps = Math.max(20, width * 0.07); // Epsilon escalado
    const minPts = 3;
    
    // Escalar puntos de datos
    const scaledPoints = scaleDataPoints(dataPoints, width, height);
    
    // Simular DBSCAN
    const points = scaledPoints.map(p => ({...p}));
    
    // Identificar core points
    points.forEach(point => {
        const neighbors = points.filter(other => 
            other.id !== point.id && 
            Math.sqrt(Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)) <= eps
        );
        point.neighborCount = neighbors.length;
        point.type = neighbors.length >= minPts ? 'core' : 'border';
        
        // Asignar clusters basándose en densidad
        if (point.x < width * 0.35 && point.y < height * 0.45) {
            point.cluster = point.type === 'core' ? 1 : (point.neighborCount > 0 ? 1 : 'noise');
        } else if (point.x > width * 0.65 && point.y > height * 0.55) {
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
            .attr("stroke-width", width <= 320 ? 1 : 1.5)
            .attr("stroke-dasharray", "3,3");
    });
    
    // Dibujar puntos
    const pointRadius = width <= 320 ? 4 : (width <= 450 ? 5 : 6);
    
    svg.selectAll(".density-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "density-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.type === 'core' ? pointRadius + 1 : pointRadius)
        .attr("fill", d => {
            if (d.cluster === 1) return '#e74c3c';
            if (d.cluster === 2) return '#3498db';
            return '#95a5a6';
        })
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", width <= 320 ? 1 : 1.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            if (window.innerWidth > 767) {
                d3.select(this).attr("r", d.type === 'core' ? pointRadius + 3 : pointRadius + 2);
            }
            
            // Tooltip responsive
            showTooltip(svg, d, width <= 320 ? 10 : 11, width, "density");
        })
        .on("mouseout", function(event, d) {
            if (window.innerWidth > 767) {
                d3.select(this).attr("r", d.type === 'core' ? pointRadius + 1 : pointRadius);
            }
            svg.select("#tooltip-density").remove();
        })
        .on("click", function(event, d) {
            // Para móviles, mostrar tooltip en click
            if (window.innerWidth <= 767) {
                svg.select("#tooltip-density").remove();
                showTooltip(svg, d, width <= 320 ? 10 : 11, width, "density");
                
                // Auto-ocultar después de 3 segundos en móvil
                setTimeout(() => {
                    svg.select("#tooltip-density").remove();
                }, 3000);
            }
        });
    
    // Etiqueta responsive
    const fontSize = width <= 320 ? 10 : (width <= 450 ? 11 : 12);
    svg.append("text")
        .attr("x", 10)
        .attr("y", fontSize + 5)
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", "bold")
        .attr("fill", "#e74c3c")
        .text(`ε=${Math.round(eps)}, MinPts=${minPts}`);
}

// Función para crear visualización de conectividad (Hierarchical)
function createConnectivityVisualization() {
    const svg = d3.select("#connectivity-demo");
    const { width, height } = getResponsiveDimensions();
    
    // Configurar dimensiones del SVG
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();
    
    // Escalar puntos de datos
    const scaledPoints = scaleDataPoints(dataPoints, width, height);
    const points = scaledPoints.map(p => ({...p}));
    
    // Simular clustering jerárquico - conectar puntos más cercanos
    const connections = [];
    
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
    const shortConnections = connections.slice(0, Math.min(8, Math.floor(width / 40)));
    
    // Asignar clusters basándose en conectividad
    points.forEach((point, index) => {
        if (point.x < width * 0.35 && point.y < height * 0.45) {
            point.cluster = 1;
        } else if (point.x > width * 0.65 && point.y > height * 0.55) {
            point.cluster = 2;
        } else if (point.x > width * 0.4 && point.x < width * 0.6) {
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
        .attr("stroke-width", width <= 320 ? 1 : 1.5)
        .attr("opacity", 0.6);
    
    // Dibujar puntos
    const pointRadius = width <= 320 ? 4 : (width <= 450 ? 5 : 6);
    
    svg.selectAll(".connectivity-point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "connectivity-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", pointRadius)
        .attr("fill", d => {
            if (d.cluster === 1) return '#e74c3c';
            if (d.cluster === 2) return '#3498db';
            if (d.cluster === 3) return '#f39c12';
            return '#95a5a6';
        })
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", width <= 320 ? 1 : 1.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            if (window.innerWidth > 767) {
                d3.select(this).attr("r", pointRadius + 2);
                
                // Highlight connections
                svg.selectAll(".connection")
                    .attr("opacity", conn => 
                        (conn.from.id === d.id || conn.to.id === d.id) ? 1 : 0.2
                    )
                    .attr("stroke", conn => 
                        (conn.from.id === d.id || conn.to.id === d.id) ? "#3498db" : "#bdc3c7"
                    );
            }
            
            showTooltip(svg, d, width <= 320 ? 10 : 11, width, "connectivity");
        })
        .on("mouseout", function(event, d) {
            if (window.innerWidth > 767) {
                d3.select(this).attr("r", pointRadius);
                svg.selectAll(".connection")
                    .attr("opacity", 0.6)
                    .attr("stroke", "#bdc3c7");
            }
            svg.select("#tooltip-connectivity").remove();
        })
        .on("click", function(event, d) {
            // Para móviles, mostrar tooltip en click
            if (window.innerWidth <= 767) {
                svg.select("#tooltip-connectivity").remove();
                showTooltip(svg, d, width <= 320 ? 10 : 11, width, "connectivity");
                
                // Auto-ocultar después de 3 segundos en móvil
                setTimeout(() => {
                    svg.select("#tooltip-connectivity").remove();
                }, 3000);
            }
        });
    
    // Etiqueta responsive
    const fontSize = width <= 320 ? 10 : (width <= 450 ? 11 : 12);
    svg.append("text")
        .attr("x", 10)
        .attr("y", fontSize + 5)
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", "bold")
        .attr("fill", "#3498db")
        .text("Single Linkage");
}

// Función para mostrar tooltip responsive
function showTooltip(svg, d, fontSize, svgWidth, type) {
    const tooltipId = `#tooltip-${type}`;
    svg.select(tooltipId).remove();
    
    const tooltip = svg.append("g").attr("id", `tooltip-${type}`);
    
    const tooltipWidth = Math.min(90, svgWidth * 0.25);
    const tooltipHeight = 35;
    
    // Calcular posición para evitar que se salga del SVG
    let tooltipX = d.x + 10;
    let tooltipY = d.y - 25;
    
    if (tooltipX + tooltipWidth > svgWidth) {
        tooltipX = d.x - tooltipWidth - 10;
    }
    if (tooltipY < 0) {
        tooltipY = d.y + 10;
    }
    if (tooltipX < 0) {
        tooltipX = 5;
    }
    
    tooltip.append("rect")
        .attr("x", tooltipX)
        .attr("y", tooltipY)
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .attr("fill", "rgba(0,0,0,0.85)")
        .attr("rx", 4);
    
    tooltip.append("text")
        .attr("x", tooltipX + 5)
        .attr("y", tooltipY + fontSize + 3)
        .attr("fill", "white")
        .attr("font-size", `${fontSize}px`)
        .attr("font-weight", "bold")
        .text(type === 'density' ? d.type.toUpperCase() : 'POINT');
    
    tooltip.append("text")
        .attr("x", tooltipX + 5)
        .attr("y", tooltipY + (fontSize * 2) + 5)
        .attr("fill", "white")
        .attr("font-size", `${fontSize - 1}px`)
        .text(d.cluster === 'noise' || d.cluster === 'unassigned' ? 'Noise' : `C${d.cluster}`);
}

// Crear ambas visualizaciones con manejo de errores
function initializeVisualizations() {
    try {
        createDensityVisualization();
        createConnectivityVisualization();
        console.log("Visualizaciones de densidad vs conectividad creadas!");
    } catch (error) {
        console.error("Error creando visualizaciones:", error);
    }
}

// Inicializar visualizaciones
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeVisualizations();
    }, 100);
});

// Redimensionar cuando cambie el tamaño de ventana
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initializeVisualizations();
    }, 200);
});

// Manejar cambios de orientación en móviles
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        initializeVisualizations();
    }, 400);
});
        