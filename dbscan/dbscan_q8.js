// JavaScript específico para dbscan_q8.html - Complejidad Temporal

// Funciones de complejidad
const complexityFunctions = {
    indexed: (n) => n * Math.log2(n),           // O(N log N)
    naive: (n) => n * n,                        // O(N²)
    optimized: (n) => n * Math.log2(n) * 1.2   // O(N log N) con overhead
};

// Configuración de implementaciones
const implementations = {
    indexed: {
        name: 'Con Índice Espacial',
        complexity: 'O(N log N)',
        color: '#27ae60',
        timeMultiplier: 0.1,
        memoryMultiplier: 1.5
    },
    naive: {
        name: 'Sin Índice (Naive)',
        complexity: 'O(N²)',
        color: '#e74c3c',
        timeMultiplier: 2.0,
        memoryMultiplier: 1.0
    },
    optimized: {
        name: 'Optimizada (Scikit-learn)',
        complexity: 'O(N log N)',
        color: '#3498db',
        timeMultiplier: 0.15,
        memoryMultiplier: 1.3
    }
};

// Función para generar datos aleatorios simulados
function generateSimulatedData(size, eps) {
    const points = [];
    const numClusters = Math.floor(size / 100) + 2;
    
    for (let i = 0; i < size; i++) {
        // Distribución mixta: algunos clusters densos + ruido
        if (Math.random() < 0.8) {
            // Puntos en clusters
            const clusterCenter = {
                x: Math.random() * 500 + 50,
                y: Math.random() * 300 + 50
            };
            points.push({
                x: clusterCenter.x + (Math.random() - 0.5) * eps * 2,
                y: clusterCenter.y + (Math.random() - 0.5) * eps * 2,
                id: i
            });
        } else {
            // Ruido aleatorio
            points.push({
                x: Math.random() * 600,
                y: Math.random() * 400,
                id: i
            });
        }
    }
    
    return points;
}

// Función para calcular métricas de rendimiento
function calculatePerformanceMetrics(size, implementationType, eps) {
    const impl = implementations[implementationType];
    const operations = complexityFunctions[implementationType](size);
    
    // Estimaciones basadas en benchmarks reales
    const baseTimeMs = operations * impl.timeMultiplier / 1000;
    const memoryMB = (size * 8 * impl.memoryMultiplier) / (1024 * 1024); // 8 bytes por punto
    
    // Rating de escalabilidad
    let scalabilityRating;
    if (implementationType === 'naive') {
        scalabilityRating = size < 1000 ? 'Aceptable' : size < 5000 ? 'Pobre' : 'Muy Pobre';
    } else {
        scalabilityRating = size < 5000 ? 'Excelente' : size < 10000 ? 'Buena' : 'Aceptable';
    }
    
    return {
        operations: Math.round(operations),
        timeMs: Math.round(baseTimeMs),
        memoryMB: memoryMB.toFixed(1),
        scalabilityRating,
        complexity: impl.complexity
    };
}

// Función para actualizar la demostración principal
function updateDemo() {
    const size = parseInt(document.getElementById('dataset-size').value);
    const implementationType = document.getElementById('implementation-type').value;
    const eps = parseInt(document.getElementById('eps-slider').value);
    
    console.log(`🔄 Actualizando demo: size=${size}, impl=${implementationType}, eps=${eps}`);
    
    // Actualizar valores mostrados
    document.getElementById('size-value').textContent = size;
    document.getElementById('eps-value').textContent = eps;
    
    // Calcular métricas
    const metrics = calculatePerformanceMetrics(size, implementationType, eps);
    
    console.log(`📊 Métricas calculadas:`, metrics);
    
    // Actualizar estadísticas
    document.getElementById('current-size').textContent = size;
    document.getElementById('complexity-order').textContent = metrics.complexity;
    document.getElementById('estimated-ops').textContent = metrics.operations.toLocaleString();
    document.getElementById('execution-time').textContent = metrics.timeMs + 'ms';
    document.getElementById('memory-usage').textContent = metrics.memoryMB + 'MB';
    document.getElementById('scalability-rating').textContent = metrics.scalabilityRating;
    
    // Generar y visualizar datos simulados
    const simulatedData = generateSimulatedData(Math.min(size, 500), eps); // Limitar visualización
    createMainVisualization(simulatedData, eps, implementationType);
    
    // Actualizar gráfico de comparación
    updateComparisonChart();
}

