import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequestById, getStatusHistory } from '../api/requests';
import { getComments, addComment } from '../api/comments';
import type { Request, Comment, StatusHistoryEntry } from '../types';
import Navbar from '../components/Navbar';
import PriorityBadge from '../components/PriorityBadge';
import { useAuth } from '../context/AuthContext';

// ── Styles ────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100 text-green-700',
};

const statusDot: Record<string, string> = {
  OPEN:        'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  RESOLVED:    'bg-green-500',
};

const roleBadge: Record<string, string> = {
  ADMIN:      'bg-red-100 text-red-700',
  MANAGER:    'bg-purple-100 text-purple-700',
  TECHNICIAN: 'bg-teal-100 text-teal-700',
  ASSOCIATE:  'bg-blue-100 text-blue-700',
};

// ── Timeline helpers ──────────────────────────────────────────
type TimelineItem =
  | { kind: 'status';  ts: string; data: StatusHistoryEntry }
  | { kind: 'comment'; ts: string; data: Comment };

const buildTimeline = (
  history: StatusHistoryEntry[],
  comments: Comment[],
): TimelineItem[] =>
  [
    ...history.map(e => ({ kind: 'status'  as const, ts: e.changedAt, data: e })),
    ...comments.map(c => ({ kind: 'comment' as const, ts: c.createdAt, data: c })),
  ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

// ── Component ─────────────────────────────────────────────────
const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [request, setRequest]   = useState<Request | null>(null);
  const [history, setHistory]   = useState<StatusHistoryEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [req, hist, cmts] = await Promise.all([
          getRequestById(id),
          getStatusHistory(id),
          getComments(id),
        ]);
        setRequest(req);
        setHistory(hist);
        setComments(cmts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
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
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
        ))}
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

  const timeline = buildTimeline(history, comments);

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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  REQ-{request.requestNumber}
                </span>
              </div>
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
            <div><span className="font-medium text-gray-700">Team:</span> {request.teamName ?? '—'}</div>
            <div><span className="font-medium text-gray-700">Category:</span> {request.category}</div>
            <div><span className="font-medium text-gray-700">Created:</span> {formatDate(request.createdAt)}</div>
            <div><span className="font-medium text-gray-700">Updated:</span> {formatDate(request.updatedAt)}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Activity Timeline
              <span className="ml-2 text-xs font-normal text-gray-400">
                {timeline.length} {timeline.length === 1 ? 'event' : 'events'}
              </span>
            </h2>
          </div>

          {timeline.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No activity yet.
            </div>
          ) : (
            <ul className="px-6 py-4 space-y-0">
              {timeline.map((item, idx) => (
                <li key={item.kind === 'status' ? item.data.id : item.data.id} className="relative flex gap-4">

                  {/* Vertical connector line */}
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                  )}

                  {/* Dot */}
                  <div className="flex-shrink-0 mt-1">
                    {item.kind === 'status' ? (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusDot[item.data.newStatus] ?? 'bg-gray-400'}`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    {item.kind === 'status' ? (
                      <div>
                        <p className="text-sm text-gray-900">
                          {item.data.oldStatus === null ? (
                            <>Request created as <span className="font-medium">{item.data.newStatus}</span></>
                          ) : (
                            <><span className="font-medium">{item.data.oldStatus.replace('_', ' ')}</span> → <span className="font-medium">{item.data.newStatus.replace('_', ' ')}</span></>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(item.data.changedAt)} · {item.data.changedByName}
                          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${roleBadge[item.data.changedByRole] ?? 'bg-gray-100 text-gray-600'}`}>
                            {item.data.changedByRole}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{item.data.userName}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadge[item.data.userRole] ?? 'bg-gray-100 text-gray-600'}`}>
                            {item.data.userRole}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">{formatDate(item.data.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{item.data.body}</p>
                      </div>
                    )}
                  </div>

                </li>
              ))}
            </ul>
          )}

          {/* Add comment form */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
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
