import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineKey, HiOutlineBadgeCheck, HiOutlineArchive, HiOutlineCollection } from 'react-icons/hi';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const actionLabels = {
  KEY_REDEEMED: { label: 'Key Redeemed', color: 'text-gold-400' },
  KEYS_GENERATED: { label: 'Keys Generated', color: 'text-blue-400' },
  UNBIND_REQUESTED: { label: 'Unbind Requested', color: 'text-yellow-400' },
  UNBIND_APPROVED: { label: 'Unbind Approved', color: 'text-gold-400' },
  UNBIND_REJECTED: { label: 'Unbind Rejected', color: 'text-red-400' },
  KEY_DELETED: { label: 'Key Deleted', color: 'text-red-400' },
  KEY_UNBOUND: { label: 'Key Unbound', color: 'text-orange-400' },
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalKeys: 0, activeKeys: 0, stockAvailable: 0, unusedKeys: 0 });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/dashboard/activity'),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Keys" value={stats.totalKeys} icon={HiOutlineCollection} color="bg-blue-600" />
        <StatCard title="Active Keys" value={stats.activeKeys} icon={HiOutlineBadgeCheck} color="bg-gold-600" />
        <StatCard title="Stock Available" value={stats.stockAvailable} icon={HiOutlineArchive} color="bg-purple-600" />
        <StatCard title="Unused Keys" value={stats.unusedKeys} icon={HiOutlineKey} color="bg-yellow-600" />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left p-4">Action</th>
                <th className="text-left p-4">Key</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((log) => {
                const info = actionLabels[log.action] || { label: log.action, color: 'text-gray-400' };
                return (
                  <tr key={log._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className={`p-4 text-sm font-medium ${info.color}`}>{info.label}</td>
                    <td className="p-4 text-sm text-gray-300 font-mono">{log.keyCode || log.details || '-'}</td>
                    <td className="p-4 text-sm text-gray-300">{log.email || '-'}</td>
                    <td className="p-4 text-sm text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                );
              })}
              {activity.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No activity yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-700/50">
          {activity.map((log) => {
            const info = actionLabels[log.action] || { label: log.action, color: 'text-gray-400' };
            return (
              <div key={log._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
                  <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-300 font-mono truncate">{log.keyCode || log.details || '-'}</p>
                {log.email && <p className="text-sm text-gray-400">{log.email}</p>}
              </div>
            );
          })}
          {activity.length === 0 && (
            <p className="p-8 text-center text-gray-500">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