// Función para crear la visualización principal
function createMainVisualization(points, eps, implementationType) {
    const svg = d3.select("#complexity-demo");
    svg.selectAll("*").remove();
    
    const impl = implementations[implementationType];
    
    console.log(`🎨 Creando visualización con ${points.length} puntos, impl=${implementationType}`);
    
    // Simular clustering básico para mostrar el concepto
    const clusters = simulateBasicClustering(points, eps);
    
    // Dibujar puntos con colores según cluster
    svg.selectAll(".point")
        .data(clusters)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 4)
        .attr("fill", d => d.cluster === 'noise' ? '#95a5a6' : impl.color)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6);
            
            // Mostrar información del punto
            const tooltip = svg.append("g").attr("id", "tooltip");
            tooltip.append("rect")
                .attr("x", d.x + 10)
                .attr("y", d.y - 40)
                .attr("width", 120)
                .attr("height", 50)
                .attr("fill", "rgba(0,0,0,0.9)")
                .attr("rx", 5);
            
            tooltip.append("text")
                .attr("x", d.x + 20)
                .attr("y", d.y - 20)
                .attr("fill", "white")
                .attr("font-size", "11px")
                .text(`Punto ${d.id}`);
            
            tooltip.append("text")
                .attr("x", d.x + 20)
                .attr("y", d.y - 8)
                .attr("fill", "white")
                .attr("font-size", "11px")
                .text(`Cluster: ${d.cluster}`);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", 4);
            svg.select("#tooltip").remove();
        });
    
    // Agregar indicador de implementación
    svg.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", impl.color)
        .text(`Implementación: ${impl.name}`);
    
    svg.append("text")
        .attr("x", 20)
        .attr("y", 50)
        .attr("font-size", "14px")
        .attr("fill", "#2c3e50")
        .text(`Complejidad: ${impl.complexity}`);
}

// Función para simular clustering básico (simplificado para visualización)
function simulateBasicClustering(points, eps) {
    return points.map(point => ({
        ...point,
        cluster: Math.random() < 0.15 ? 'noise' : 'cluster1'
    }));
}

// Función para actualizar el gráfico de comparación de complejidades
function updateComparisonChart() {
    const svg = d3.select("#complexity-comparison");
    svg.selectAll("*").remove();
    
    const margin = {top: 20, right: 80, bottom: 40, left: 60};
    const width = 650 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Datos para el gráfico
    const sizes = [100, 500, 1000, 2000, 5000, 10000];
    const data = [];
    
    Object.keys(implementations).forEach(implType => {
        sizes.forEach(size => {
            const ops = complexityFunctions[implType](size);
            data.push({
                size: size,
                operations: ops,
                implementation: implType,
                color: implementations[implType].color,
                name: implementations[implType].name
            });
        });
    });
    
    // Escalas
    const xScale = d3.scaleLinear()
        .domain([100, 10000])
        .range([0, width]);
    
    const yScale = d3.scaleLog()
        .domain([1000, d3.max(data, d => d.operations)])
        .range([height, 0]);
    
    // Líneas para cada implementación
    const line = d3.line()
        .x(d => xScale(d.size))
        .y(d => yScale(d.operations))
        .curve(d3.curveMonotoneX);
    
    Object.keys(implementations).forEach(implType => {
        const implData = data.filter(d => d.implementation === implType);
        
        g.append("path")
            .datum(implData)
            .attr("fill", "none")
            .attr("stroke", implementations[implType].color)
            .attr("stroke-width", 3)
            .attr("d", line);
        
        // Puntos en la línea
        g.selectAll(`.point-${implType}`)
            .data(implData)
            .enter()
            .append("circle")
            .attr("class", `point-${implType}`)
            .attr("cx", d => xScale(d.size))
            .attr("cy", d => yScale(d.operations))
            .attr("r", 4)
            .attr("fill", implementations[implType].color)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
    });
    
    // Ejes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0s")));
    
    g.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0s")));
    
    // Etiquetas de ejes
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Número de Operaciones");
    
    g.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
        .style("text-anchor", "middle")
        .text("Tamaño del Dataset (N)");
    
    // Leyenda
    const legend = g.append("g")
        .attr("transform", `translate(${width - 150}, 20)`);
    
    Object.keys(implementations).forEach((implType, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);
        
        legendRow.append("rect")
            .attr("width", 15)
            .attr("height", 3)
            .attr("fill", implementations[implType].color);
        
        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 3)
            .attr("font-size", "12px")
            .text(implementations[implType].name);
    });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando DBSCAN Pregunta 8...");
    
    // Configurar event listeners
    const datasetSlider = document.getElementById('dataset-size');
    const implementationSelect = document.getElementById('implementation-type');
    const epsSlider = document.getElementById('eps-slider');
    
    // Event listeners
    datasetSlider.addEventListener('input', updateDemo);
    datasetSlider.addEventListener('change', updateDemo);
    
    implementationSelect.addEventListener('change', updateDemo);
    
    epsSlider.addEventListener('input', updateDemo);
    epsSlider.addEventListener('change', updateDemo);
    
    // Crear demo inicial
    updateDemo();
    
    console.log("✅ DBSCAN Pregunta 8 inicializada correctamente!");
});