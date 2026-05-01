import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRequest } from '../api/requests';
import type { RequestPriority, RequestCategory } from '../types';
import Navbar from '../components/Navbar';

const CreateRequestPage = () => {
  const navigate = useNavigate();

  const [title, setTitle]           = useState('');
  const [description, setDesc]      = useState('');
  const [priority, setPriority]     = useState<RequestPriority>('MEDIUM');
  const [category, setCategory]     = useState<RequestCategory>('OTHER');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createRequest({ title, description, priority, category });
      navigate('/requests');
    } catch {
      setError('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link to="/requests" className="text-sm text-blue-600 hover:underline">
            ← Back to requests
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">New Request</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit a new operational request to the Store Support Center.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={200}
                placeholder="e.g. Printer offline in aisle 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Priority + Category row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as RequestPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as RequestCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="FACILITIES">Facilities</option>
                  <option value="SUPPLY">Supply</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <Link
                to="/requests"
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-sm text-center transition-colors"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateRequestPage;