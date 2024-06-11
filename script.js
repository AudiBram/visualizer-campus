// Inisialisasi map
var map = L.map('map').setView([-8.173886, 113.716939], 18);

// Add OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add Satellite Imagery from Google Maps
L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

// Function untuk load data dari JSON file
function loadNodeData(callback) {
    fetch('nodes.json')
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Error loading node data:', error));
}

// Function untuk menampilkan foto dan deskripsi pada node tujuan
function displayNodePhoto(node) {
    if (node.photo) {
        var content = '<div><img src="' + node.photo + '" width="200" height="150"></div>';
        if (node.description) {
            content += '<div>' + node.description + '</div>';
        }

        var photoPopup = L.popup({maxWidth: 300})
            .setLatLng([node.latitude, node.longitude])
            .setContent(content)
            .openOn(map);
    }
}

// Function untuk mencari rute terpendek menggunakan Algoritma Dijkstra
function findShortestPath(startNode, endNode, nodesData) {
    var distances = {}; // Menyimpan jarak terpendek
    var previous = {};  // Menyimpan code sebelumnya dari 'startNode'
    var visited = {};   // Menyimpan status 'visited' setiap node

    /**
     * Inisialisasi Jarak
     *
     * Semua jarak dari 'startNode' ke node lain akan diatur menjadi tak hingga (Infinity)
     * kecuali jarak dari 'startNode' ke dirinya sendiri, akan diatur menjadi 0.
     */
    nodesData.forEach(node => {
        distances[node.node_id] = Infinity;
        previous[node.node_id] = null;
        visited[node.node_id] = false;
    });

    distances[startNode.node_id] = 0;

    // Dijkstra's algorithm
    while (true) { // looping tak hingga sampai semua node dikunjungi
        let minDistance = Infinity;
        let minNodeId = null;

        // Cari node yang belum di kunjungi dengan jarak terpendek
        for (let nodeId in distances) {
            if (!visited[nodeId] && distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                minNodeId = nodeId;
            }
        }

        if (minNodeId === null) break; // Jika semua node sudah dikunjungi maka stop iterasi

        // Tandai current node sebagai visited (telah dikunjungi)
        visited[minNodeId] = true;

        /**
         * Update Jarak
         *
         * algoritma akan memperbaharui jarak terpendek ke setiap node lain yang belum dikunjungi.
         *
         * jika jarak baru yang dihitung lebih pendek dari jarak sebelumnya, maka jarak tersebut diupdate
         * dan node sebelumnya dalam perhitungan terpendek diupdate menjadi current node
         */
        let currentNode = nodesData.find(node => node.node_id === parseInt(minNodeId));
        currentNode.neighbors.forEach(neighbor => {
            let neighborNode = nodesData.find(node => node.node_id === neighbor.node_id);
            let distanceToNeighbor = neighbor.distance;
            let totalDistance = distances[minNodeId] + distanceToNeighbor;
            if (totalDistance < distances[neighborNode.node_id]) {
                distances[neighborNode.node_id] = totalDistance;
                previous[neighborNode.node_id] = currentNode;
            }
        });
    }

    /**
     * Buat Jalur Terpendek
     *
     * Setelah semua node dikunjungi, algoritma akan membuat jalur terpendek dari 'endNode' ke 'startNode'
     * dengan mengikuti node-node sebelumnya yang telah disimpan dalam variable 'previous'
     *
     */
    let shortestPath = [];
    let currentNode = endNode;
    let totalDistance = 0; // Variable untuk menyimpan total yang telah dilalui
    while (currentNode !== null) {
        shortestPath.unshift(currentNode);
        if (previous[currentNode.node_id]) {
            // Hitung jarak antara current node dan previous node
            let prevNode = previous[currentNode.node_id];
            let edge = currentNode.neighbors.find(neighbor => neighbor.node_id === prevNode.node_id);
            totalDistance += edge.distance;
        }

        // Cek apakah current node adalah node tujuan
        if (currentNode.node_id === endNode.node_id) {
            displayNodePhoto(currentNode); // Display foto untuk node tujuan
        }

        currentNode = previous[currentNode.node_id];
    }

    // Tampilkan message box dengan total jarak yang telah dilalui
    if (totalDistance > 0) {
        document.getElementById('distanceTraveled').innerText = 'Total jarak perjalanan: ' + totalDistance.toFixed(2) + ' meter.';
    }

    return shortestPath;
}

loadNodeData(function (nodesData) {
    // Populate select elements with options
    var startSelect = document.getElementById('startNode');
    var endSelect = document.getElementById('endNode');
    nodesData.forEach(function (node) {
        var option = document.createElement('option');
        option.value = node.node_name;
        option.textContent = node.node_name;
        startSelect.appendChild(option.cloneNode(true));
        endSelect.appendChild(option.cloneNode(true));
    });

    document.getElementById('shortestPathForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var startNodeName = document.getElementById('startNode').value;
        var endNodeName = document.getElementById('endNode').value;
        var startNode = nodesData.find(node => node.node_name === startNodeName);
        var endNode = nodesData.find(node => node.node_name === endNodeName);
        if (startNode && endNode) {
            var shortestPath = findShortestPath(startNode, endNode, nodesData);
            if (shortestPath.length > 0) {
                var pathCoordinates = shortestPath.map(node => [node.latitude, node.longitude]);
                var pathLine = L.polyline(pathCoordinates, {color: 'green'}).addTo(map);

                // Highlight node di perhitungan terpendek
                shortestPath.forEach(function (node) {
                    L.circleMarker([node.latitude, node.longitude], {color: 'red', radius: 6}).addTo(map)
                        .bindPopup("<b>" + node.node_name + "</b><br>" + node.description);
                });

                // Highlight edges di perhitungan terpendek
                for (var i = 0; i < shortestPath.length - 1; i++) {
                    var currentNode = shortestPath[i];
                    var nextNode = shortestPath[i + 1];
                    var edgeCoordinates = [[currentNode.latitude, currentNode.longitude], [nextNode.latitude, nextNode.longitude]];
                    var edgeLine = L.polyline(edgeCoordinates, {color: 'green'}).addTo(map);
                }

                // Menampilkan jarak yang ditempuh antara node yang berurutan
                displayDistanceTraveled(shortestPath, nodesData);
            } else {
                alert('Tidak ada path ditemukan.');
            }
        } else {
            alert('Case Sensitive! Perhatikan huruf besar kecil.');
        }
    });

    document.getElementById('restartVisualization').addEventListener('click', function () {
        clearMap();
    });
});

function clearMap() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    document.getElementById('distanceTraveled').innerText = '';

    // Reset dropdowns to their initial state
    document.getElementById('startNode').selectedIndex = 0;
    document.getElementById('endNode').selectedIndex = 0;
}
