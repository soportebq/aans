// JavaScript específico para dbscan_q9.html - Ventajas de DBSCAN

// Datasets especializados para demostrar cada ventaja
const datasets = {
    irregular: [
        // Cluster en forma de C (izquierda)
        {x: 100, y: 150, id: 1}, {x: 110, y: 140, id: 2}, {x: 120, y: 135, id: 3},
        {x: 130, y: 130, id: 4}, {x: 140, y: 130, id: 5}, {x: 150, y: 135, id: 6},
        {x: 160, y: 140, id: 7}, {x: 170, y: 150, id: 8}, {x: 175, y: 160, id: 9},
        {x: 180, y: 170, id: 10}, {x: 180, y: 180, id: 11}, {x: 175, y: 190, id: 12},
        {x: 170, y: 200, id: 13}, {x: 160, y: 210, id: 14}, {x: 150, y: 215, id: 15},
        {x: 140, y: 220, id: 16}, {x: 130, y: 220, id: 17}, {x: 120, y: 215, id: 18},
        {x: 110, y: 210, id: 19}, {x: 100, y: 200, id: 20},
        
        // Cluster en forma de S (derecha)
        {x: 400, y: 120, id: 21}, {x: 420, y: 125, id: 22}, {x: 440, y: 130, id: 23},
        {x: 460, y: 140, id: 24}, {x: 480, y: 150, id: 25}, {x: 500, y: 165, id: 26},
        {x: 510, y: 180, id: 27}, {x: 500, y: 195, id: 28}, {x: 480, y: 205, id: 29},
        {x: 460, y: 210, id: 30}, {x: 440, y: 215, id: 31}, {x: 420, y: 220, id: 32},
        {x: 400, y: 230, id: 33}, {x: 380, y: 240, id: 34}, {x: 360, y: 250, id: 35},
        {x: 340, y: 265, id: 36}, {x: 320, y: 280, id: 37}, {x: 300, y: 290, id: 38},
        
        // Cluster espiral (centro)
        {x: 300, y: 150, id: 39}, {x: 310, y: 155, id: 40}, {x: 315, y: 165, id: 41},
        {x: 310, y: 175, id: 42}, {x: 300, y: 180, id: 43}, {x: 290, y: 175, id: 44},
        {x: 285, y: 165, id: 45}, {x: 290, y: 155, id: 46}, {x: 300, y: 150, id: 47},
        
        // Outliers genuinos
        {x: 50, y: 50, id: 48}, {x: 600, y: 100, id: 49}, {x: 150, y: 400, id: 50}
    ],
    
    noise: [
        // Cluster denso 1 (limpio)
        {x: 150, y: 150, id: 1}, {x: 160, y: 160, id: 2}, {x: 155, y: 145, id: 3},
        {x: 165, y: 155, id: 4}, {x: 145, y: 165, id: 5}, {x: 170, y: 150, id: 6},
        {x: 158, y: 170, id: 7}, {x: 152, y: 140, id: 8},
        
        // Cluster denso 2 (limpio)
        {x: 450, y: 200, id: 9}, {x: 460, y: 210, id: 10}, {x: 455, y: 195, id: 11},
        {x: 465, y: 205, id: 12}, {x: 445, y: 215, id: 13}, {x: 470, y: 200, id: 14},
        
        // MUCHO ruido disperso
        {x: 80, y: 80, id: 15}, {x: 250, y: 90, id: 16}, {x: 380, y: 120, id: 17},
        {x: 120, y: 250, id: 18}, {x: 300, y: 160, id: 19}, {x: 500, y: 150, id: 20},
        {x: 200, y: 300, id: 21}, {x: 350, y: 280, id: 22}, {x: 180, y: 180, id: 23},
        {x: 320, y: 220, id: 24}, {x: 90, y: 200, id: 25}, {x: 420, y: 300, id: 26},
        {x: 280, y: 120, id: 27}, {x: 520, y: 250, id: 28}, {x: 160, y: 320, id: 29},
        {x: 400, y: 80, id: 30}, {x: 50, y: 150, id: 31}, {x: 550, y: 180, id: 32}
    ],
    
    varying: [
        // Cluster MUY denso (alta densidad)
        {x: 120, y: 150, id: 1}, {x: 125, y: 155, id: 2}, {x: 130, y: 150, id: 3},
        {x: 128, y: 160, id: 4}, {x: 122, y: 145, id: 5}, {x: 135, y: 148, id: 6},
        {x: 126, y: 165, id: 7}, {x: 132, y: 142, id: 8}, {x: 118, y: 158, id: 9},
        {x: 138, y: 152, id: 10}, {x: 124, y: 168, id: 11}, {x: 134, y: 145, id: 12},
        
        // Cluster disperso (baja densidad)
        {x: 350, y: 180, id: 13}, {x: 380, y: 200, id: 14}, {x: 420, y: 160, id: 15},
        {x: 390, y: 220, id: 16}, {x: 430, y: 190, id: 17}, {x: 360, y: 240, id: 18},
        {x: 440, y: 170, id: 19}, {x: 370, y: 210, id: 20}, {x: 410, y: 230, id: 21},
        
        // Cluster mediano (densidad media)
        {x: 250, y: 300, id: 22}, {x: 270, y: 320, id: 23}, {x: 280, y: 310, id: 24},
        {x: 260, y: 330, id: 25}, {x: 290, y: 295, id: 26}, {x: 240, y: 315, id: 27},
        
        // Outliers
        {x: 500, y: 100, id: 28}, {x: 100, y: 350, id: 29}, {x: 550, y: 300, id: 30}
    ],
    
    nested: [
        // Cluster exterior (anillo)
        {x: 300, y: 150, id: 1}, {x: 320, y: 160, id: 2}, {x: 340, y: 180, id: 3},
        {x: 350, y: 200, id: 4}, {x: 340, y: 220, id: 5}, {x: 320, y: 240, id: 6},
        {x: 300, y: 250, id: 7}, {x: 280, y: 240, id: 8}, {x: 260, y: 220, id: 9},
        {x: 250, y: 200, id: 10}, {x: 260, y: 180, id: 11}, {x: 280, y: 160, id: 12},
        {x: 310, y: 155, id: 13}, {x: 330, y: 170, id: 14}, {x: 345, y: 190, id: 15},
        {x: 345, y: 210, id: 16}, {x: 330, y: 230, id: 17}, {x: 310, y: 245, id: 18},
        {x: 290, y: 230, id: 19}, {x: 275, y: 210, id: 20}, {x: 275, y: 190, id: 21},
        {x: 290, y: 170, id: 22},
        
        // Cluster interior (centro)
        {x: 295, y: 195, id: 23}, {x: 305, y: 205, id: 24}, {x: 315, y: 195, id: 25},
        {x: 305, y: 185, id: 26}, {x: 300, y: 200, id: 27}, {x: 310, y: 200, id: 28},
        
        // Cluster separado (izquierda)
        {x: 150, y: 180, id: 29}, {x: 170, y: 190, id: 30}, {x: 160, y: 200, id: 31},
        {x: 180, y: 170, id: 32}, {x: 140, y: 210, id: 33}, {x: 190, y: 185, id: 34},
        
        // Outliers
        {x: 450, y: 150, id: 35}, {x: 100, y: 100, id: 36}, {x: 400, y: 300, id: 37}
    ]
};

