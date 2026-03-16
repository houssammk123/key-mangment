import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineDownload, HiOutlineTrash, HiOutlineLockOpen, HiOutlineExternalLink } from 'react-icons/hi';

const statusColors = {
  UNUSED: 'bg-gray-600 text-gray-200',
  ACTIVE: 'bg-gold-600 text-white',
  REUSABLE: 'bg-blue-600 text-white',
};

const AllKeys = () => {
  const [keys, setKeys] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/keys', {
        params: { search, status: statusFilter, page, limit: 15 },
      });
      setKeys(res.data.keys);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load keys');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleExport = async () => {
    try {
      const res = await API.get('/keys/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'keys-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this key?')) return;
    try {
      await API.delete(`/keys/${id}`);
      toast.success('Key deleted');
      fetchKeys();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleUnbind = async (id) => {
    if (!window.confirm('Unbind this key?')) return;
    try {
      await API.put(`/keys/${id}/unbind`);
      toast.success('Key unbound');
      fetchKeys();
    } catch (err) {
      toast.error('Unbind failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">All Keys</h2>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-sm transition"
        >
          <HiOutlineDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by key or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="ALL">All Status</option>
            <option value="UNUSED">Unused</option>
            <option value="ACTIVE">Active</option>
            <option value="REUSABLE">Reusable</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="text-left p-4">Key</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Bound Email</th>
                <th className="text-left p-4">Invite Link</th>
                <th className="text-left p-4">Created</th>
                <th className="text-left p-4">Redeemed</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No keys found</td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-4 font-mono text-sm text-gold-400">{key.keyCode}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[key.status]}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{key.boundEmail || '-'}</td>
                    <td className="p-4 text-sm">
                      {key.inviteLink ? (
                        <a
                          href={key.inviteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                          title={key.inviteLink}
                        >
                          <HiOutlineExternalLink className="w-4 h-4" />
                          <span className="max-w-[120px] truncate">{key.inviteLink.split('/').pop()}</span>
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-400">{new Date(key.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-gray-400">
                      {key.redeemedAt ? new Date(key.redeemedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {key.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUnbind(key._id)}
                            className="p-2 text-yellow-400 hover:bg-gray-700 rounded-lg transition"
                            title="Unbind"
                          >
                            <HiOutlineLockOpen className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(key._id)}
                          className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-700/50">
          {loading ? (
            <p className="p-8 text-center text-gray-500">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No keys found</p>
          ) : (
            keys.map((key) => (
              <div key={key._id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gold-400">{key.keyCode}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[key.status]}`}>
                    {key.status}
                  </span>
                </div>
                {key.boundEmail && (
                  <p className="text-sm text-gray-300">{key.boundEmail}</p>
                )}
                {key.inviteLink && (
                  <a
                    href={key.inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 text-sm"
                  >
                    <HiOutlineExternalLink className="w-3 h-3" />
                    <span className="truncate">{key.inviteLink.split('/').pop()}</span>
                  </a>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(key.createdAt).toLocaleDateString()}
                    {key.redeemedAt && ` · Redeemed ${new Date(key.redeemedAt).toLocaleDateString()}`}
                  </span>
                  <div className="flex gap-2">
                    {key.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleUnbind(key._id)}
                        className="p-1.5 text-yellow-400 hover:bg-gray-700 rounded-lg transition"
                      >
                        <HiOutlineLockOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(key._id)}
                      className="p-1.5 text-red-400 hover:bg-gray-700 rounded-lg transition"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {pages > 1 && (
          <div className="p-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              Showing {keys.length} of {total} keys
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-400 text-sm">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllKeys;
