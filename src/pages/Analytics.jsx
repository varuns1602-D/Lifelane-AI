import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSimulation } from '../context/useSimulation';
import AnalyticsCards from '../components/AnalyticsCards';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl shadow-2xl border border-corridorGreen/30">
        <p className="text-xs font-bold text-textPrimary/50 uppercase mb-1">{label}</p>
        <p className="text-lg font-bold text-corridorGreen">{payload[0].value} <span className="text-xs">mins saved</span></p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { analytics } = useSimulation();
  const chartData = analytics.chartData;

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-textPrimary/50 mt-1">System performance and efficiency metrics.</p>
      </div>

      <div className="-mx-4 mb-8">
        <AnalyticsCards />
      </div>

      <div className="glass-panel border-white/10 rounded-2xl p-6 flex-1 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Average Travel Time Saved</h3>
            <p className="text-sm text-textPrimary/50">Weekly comparison vs standard traffic simulation</p>
          </div>
          <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-sm font-medium">
             Current Week
          </div>
        </div>
        
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} dy={10} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey="time" 
                stroke="#22c55e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTime)" 
                activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