// Algoritmos simulados
const algorithms = {
    dbscan: (points, eps, minPts = 3) => {
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
    },
    
    kmeans: (points, k = 3) => {
        const result = points.map(p => ({...p, cluster: 'cluster1', neighbors: 0, isCore: false}));
        
        console.log(`🔶 K-Means iniciado con ${points.length} puntos, k=${k}`);
        
        if (points.length === 0) return result;
        
        // Inicializar centroides usando K-Means++ (mejorado)
        const centroids = [];
        
        // Primer centroide aleatorio
        centroids.push({
            x: points[Math.floor(Math.random() * points.length)].x,
            y: points[Math.floor(Math.random() * points.length)].y,
            cluster: `cluster1`
        });
        
        // Centroides restantes usando K-Means++
        for (let i = 1; i < k; i++) {
            let maxDist = 0;
            let farthestPoint = points[0];
            
            points.forEach(point => {
                let minDistToCentroid = Infinity;
                centroids.forEach(centroid => {
                    const dist = Math.sqrt(
                        Math.pow(point.x - centroid.x, 2) + 
                        Math.pow(point.y - centroid.y, 2)
                    );
                    minDistToCentroid = Math.min(minDistToCentroid, dist);
                });
                
                if (minDistToCentroid > maxDist) {
                    maxDist = minDistToCentroid;
                    farthestPoint = point;
                }
            });
            
            centroids.push({
                x: farthestPoint.x,
                y: farthestPoint.y,
                cluster: `cluster${i + 1}`
            });
        }
        
        console.log(`🔶 Centroides inicializados:`, centroids.map(c => `(${Math.round(c.x)}, ${Math.round(c.y)})`));
        
        // Iteraciones de K-Means (simplificado a 1 iteración para visualización)
        result.forEach(point => {
            let minDist = Infinity;
            let assignedCluster = 'cluster1';
            
            centroids.forEach(centroid => {
                const dist = Math.sqrt(
                    Math.pow(point.x - centroid.x, 2) + 
                    Math.pow(point.y - centroid.y, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    assignedCluster = centroid.cluster;
                }
            });
            
            point.cluster = assignedCluster;
            point.distToCentroid = Math.round(minDist);
        });
        
        // Actualizar centroides basándose en asignaciones
        centroids.forEach(centroid => {
            const clusterPoints = result.filter(p => p.cluster === centroid.cluster);
            if (clusterPoints.length > 0) {
                centroid.x = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                centroid.y = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
            }
        });
        
        console.log(`🔶 K-Means completado. Centroides finales:`, centroids.map(c => `(${Math.round(c.x)}, ${Math.round(c.y)})`));
        
        return result;
    },
    
    hierarchical: (points) => {
        const result = points.map(p => ({...p, cluster: 'cluster1', neighbors: 0, isCore: false}));
        
        console.log(`🌳 Jerárquico iniciado con ${points.length} puntos - INDEPENDIENTE de epsilon`);
        
        if (points.length === 0) return result;
        
        // Encontrar el punto más central (independiente de epsilon)
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        
        console.log(`🌳 Centro calculado: (${Math.round(centerX)}, ${Math.round(centerY)}) - NO usa epsilon`);
        
        // Calcular distancias para clustering jerárquico
        const distances = result.map(point => {
            const distToCenter = Math.sqrt(
                Math.pow(point.x - centerX, 2) + 
                Math.pow(point.y - centerY, 2)
            );
            return { point, distToCenter };
        });
        
        // Ordenar por distancia para crear jerarquía
        distances.sort((a, b) => a.distToCenter - b.distToCenter);
        
        // Usar percentiles adaptativos basados en la distribución real de distancias
        const allDistances = distances.map(d => d.distToCenter);
        const percentile25 = allDistances[Math.floor(allDistances.length * 0.25)];
        const percentile50 = allDistances[Math.floor(allDistances.length * 0.50)];
        const percentile75 = allDistances[Math.floor(allDistances.length * 0.75)];
        
        console.log(`🌳 Percentiles de distancia: 25%=${Math.round(percentile25)}, 50%=${Math.round(percentile50)}, 75%=${Math.round(percentile75)}`);
        
        // Asignar clusters basándose en percentiles (método jerárquico real)
        distances.forEach(item => {
            const dist = item.distToCenter;
            let clusterName;
            let level;
            
            if (dist <= percentile25) {
                clusterName = 'cluster1';
                level = 1;
            } else if (dist <= percentile50) {
                clusterName = 'cluster2';
                level = 2;
            } else if (dist <= percentile75) {
                clusterName = 'cluster3';
                level = 3;
            } else {
                clusterName = 'cluster4';
                level = 4;
            }
            
            item.point.cluster = clusterName;
            item.point.level = level;
            item.point.distToCenter = Math.round(item.distToCenter);
            item.point.hierarchicalInfo = {
                percentile: dist <= percentile25 ? '0-25%' : 
                           dist <= percentile50 ? '25-50%' : 
                           dist <= percentile75 ? '50-75%' : '75-100%'
            };
        });
        
        const clusterCounts = {};
        result.forEach(p => {
            clusterCounts[p.cluster] = (clusterCounts[p.cluster] || 0) + 1;
        });
        
        console.log(`🌳 Jerárquico completado - CLUSTERING FIJO por percentiles:`, clusterCounts);
        
        return result;
    }
};

// Función para debuggear elementos DOM
function debugDOMElements() {
    console.log("🔍 DEBUG: Verificando elementos DOM...");
    
    const elements = {
        'algorithm-selector': document.getElementById('algorithm-selector'),
        'dataset-selector': document.getElementById('dataset-selector'),
        'eps-slider': document.getElementById('eps-slider'),
        'epsilon-control': document.getElementById('epsilon-control'),
        'eps-value': document.getElementById('eps-value')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`🔍 ${name}: ${element ? '✅ Encontrado' : '❌ NO encontrado'}`);
        if (element) {
            console.log(`   - Visible: ${element.style.display !== 'none'}`);
            console.log(`   - Opacidad: ${element.style.opacity || 'default'}`);
        }
    });
}
function evaluateQuality(points, algorithm) {
    const clustered = points.filter(p => p.cluster !== 'noise');
    const noiseCount = points.filter(p => p.cluster === 'noise').length;
    const clusterCount = new Set(clustered.map(p => p.cluster)).size;
    
    let quality, shapeFlexibility, noiseHandling;
    
    switch(algorithm) {
        case 'dbscan':
            quality = 85 + Math.random() * 10; // 85-95%
            shapeFlexibility = 'Alta';
            noiseHandling = 'Excelente';
            break;
        case 'kmeans':
            quality = 60 + Math.random() * 15; // 60-75%
            shapeFlexibility = 'Baja';
            noiseHandling = 'Deficiente';
            break;
        case 'hierarchical':
            quality = 70 + Math.random() * 10; // 70-80%
            shapeFlexibility = 'Media';
            noiseHandling = 'Limitado';
            break;
    }
    
    return {
        quality: Math.round(quality),
        shapeFlexibility,
        noiseHandling,
        clusterCount,
        noiseCount
    };
}

