import { CryptoLabTabs } from '../components/CryptoLabTabs';

export default function CryptoLab() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-8 border border-purple-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cryptography Learning Lab</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Interactive demonstrations of cryptographic principles, from classical ciphers to modern encryption techniques.
            </p>
          </div>
        </div>

        <CryptoLabTabs />
      </div>
    </div>
  );
}
