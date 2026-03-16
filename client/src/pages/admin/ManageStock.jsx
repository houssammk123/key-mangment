import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArchive, HiOutlineKey, HiOutlineBadgeCheck, HiOutlineRefresh, HiOutlineLink, HiOutlineTrash, HiOutlineLockOpen } from 'react-icons/hi';

const ManageStock = () => {
  const [stock, setStock] = useState(null);
  const [linksText, setLinksText] = useState('');
  const [addingLinks, setAddingLinks] = useState(false);
  const [inviteLinks, setInviteLinks] = useState([]);
  const [showLinks, setShowLinks] = useState(false);

  const fetchStock = async () => {
    try {
      const res = await API.get('/stock');
      setStock(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await API.get('/stock/invite-links');
      setInviteLinks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStock();
    fetchLinks();
  }, []);

  const handleAddLinks = async (e) => {
    e.preventDefault();
    if (!linksText.trim()) return;
    setAddingLinks(true);
    try {
      const res = await API.post('/stock/invite-links', { links: linksText });
      toast.success(res.data.message);
      setLinksText('');
      fetchStock();
      fetchLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add links');
    } finally {
      setAddingLinks(false);
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await API.delete(`/stock/invite-links/${id}`);
      toast.success('Link deleted');
      fetchStock();
      fetchLinks();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleUnbindLink = async (id) => {
    try {
      await API.patch(`/stock/invite-links/${id}/unbind`);
      toast.success('Link unbound — now available again');
      fetchStock();
      fetchLinks();
    } catch (err) {
      toast.error('Failed to unbind');
    }
  };

  if (!stock) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Manage Stock</h2>
        <button
          onClick={() => { fetchStock(); fetchLinks(); }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
              <HiOutlineArchive className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm">Total Keys</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stock.total}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-gold-600 rounded-lg">
              <HiOutlineKey className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm">Available</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stock.available}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-purple-600 rounded-lg">
              <HiOutlineLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm">Free Links</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stock.availableLinks}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-yellow-600 rounded-lg">
              <HiOutlineBadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm">Assigned</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stock.assignedLinks}</p>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Stock Usage</h3>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
          <div
            className="bg-gold-500 h-4 rounded-full transition-all"
            style={{ width: `${stock.usagePercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">{stock.usagePercent}% of keys are in use</p>
      </div>

      {/* Add Spotify Invite Links */}
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Add Spotify Invite Links</h3>
        <p className="text-sm text-gray-400 mb-4">
          Paste your Spotify Family invite links below (one per line). When a client redeems a key, they will automatically receive an invite link.
        </p>
        <form onSubmit={handleAddLinks} className="space-y-4">
          <textarea
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            placeholder={"https://www.spotify.com/family/join/invite/xxxx\nhttps://www.spotify.com/family/join/invite/yyyy"}
            rows={4}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 placeholder-gray-500 font-mono"
          />
          <button
            type="submit"
            disabled={addingLinks || !linksText.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {addingLinks ? 'Adding...' : 'Add Invite Links'}
          </button>
        </form>
      </div>

      {/* Invite Links Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Invite Links ({stock.totalLinks})
          </h3>
          <button
            onClick={() => setShowLinks(!showLinks)}
            className="px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
          >
            {showLinks ? 'Hide' : 'Show'}
          </button>
        </div>
        {showLinks && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-gray-700">
                    <th className="text-left p-4">Link</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Assigned To</th>
                    <th className="text-left p-4">Key</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteLinks.map((link) => (
                    <tr key={link._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="p-4 text-sm text-blue-400 font-mono max-w-xs truncate">{link.link}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          link.assigned ? 'bg-gold-600 text-white' : 'bg-gray-600 text-gray-200'
                        }`}>
                          {link.assigned ? 'ASSIGNED' : 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{link.assignedTo || '-'}</td>
                      <td className="p-4 text-sm text-gray-300 font-mono">{link.keyCode || '-'}</td>
                      <td className="p-4 flex items-center gap-2">
                        {link.assigned ? (
                          <button
                            onClick={() => handleUnbindLink(link._id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-yellow-400 border border-yellow-600 hover:bg-yellow-600/20 rounded-lg transition"
                          >
                            <HiOutlineLockOpen className="w-4 h-4" />
                            Unbind
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteLink(link._id)}
                            className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {inviteLinks.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">No invite links added yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-700/50">
              {inviteLinks.map((link) => (
                <div key={link._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-blue-400 font-mono break-all flex-1">{link.link}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      link.assigned ? 'bg-gold-600 text-white' : 'bg-gray-600 text-gray-200'
                    }`}>
                      {link.assigned ? 'ASSIGNED' : 'AVAILABLE'}
                    </span>
                  </div>
                  {link.assigned && (
                    <div className="text-sm text-gray-400">
                      {link.assignedTo && <span>{link.assignedTo}</span>}
                      {link.keyCode && <span className="ml-2 font-mono text-gray-500">{link.keyCode}</span>}
                    </div>
                  )}
                  <div className="pt-1">
                    {link.assigned ? (
                      <button
                        onClick={() => handleUnbindLink(link._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-yellow-400 border border-yellow-600 hover:bg-yellow-600/20 rounded-lg transition"
                      >
                        <HiOutlineLockOpen className="w-4 h-4" />
                        Unbind
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteLink(link._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 border border-red-600/50 hover:bg-red-600/20 rounded-lg transition"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {inviteLinks.length === 0 && (
                <p className="p-8 text-center text-gray-500">No invite links added yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageStock;
