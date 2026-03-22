export const mockHospitals = [
  { id: 'H1', name: 'Victoria Hospital', position: [12.9631, 77.5746], capacity: { emergencyBeds: 12, icuAvailable: 4 } },
  { id: 'H2', name: 'St. John\'s Hospital', position: [12.9298, 77.6202], capacity: { emergencyBeds: 8, icuAvailable: 2 } },
  { id: 'H3', name: 'Manipal Hospital', position: [12.9591, 77.6485], capacity: { emergencyBeds: 15, icuAvailable: 7 } },
];

export const mockSignals = [
  { id: 'S1', position: [12.9720, 77.5950], status: 'red' }, // Near MG Road
  { id: 'S2', position: [12.9690, 77.5850], status: 'red' }, // Approaching Victoria
  { id: 'S3', position: [12.9650, 77.5800], status: 'red' }, // Close to Victoria
  { id: 'S4', position: [12.9400, 77.6100], status: 'red' }, // Koramangala route
  { id: 'S5', position: [12.9600, 77.6300], status: 'red' }, // Indiranagar route
  { id: 'S102', position: [12.9500, 77.6300], status: 'red' }, // New signal for simulation
];

export const mockAmbulances = [
  {
    id: 'AMB001',
    priority: 1,
    status: 'Active',
    destination: 'Victoria Hospital',
    speed: 65,
    eta: '00:00',
    routeType: 'green',
    totalDistance: 4.8,
    hospitalDistance: 4.8,
    progress: 0,
    routeCoordinates: [
      [12.9750, 77.6000], [12.9745, 77.5990], [12.9740, 77.5980], [12.9735, 77.5975], [12.9730, 77.5970], 
      [12.9725, 77.5960], [12.9720, 77.5950], [12.9715, 77.5935], [12.9710, 77.5920], [12.9705, 77.5910], [12.9700, 77.5900],
      [12.9695, 77.5875], [12.9690, 77.5850], [12.9685, 77.5840], [12.9680, 77.5830], [12.9675, 77.5820], [12.9670, 77.5810],
      [12.9660, 77.5805], [12.9650, 77.5800], [12.9645, 77.5790], [12.9640, 77.5780], [12.9635, 77.5760], [12.9631, 77.5746]
    ],
    routeStep: 0,
    currentLocation: [12.9750, 77.6000],
  },
  {
    id: 'AMB002',
    priority: 2,
    status: 'Active',
    destination: 'St. John\'s Hospital',
    speed: 55,
    eta: '00:00',
    routeType: 'yellow',
    totalDistance: 3.5,
    hospitalDistance: 3.5,
    progress: 0,
    routeCoordinates: [
      [12.9100, 77.6000], [12.9125, 77.6025], [12.9150, 77.6050], [12.9175, 77.6075], [12.9200, 77.6100],
      [12.9225, 77.6125], [12.9250, 77.6150], [12.9275, 77.6125], [12.9300, 77.6100], [12.9325, 77.6075], [12.9350, 77.6050],
      [12.9375, 77.6075], [12.9400, 77.6100], [12.9375, 77.6125], [12.9350, 77.6150], [12.9325, 77.6175], [12.9298, 77.6202]
    ],
    routeStep: 0,
    currentLocation: [12.9100, 77.6000],
  },
  {
    id: 'AMB003',
    priority: 1,
    status: 'Active',
    destination: 'Manipal Hospital',
    speed: 50,
    eta: '00:00',
    routeType: 'green',
    totalDistance: 2.8,
    hospitalDistance: 2.8,
    progress: 0,
    routeCoordinates: [
      [12.9800, 77.6600], [12.9775, 77.6575], [12.9750, 77.6550], [12.9725, 77.6525], [12.9700, 77.6500],
      [12.9675, 77.6475], [12.9650, 77.6450], [12.9625, 77.6400], [12.9600, 77.6350], [12.9605, 77.6375], [12.9610, 77.6400],
      [12.9600, 77.6440], [12.9595, 77.6460], [12.9591, 77.6485]
    ],
    routeStep: 0,
    currentLocation: [12.9800, 77.6600],
  }
];

export const mockAlerts = [
  { id: 1, text: 'Corridor traffic optimization active', time: '11:55 PM', type: 'success' },
  { id: 2, text: 'AI Traffic rerouting enabled', time: '11:54 PM', type: 'info' },
];

export const mockAnalytics = {
  activeEmergencies: 3,
  signalsControlled: 12,
  averageTimeSaved: '9.2 mins',
  activeCorridors: 2,
  chartData: [
    { name: 'Mon', time: 15 },
    { name: 'Tue', time: 12 },
    { name: 'Wed', time: 10 },
    { name: 'Thu', time: 14 },
    { name: 'Fri', time: 9 },
    { name: 'Sat', time: 18 },
    { name: 'Sun', time: 20 },
  ],
};

export const authorizedVehicles = [
  { vehicleId: 'AMB001', driverId: 'DRV102', vehicleType: 'ambulance', status: 'verified', registration: 'KA-01-EM-1234' },
  { vehicleId: 'AMB002', driverId: 'DRV105', vehicleType: 'ambulance', status: 'verified', registration: 'KA-01-EM-5678' },
  { vehicleId: 'AMB003', driverId: 'DRV110', vehicleType: 'ambulance', status: 'verified', registration: 'KA-01-EM-9012' }
];
