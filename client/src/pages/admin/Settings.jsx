import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { admin } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Admin Account</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <p className="text-white">{admin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <p className="text-white">Administrator</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-500">
            To change admin credentials, update the ADMIN_EMAIL and ADMIN_PASSWORD values in the server .env file.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
