import type { Request, RequestStatus } from '../types';
import PriorityBadge from './PriorityBadge';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Props {
  request: Request;
  onStatusChange: (id: string, status: RequestStatus) => void;
}

const statusStyles: Record<RequestStatus, string> = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100 text-green-700',
};

const RequestRow = ({ request, onStatusChange }: Props) => {
  const { user } = useAuth();
  const canUpdate = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const date = new Date(request.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

      {/* Title + description — clickable */}
      <td className="py-3 px-4">
        <Link
          to={`/requests/${request.id}`}
          className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors"
        >
          {request.title}
        </Link>
        {request.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{request.description}</p>
        )}
      </td>

      {/* Category */}
      <td className="py-3 px-4 text-xs text-gray-600">{request.category}</td>

      {/* Priority badge */}
      <td className="py-3 px-4">
        <PriorityBadge priority={request.priority} />
      </td>

      {/* Status badge */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[request.status]}`}>
          {request.status.replace('_', ' ')}
        </span>
      </td>

      {/* Created by */}
      <td className="py-3 px-4 text-xs text-gray-600">{request.createdByName}</td>

      {/* Date */}
      <td className="py-3 px-4 text-xs text-gray-500">{date}</td>

      {/* Status update — MANAGER/ADMIN only */}
      <td className="py-3 px-4">
        {canUpdate ? (
          <select
            value={request.status}
            onChange={e => onStatusChange(request.id, e.target.value as RequestStatus)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        ) : (
          <span className="text-xs text-gray-400 italic">View only</span>
        )}
      </td>

    </tr>
  );
};

export default RequestRow;