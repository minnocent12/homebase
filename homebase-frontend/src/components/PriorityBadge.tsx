import type { RequestPriority } from '../types';

interface Props {
  priority: RequestPriority;
}

const styles: Record<RequestPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border border-red-300',
  HIGH:     'bg-orange-100 text-orange-700 border border-orange-300',
  MEDIUM:   'bg-yellow-100 text-yellow-700 border border-yellow-300',
  LOW:      'bg-green-100 text-green-700 border border-green-300',
};

const PriorityBadge = ({ priority }: Props) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}>
    {priority}
  </span>
);

export default PriorityBadge;