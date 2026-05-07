import type { Request, RequestStatus, UserSummary } from '../types';
import PriorityBadge from './PriorityBadge';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Props {
  request: Request;
  users: UserSummary[];
  onStatusChange: (id: string, status: RequestStatus) => void;
  onAssign: (id: string, userId: string | null) => void;
}

const statusStyles: Record<RequestStatus, string> = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100 text-green-700',
};

const RequestRow = ({ request, users, onStatusChange, onAssign }: Props) => {
  const { user } = useAuth();
  const role = user?.role;

  const isManagerOrAdmin  = role === 'MANAGER' || role === 'ADMIN';
  const isTechnician      = role === 'TECHNICIAN';
  const isAssignedToMe    = request.assignedToId === user?.userId;
  const isUnassigned      = !request.assignedToId;

  // ── Manager/Admin dropdown: team members + current assignee even if moved ──
  const teamMembers = request.teamId
    ? users.filter(u => u.teamId === request.teamId)
    : users;
  const currentAssignee   = request.assignedToId
    ? users.find(u => u.id === request.assignedToId) ?? null
    : null;
  const assigneeOutsideTeam =
    currentAssignee !== null &&
    request.teamId !== null &&
    currentAssignee.teamId !== request.teamId;
  const assignableUsers = assigneeOutsideTeam && currentAssignee
    ? [currentAssignee, ...teamMembers]
    : teamMembers;

  const date = new Date(request.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

      {/* Title + REQ-id + description */}
      <td className="py-3 px-4">
        <Link
          to={`/requests/${request.id}`}
          className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors"
        >
          {request.title}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">
          REQ-{request.requestNumber}
          {request.description && <span className="text-gray-500"> · {request.description}</span>}
        </p>
      </td>

      {/* Category */}
      <td className="py-3 px-4 text-xs text-gray-600">{request.category}</td>

      {/* Priority */}
      <td className="py-3 px-4">
        <PriorityBadge priority={request.priority} />
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[request.status]}`}>
          {request.status.replace('_', ' ')}
        </span>
      </td>

      {/* Created by */}
      <td className="py-3 px-4 text-xs text-gray-600">{request.createdByName}</td>

      {/* Assigned to */}
      <td className="py-3 px-4 text-xs text-gray-600">
        {request.assignedToName
          ? <span>{request.assignedToName}{isAssignedToMe && isTechnician && <span className="ml-1 text-teal-600 font-medium">(you)</span>}</span>
          : <span className="text-gray-400 italic">Unassigned</span>
        }
        {request.teamName && (
          <p className="text-gray-400 mt-0.5">{request.teamName}</p>
        )}
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-xs text-gray-500">{date}</td>

      {/* Actions */}
      <td className="py-3 px-4">

        {/* MANAGER / ADMIN — full control */}
        {isManagerOrAdmin && (
          <div className="flex flex-col gap-1.5">
            <select
              value={request.status}
              onChange={e => onStatusChange(request.id, e.target.value as RequestStatus)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={request.assignedToId ?? ''}
              onChange={e => onAssign(request.id, e.target.value || null)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName}{u.teamId !== request.teamId && request.teamId ? ' (outside team)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* TECHNICIAN — self-assign or update status */}
        {isTechnician && (
          <div className="flex flex-col gap-1.5">
            {/* Unassigned + not the creator → offer to pick up */}
            {isUnassigned && request.createdById !== user?.userId && (
              <button
                onClick={() => onAssign(request.id, user!.userId)}
                className="text-xs px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                Pick up
              </button>
            )}

            {/* Assigned to me → can update status */}
            {isAssignedToMe && (
              <select
                value={request.status}
                onChange={e => onStatusChange(request.id, e.target.value as RequestStatus)}
                className="text-xs border border-teal-300 rounded-md px-2 py-1 bg-white text-gray-700 cursor-pointer hover:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            )}

            {/* Assigned to someone else → read-only */}
            {!isUnassigned && !isAssignedToMe && (
              <span className="text-xs text-gray-400 italic">Assigned</span>
            )}
          </div>
        )}

        {/* ASSOCIATE — no actions */}
        {role === 'ASSOCIATE' && (
          <span className="text-xs text-gray-400 italic">View only</span>
        )}

      </td>
    </tr>
  );
};

export default RequestRow;
