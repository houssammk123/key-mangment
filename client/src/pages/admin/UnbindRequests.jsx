import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const statusColors = {
  PENDING: 'bg-yellow-600 text-white',
  APPROVED: 'bg-gold-600 text-white',
  REJECTED: 'bg-red-600 text-white',
};

const UnbindRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await API.get('/unbind-requests', { params: { status: filter || undefined } });
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      await API.put(`/unbind-requests/${id}/approve`);
      toast.success('Request approved');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/unbind-requests/${id}/reject`);
      toast.success('Request rejected');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Unbind Requests</h2>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left p-4">Key</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Reason</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No unbind requests</td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4 font-mono text-sm text-gold-400">{req.keyCode}</td>
                    <td className="p-4 text-sm text-gray-300">{req.email}</td>
                    <td className="p-4 text-sm text-gray-300">{req.reason || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{new Date(req.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req._id)}
                            className="p-2 text-gold-400 hover:bg-gray-700 rounded-lg transition"
                            title="Approve"
                          >
                            <HiOutlineCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition"
                            title="Reject"
                          >
                            <HiOutlineX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-700/50">
          {requests.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No unbind requests</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gold-400">{req.keyCode}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{req.email}</p>
                {req.reason && (
                  <p className="text-sm text-gray-400 italic">"{req.reason}"</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</span>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-gold-400 border border-gold-600/50 hover:bg-gold-600/20 rounded-lg transition"
                      >
                        <HiOutlineCheck className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 border border-red-600/50 hover:bg-red-600/20 rounded-lg transition"
                      >
                        <HiOutlineX className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UnbindRequests;
