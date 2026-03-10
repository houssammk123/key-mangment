import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const GenerateKeys = () => {
  const [quantity, setQuantity] = useState(10);
  const [reusable, setReusable] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/keys/generate', {
        quantity,
        reusable,
        expiresAt: expiresAt || null,
      });
      setGeneratedKeys(res.data.keys);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    const text = generatedKeys.map((k) => k.keyCode).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All keys copied to clipboard');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Generate Keys</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">New Key Batch</h3>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reusable</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setReusable(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    !reusable ? 'bg-gold-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setReusable(true)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    reusable ? 'bg-gold-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : `Generate ${quantity} Keys`}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Generated Keys</h3>
            {generatedKeys.length > 0 && (
              <button
                onClick={copyAll}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition"
              >
                Copy All
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {generatedKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Generated keys will appear here</p>
            ) : (
              generatedKeys.map((key) => (
                <div
                  key={key._id}
                  className="flex items-center justify-between px-4 py-2 bg-gray-700/50 rounded-lg"
                >
                  <span className="text-gold-400 font-mono text-sm">{key.keyCode}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(key.keyCode);
                      toast.success('Copied');
                    }}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Copy
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateKeys;
