import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const RedeemPage = () => {
  const [keyCode, setKeyCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await API.post('/redeem', {
        keyCode: keyCode.trim(),
        email: email.trim(),
        password: password || undefined,
      });
      toast.success(res.data.message);
      setInviteLink(res.data.inviteLink || null);
      setSuccess(true);
      setKeyCode('');
      setEmail('');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-2">Spotify Gold</h1>
          <p className="text-xl text-gray-400">Premium Upgrade</p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upgrade Successful!</h3>
              {inviteLink ? (
                <>
                  <p className="text-gray-400 mb-6">Click the button below to accept your Spotify Family invitation and activate your premium upgrade.</p>
                  <a
                    href={inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition text-lg text-center"
                  >
                    Accept Spotify Invitation
                  </a>
                </>
              ) : (
                <p className="text-gray-400">Your upgrade is being processed. You will receive an invitation shortly.</p>
              )}
              <button
                onClick={() => { setSuccess(false); setInviteLink(null); }}
                className="mt-6 px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
              >
                Redeem Another Key
              </button>
            </div>
          ) : (
            <form onSubmit={handleRedeem} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upgrade Key</label>
                <input
                  type="text"
                  value={keyCode}
                  onChange={(e) => setKeyCode(e.target.value)}
                  placeholder="SpotifyHub-XXXX-XXXX"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 text-lg"
              >
                {loading ? 'Processing...' : 'Upgrade Now'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm mb-3">Don't have a key?</p>
            <button className="px-6 py-2 border border-green-600 text-green-400 rounded-lg hover:bg-green-600 hover:text-white transition text-sm font-medium">
              Purchase Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;
