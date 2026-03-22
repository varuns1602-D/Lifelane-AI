/**
 * LifeLane AI - Smart Routing Engine
 * Handles traffic simulation, pathfinding weights, and auto-rerouting logic.
 */

class SmartRoutingEngine {
    constructor() {
        this.roadSegments = [
            { id: "R101", name: "MG Road", trafficLevel: "low", weight: 1, coordinates: [[77.5946, 12.9716], [77.6000, 12.9700]] },
            { id: "R102", name: "Richmond Road", trafficLevel: "high", weight: 5, coordinates: [[77.6000, 12.9700], [77.6100, 12.9600]] },
            { id: "R103", name: "Hosur Road", trafficLevel: "medium", weight: 2, coordinates: [[77.6100, 12.9600], [77.6140, 12.9400]] },
            { id: "R104", name: "Residency Road", trafficLevel: "low", weight: 1, coordinates: [[77.6000, 12.9700], [77.6050, 12.9550]] },
            { id: "R105", name: "Victoria Shortcut", trafficLevel: "blocked", weight: 999, coordinates: [[77.6050, 12.9550], [77.6140, 12.9400]] }
        ];

        this.trafficLevels = {
            low: 1,
            medium: 2,
            high: 5,
            blocked: 999
        };

        this.currentRoute = [];
        this.ambulancePosition = [77.5946, 12.9716];
    }

    /**
     * Calculates the fastest path based on traffic weights.
     * Simplified for simulation purposes.
     */
    calculateFastestPath(startCoord, endCoord) {
        // In a real app, this would be a Dijkstra or A* implementation.
        // For simulation, we return fixed alternative paths based on "blocked" status.
        const isRichmondHigh = this.roadSegments.find(rs => rs.id === "R102").trafficLevel === "high";
        
        if (isRichmondHigh) {
            return [
                this.roadSegments[0], // MG Road
                this.roadSegments[3], // Residency Road (Alternative)
                { id: "Alt1", name: "BTM Connector", trafficLevel: "low", weight: 1, coordinates: [[77.6050, 12.9550], [77.6140, 12.9400]] }
            ];
        }

        return [
            this.roadSegments[0],
            this.roadSegments[1],
            this.roadSegments[2]
        ];
    }

    /**
     * Predicts congestion ahead and triggers rerouting.
     */
    checkCongestion(route, currentSegmentIdx) {
        const nextSegments = route.slice(currentSegmentIdx + 1, currentSegmentIdx + 4);
        const congestion = nextSegments.find(s => s.trafficLevel === "high" || s.trafficLevel === "blocked");
        
        if (congestion) {
            return {
                detected: true,
                reason: congestion.trafficLevel === "blocked" ? "Road Blocked" : "Heavy Traffic Detected",
                location: congestion.name
            };
        }
        return { detected: false };
    }

    /**
     * Signal clearing logic: checks if ambulance is close to a signal.
     */
    shouldClearSignal(etaToSignalSeconds) {
        return etaToSignalSeconds < 15;
    }

    /**
     * Generates AI traffic analysis for the Intelligence Panel.
     */
    getTrafficIntelligence() {
        const highTraffic = this.roadSegments.filter(s => s.trafficLevel === "high");
        return {
            overallLoad: "Medium",
            congestionPoints: highTraffic.map(s => s.name),
            suggestedRoute: "MG Road Express",
            timeSaved: "3.2 mins"
        };
    }
}

// Export for use in index.html
window.SmartRouting = new SmartRoutingEngine();