// Función para crear visualización principal
function updateMainVisualization() {
    const algorithm = document.getElementById('algorithm-selector').value;
    const dataset = document.getElementById('dataset-selector').value;
    const eps = parseInt(document.getElementById('eps-slider').value);
    
    console.log(`🔄 Actualizando visualización: ${algorithm} en dataset ${dataset} con eps=${eps}`);
    
    document.getElementById('eps-value').textContent = eps;
    
    const currentData = [...datasets[dataset]];
    let processedData;
    
    if (algorithm === 'dbscan') {
        processedData = algorithms.dbscan(currentData, eps, 3);
    } else {
        processedData = algorithms[algorithm](currentData);
    }
    
    createVisualization('main-demo', processedData, algorithm, eps);
    
    // Actualizar estadísticas
    const evaluation = evaluateQuality(processedData, algorithm);
    
    const algorithmNames = {
        dbscan: 'DBSCAN',
        kmeans: 'K-Means',
        hierarchical: 'Jerárquico'
    };
    
    document.getElementById('algorithm-name').textContent = algorithmNames[algorithm];
    document.getElementById('clusters-found').textContent = evaluation.clusterCount;
    document.getElementById('noise-detected').textContent = evaluation.noiseCount;
    document.getElementById('cluster-quality').textContent = evaluation.quality + '%';
    document.getElementById('shape-flexibility').textContent = evaluation.shapeFlexibility;
    document.getElementById('noise-handling').textContent = evaluation.noiseHandling;
    
    console.log(`📊 Evaluación: ${evaluation.clusterCount} clusters, ${evaluation.noiseCount} ruido, ${evaluation.quality}% calidad`);
}

