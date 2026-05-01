import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequestById } from '../api/requests';
import { getComments, addComment } from '../api/comments';
import type { Request, Comment } from '../types';
import Navbar from '../components/Navbar';
import PriorityBadge from '../components/PriorityBadge';
import { useAuth } from '../context/AuthContext';

const statusStyles: Record<string, string> = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100 text-green-700',
};

const roleBadge: Record<string, string> = {
  ADMIN:     'bg-red-100 text-red-700',
  MANAGER:   'bg-purple-100 text-purple-700',
  ASSOCIATE: 'bg-blue-100 text-blue-700',
};

const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [request, setRequest]   = useState<Request | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [req, cmts] = await Promise.all([
          getRequestById(id),
          getComments(id),
        ]);
        setRequest(req);
        setComments(cmts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !id) return;
    setSubmitting(true);
    setError('');
    try {
      const newComment = await addComment(id, body.trim());
      setComments(prev => [...prev, newComment]);
      setBody('');
    } catch {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8 text-center text-gray-500">
        Request not found. <Link to="/requests" className="text-blue-600 hover:underline">Go back</Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Back link */}
        <Link to="/requests" className="text-sm text-blue-600 hover:underline">
          ← Back to requests
        </Link>

        {/* Request card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
              {request.description && (
                <p className="text-gray-600 text-sm mt-2">{request.description}</p>
              )}
            </div>
            <PriorityBadge priority={request.priority} />
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[request.status]}`}>
              {request.status.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {request.category}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div><span className="font-medium text-gray-700">Created by:</span> {request.createdByName}</div>
            <div><span className="font-medium text-gray-700">Assigned to:</span> {request.assignedToName ?? 'Unassigned'}</div>
            <div><span className="font-medium text-gray-700">Created:</span> {formatDate(request.createdAt)}</div>
            <div><span className="font-medium text-gray-700">Updated:</span> {formatDate(request.updatedAt)}</div>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Activity Log
              <span className="ml-2 text-xs font-normal text-gray-400">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </h2>
          </div>

          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No comments yet. Be the first to add a note.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {comments.map(c => (
                <li key={c.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{c.userName}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadge[c.userRole] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.userRole}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.body}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Add comment form */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            {error && (
              <p className="text-xs text-red-600 mb-2">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={`Add a comment as ${user?.fullName}...`}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
};

export default RequestDetailPage;