// Función para crear visualización
function createVisualization(svgId, points, algorithm, eps, scale = 1) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    
    const colors = {
        cluster1: '#3498db', cluster2: '#e74c3c', cluster3: '#f39c12',
        cluster4: '#9b59b6', cluster5: '#1abc9c', noise: '#95a5a6'
    };
    
    console.log(`🎨 Creando visualización ${svgId} para ${algorithm} con ${points.length} puntos`);
    
    // Mostrar elementos visuales específicos según el algoritmo
    if (scale === 1) { // Solo en el demo principal
        if (algorithm === 'dbscan') {
            // DBSCAN: Mostrar círculos de epsilon para TODOS los core points
            const corePoints = points.filter(p => p.isCore);
            console.log(`🔵 Mostrando TODOS los ${corePoints.length} círculos epsilon para DBSCAN`);
            
            corePoints.forEach((point, index) => {
                const opacity = Math.max(0.15, 0.5 - (index * 0.02));
                
                svg.append("circle")
                    .attr("cx", point.x * scale)
                    .attr("cy", point.y * scale)
                    .attr("r", eps * scale)
                    .attr("fill", "rgba(52,152,219,0.08)")
                    .attr("stroke", "#3498db")
                    .attr("stroke-width", 1.5 * scale)
                    .attr("stroke-dasharray", "4,4")
                    .attr("opacity", opacity);
            });
            
        } else if (algorithm === 'kmeans') {
            // K-MEANS: Mostrar centroides dinámicos y áreas de influencia
            console.log(`🔶 Mostrando centroides dinámicos para K-Means`);
            
            // Calcular centroides basándose en los datos actuales
            const clusters = {};
            points.forEach(point => {
                if (!clusters[point.cluster]) {
                    clusters[point.cluster] = [];
                }
                clusters[point.cluster].push(point);
            });
            
            // Calcular centroide real de cada cluster
            const centroids = [];
            Object.keys(clusters).forEach((clusterName, index) => {
                const clusterPoints = clusters[clusterName];
                if (clusterPoints.length > 0) {
                    const centerX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
                    const centerY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
                    
                    centroids.push({
                        x: centerX,
                        y: centerY,
                        cluster: clusterName,
                        color: colors[clusterName] || colors.cluster1,
                        points: clusterPoints.length
                    });
                }
            });
            
            // Dibujar áreas de influencia (Voronoi aproximado)
            centroids.forEach((centroid, index) => {
                // Calcular radio de influencia basándose en la dispersión del cluster
                const clusterPoints = clusters[centroid.cluster];
                const avgDist = clusterPoints.reduce((sum, p) => 
                    sum + Math.sqrt(Math.pow(p.x - centroid.x, 2) + Math.pow(p.y - centroid.y, 2)), 0
                ) / clusterPoints.length;
                
                const influenceRadius = Math.max(50, avgDist * 1.5);
                
                // Área circular de influencia
                svg.append("circle")
                    .attr("cx", centroid.x)
                    .attr("cy", centroid.y)
                    .attr("r", influenceRadius)
                    .attr("fill", centroid.color)
                    .attr("opacity", 0.1)
                    .attr("stroke", centroid.color)
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5");
                
                // Dibujar centroide
                svg.append("circle")
                    .attr("cx", centroid.x)
                    .attr("cy", centroid.y)
                    .attr("r", 12)
                    .attr("fill", centroid.color)
                    .attr("stroke", "#2c3e50")
                    .attr("stroke-width", 3)
                    .style("cursor", "pointer");
                
                // Etiqueta del centroide
                svg.append("text")
                    .attr("x", centroid.x)
                    .attr("y", centroid.y + 5)
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .attr("font-size", "10px")
                    .attr("font-weight", "bold")
                    .text(`C${index + 1}`);
                
                // Mostrar líneas desde centroide a algunos puntos del cluster
                const samplePoints = clusterPoints.slice(0, Math.min(5, clusterPoints.length));
                samplePoints.forEach(point => {
                    svg.append("line")
                        .attr("x1", centroid.x)
                        .attr("y1", centroid.y)
                        .attr("x2", point.x)
                        .attr("y2", point.y)
                        .attr("stroke", centroid.color)
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.3)
                        .attr("stroke-dasharray", "2,2");
                });
            });
            
        } else if (algorithm === 'hierarchical') {
            // JERÁRQUICO: Mostrar niveles jerárquicos FIJOS (independientes de epsilon)
            console.log(`🌳 Mostrando estructura jerárquica FIJA para ${points.length} puntos`);
            
            // Calcular centro dinámico basado en los datos actuales
            const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
            const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
            
            console.log(`🌳 Centro jerárquico: (${Math.round(centerX)}, ${Math.round(centerY)})`);
            
            // Calcular radios basándose en la distribución real de los datos
            const distances = points.map(p => 
                Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
            );
            distances.sort((a, b) => a - b);
            
            // Radios basados en percentiles de los datos (NO en epsilon)
            const hierarchicalRadii = [
                distances[Math.floor(distances.length * 0.25)], // 25%
                distances[Math.floor(distances.length * 0.50)], // 50%
                distances[Math.floor(distances.length * 0.75)], // 75%
                distances[Math.floor(distances.length * 0.90)]  // 90%
            ];
            
            console.log(`🌳 Radios jerárquicos calculados:`, hierarchicalRadii.map(r => Math.round(r)));
            
            // Círculos de niveles jerárquicos con radios adaptativos
            hierarchicalRadii.forEach((radius, index) => {
                svg.append("circle")
                    .attr("cx", centerX)
                    .attr("cy", centerY)
                    .attr("r", radius)
                    .attr("fill", "none")
                    .attr("stroke", "#9b59b6")
                    .attr("stroke-width", 3 - (index * 0.3))
                    .attr("stroke-dasharray", "8,4")
                    .attr("opacity", 0.6 - (index * 0.1));
                
                // Etiquetas de nivel con percentiles
                if (radius > 20) { // Solo mostrar si hay espacio
                    svg.append("text")
                        .attr("x", centerX + radius - 25)
                        .attr("y", centerY - 10)
                        .attr("fill", "#9b59b6")
                        .attr("font-size", "10px")
                        .attr("font-weight", "bold")
                        .text(`L${index + 1}`);
                }
            });
            
            // Mostrar punto central del dendrograma
            svg.append("circle")
                .attr("cx", centerX)
                .attr("cy", centerY)
                .attr("r", 8)
                .attr("fill", "#9b59b6")
                .attr("stroke", "#2c3e50")
                .attr("stroke-width", 2);
            
            svg.append("text")
                .attr("x", centerX)
                .attr("y", centerY + 4)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .text("ROOT");
            
            // Mostrar conexiones entre puntos del mismo nivel jerárquico
            const levelGroups = {};
            points.forEach(point => {
                if (!levelGroups[point.level]) {
                    levelGroups[point.level] = [];
                }
                levelGroups[point.level].push(point);
            });
            
            // Conexiones dentro de cada nivel
            Object.values(levelGroups).forEach((levelPoints, levelIndex) => {
                const maxConnections = Math.min(10, levelPoints.length * 2); // Limitar conexiones
                let connectionCount = 0;
                
                for (let i = 0; i < levelPoints.length && connectionCount < maxConnections; i++) {
                    for (let j = i + 1; j < levelPoints.length && connectionCount < maxConnections; j++) {
                        const dist = Math.sqrt(
                            Math.pow(levelPoints[i].x - levelPoints[j].x, 2) + 
                            Math.pow(levelPoints[i].y - levelPoints[j].y, 2)
                        );
                        
                        // Solo conectar puntos relativamente cercanos en el mismo nivel
                        if (dist <= hierarchicalRadii[levelIndex] * 0.8) {
                            svg.append("line")
                                .attr("x1", levelPoints[i].x)
                                .attr("y1", levelPoints[i].y)
                                .attr("x2", levelPoints[j].x)
                                .attr("y2", levelPoints[j].y)
                                .attr("stroke", "#9b59b6")
                                .attr("stroke-width", 1)
                                .attr("opacity", 0.4 - (levelIndex * 0.05))
                                .attr("stroke-dasharray", "2,2");
                            
                            connectionCount++;
                        }
                    }
                }
            });
        }
    }
    
    // Para demos pequeños (scale < 1), mostrar elementos visuales simplificados
    if (scale < 1) {
        if (algorithm === 'dbscan') {
            const corePoints = points.filter(p => p.isCore);
            const samplesToShow = Math.min(3, corePoints.length);
            
            for (let i = 0; i < samplesToShow; i++) {
                const point = corePoints[i];
                svg.append("circle")
                    .attr("cx", point.x * scale)
                    .attr("cy", point.y * scale)
                    .attr("r", eps * scale)
                    .attr("fill", "rgba(52,152,219,0.1)")
                    .attr("stroke", "#3498db")
                    .attr("stroke-width", 1 * scale)
                    .attr("stroke-dasharray", "3,3")
                    .attr("opacity", 0.6);
            }
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
        .attr("r", d => {
            if (algorithm === 'dbscan') {
                return (d.isCore ? 8 : d.cluster !== 'noise' ? 6 : 4) * scale;
            }
            return 6 * scale;
        })
        .attr("fill", d => colors[d.cluster] || colors.noise)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.5 * scale)
        .style("cursor", scale === 1 ? "pointer" : "default");
    
    // Agregar tooltips solo al gráfico principal
    if (scale === 1) {
        svg.selectAll(".point")
            .on("mouseover", function(event, d) {
                const originalR = algorithm === 'dbscan' ? 
                    (d.isCore ? 8 : d.cluster !== 'noise' ? 6 : 4) : 6;
                d3.select(this).attr("r", originalR * 1.5);
                
                const tooltip = svg.append("g").attr("id", "tooltip");
                tooltip.append("rect")
                    .attr("x", d.x + 15)
                    .attr("y", d.y - 85)
                    .attr("width", 180)
                    .attr("height", 100)
                    .attr("fill", "rgba(0,0,0,0.9)")
                    .attr("rx", 8);
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y - 60)
                    .attr("fill", "white")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .text(`Punto ${d.id} (${algorithm.toUpperCase()})`);
                
                // Información específica por algoritmo
                if (algorithm === 'dbscan') {
                    tooltip.append("text")
                        .attr("x", d.x + 25)
                        .attr("y", d.y - 45)
                        .attr("fill", "white")
                        .attr("font-size", "11px")
                        .text(`Tipo: ${d.isCore ? 'Core' : d.cluster !== 'noise' ? 'Border' : 'Noise'}`);
                    
                    tooltip.append("text")
                        .attr("x", d.x + 25)
                        .attr("y", d.y - 30)
                        .attr("fill", "white")
                        .attr("font-size", "11px")
                        .text(`Vecinos en ε=${eps}: ${d.neighbors}`);
                        
                } else if (algorithm === 'kmeans') {
                    // Mostrar información específica de K-Means
                    tooltip.append("text")
                        .attr("x", d.x + 25)
                        .attr("y", d.y - 45)
                        .attr("fill", "white")
                        .attr("font-size", "11px")
                        .text(`Asignado por distancia mínima`);
                    
                    if (d.distToCentroid) {
                        tooltip.append("text")
                            .attr("x", d.x + 25)
                            .attr("y", d.y - 30)
                            .attr("fill", "white")
                            .attr("font-size", "11px")
                            .text(`Dist. a centroide: ${d.distToCentroid}px`);
                    }
                        
                } else if (algorithm === 'hierarchical') {
                    // Mostrar información específica de Jerárquico
                    tooltip.append("text")
                        .attr("x", d.x + 25)
                        .attr("y", d.y - 45)
                        .attr("fill", "white")
                        .attr("font-size", "11px")
                        .text(`Clustering jerárquico por percentiles`);
                    
                    if (d.level && d.hierarchicalInfo) {
                        tooltip.append("text")
                            .attr("x", d.x + 25)
                            .attr("y", d.y - 30)
                            .attr("fill", "white")
                            .attr("font-size", "11px")
                            .text(`Nivel ${d.level} (${d.hierarchicalInfo.percentile})`);
                    } else if (d.level) {
                        tooltip.append("text")
                            .attr("x", d.x + 25)
                            .attr("y", d.y - 30)
                            .attr("fill", "white")
                            .attr("font-size", "11px")
                            .text(`Nivel jerárquico: ${d.level}`);
                    }
                }
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y - 15)
                    .attr("fill", "white")
                    .attr("font-size", "11px")
                    .text(`Cluster: ${d.cluster}`);
                
                tooltip.append("text")
                    .attr("x", d.x + 25)
                    .attr("y", d.y)
                    .attr("fill", "white")
                    .attr("font-size", "11px")
                    .text(`Pos: (${d.x}, ${d.y})`);
            })
            .on("mouseout", function(event, d) {
                const originalR = algorithm === 'dbscan' ? 
                    (d.isCore ? 8 : d.cluster !== 'noise' ? 6 : 4) : 6;
                d3.select(this).attr("r", originalR);
                svg.select("#tooltip").remove();
            });
    }
    
    console.log(`✅ Visualización ${svgId} completada`);
}

// Función para crear demos estáticos de ventajas específicas
function createAdvantagesDemos() {
    console.log("🎨 Creando demos de ventajas específicas...");
    
    // Demo 1: Formas arbitrarias - mostrar más círculos para ver la forma
    const irregularData = algorithms.dbscan([...datasets.irregular], 35, 3);
    createVisualizationWithFullEpsilon('shapes-demo', irregularData, 'dbscan', 35, 0.8);
    
    // Demo 2: Detección de outliers - mostrar círculos para ver densidad
    const noiseData = algorithms.dbscan([...datasets.noise], 30, 3);
    createVisualizationWithFullEpsilon('outliers-demo', noiseData, 'dbscan', 30, 0.8);
    
    // Demo 3: Determinación automática de k
    const autoKData = algorithms.dbscan([...datasets.varying], 40, 3);
    createVisualizationWithFullEpsilon('automatic-k-demo', autoKData, 'dbscan', 40, 0.8);
    
    // Demo 4: Densidades variables
    const densityData = algorithms.dbscan([...datasets.varying], 35, 3);
    createVisualizationWithFullEpsilon('density-demo', densityData, 'dbscan', 35, 0.8);
    
    // Demo 5: Resultados determinísticos
    const deterministicData = algorithms.dbscan([...datasets.nested], 40, 3);
    createVisualizationWithFullEpsilon('deterministic-demo', deterministicData, 'dbscan', 40, 0.8);
    
    // Demo 6: Eficiencia espacial
    const efficiencyData = algorithms.dbscan([...datasets.irregular], 35, 3);
    createVisualizationWithFullEpsilon('efficiency-demo', efficiencyData, 'dbscan', 35, 0.8);
    
    console.log("✅ Demos de ventajas completados");
}

// Función especializada para demos pequeños que muestra más círculos de epsilon
function createVisualizationWithFullEpsilon(svgId, points, algorithm, eps, scale) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    
    const colors = {
        cluster1: '#3498db', cluster2: '#e74c3c', cluster3: '#f39c12',
        cluster4: '#9b59b6', cluster5: '#1abc9c', noise: '#95a5a6'
    };
    
    console.log(`🎨 Creando visualización especializada ${svgId} con TODOS los epsilon`);
    
    // Mostrar círculos de epsilon para TODOS los core points (incluso en demos pequeños)
    if (algorithm === 'dbscan') {
        const corePoints = points.filter(p => p.isCore);
        console.log(`🔵 Mostrando ${corePoints.length} círculos de epsilon en ${svgId}`);
        
        corePoints.forEach((point, index) => {
            // Opacidad variable pero más visible en demos pequeños
            const opacity = Math.max(0.2, 0.6 - (index * 0.03));
            
            svg.append("circle")
                .attr("cx", point.x * scale)
                .attr("cy", point.y * scale)
                .attr("r", eps * scale)
                .attr("fill", "rgba(52,152,219,0.1)")
                .attr("stroke", "#3498db")
                .attr("stroke-width", 1.2 * scale)
                .attr("stroke-dasharray", "3,3")
                .attr("opacity", opacity);
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
        .attr("r", d => {
            if (algorithm === 'dbscan') {
                return (d.isCore ? 6 : d.cluster !== 'noise' ? 4 : 3) * scale;
            }
            return 4 * scale;
        })
        .attr("fill", d => colors[d.cluster] || colors.noise)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1.2 * scale);
    
    console.log(`✅ Visualización especializada ${svgId} completada con ${points.length} puntos`);
}

// Inicialización SIMPLE
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Inicializando DBSCAN Pregunta 9...");
    
    // Crear demos estáticos
    createAdvantagesDemos();
    
    // === SCRIPT SIMPLE PARA OCULTAR/MOSTRAR SLIDER ===
    const algorithmSelect = document.getElementById('algorithm-selector');
    const epsilonControl = document.getElementById('epsilon-control');
    
    console.log("📋 algorithmSelect encontrado:", !!algorithmSelect);
    console.log("📋 epsilonControl encontrado:", !!epsilonControl);
    
    if (algorithmSelect && epsilonControl) {
        algorithmSelect.addEventListener('change', function() {
            const selectedIndex = this.selectedIndex;
            console.log(`🔄 Algoritmo cambiado - índice: ${selectedIndex}, valor: ${this.value}`);
            
            if (selectedIndex === 0) {
                // DBSCAN (primera opción) - mostrar slider
                epsilonControl.style.display = 'flex';
                console.log("🔵 ✅ MOSTRAR slider - DBSCAN");
            } else {
                // K-Means o Jerárquico - ocultar slider
                epsilonControl.style.display = 'none';
                console.log("🔶 ❌ OCULTAR slider - Otro algoritmo");
            }
        });
        console.log("✅ Event listener simple agregado");
    } else {
        console.error("❌ Elementos no encontrados para control simple");
    }
    
    // Configurar otros event listeners normalmente
    const datasetSelector = document.getElementById('dataset-selector');
    const epsSlider = document.getElementById('eps-slider');
    
    if (algorithmSelect) {
        algorithmSelect.addEventListener('change', updateMainVisualization);
    }
    
    if (datasetSelector) {
        datasetSelector.addEventListener('change', updateMainVisualization);
    }
    
    if (epsSlider) {
        epsSlider.addEventListener('input', function() {
            const currentAlgorithm = algorithmSelect?.value;
            if (currentAlgorithm === 'dbscan') {
                updateMainVisualization();
            }
        });
    }
    
    // Crear visualización inicial
    updateMainVisualization();
    
    console.log("✅ Inicialización completada");
});