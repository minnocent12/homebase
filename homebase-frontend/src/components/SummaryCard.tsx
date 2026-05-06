import type { ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  label: string;
  count: number;
  color: 'blue' | 'yellow' | 'green' | 'gray';
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  to?: string;
}

const colorMap = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  green:  'bg-green-50 border-green-200 text-green-700',
  gray:   'bg-gray-50 border-gray-200 text-gray-700',
};

const countColor = {
  blue:   'text-blue-600',
  yellow: 'text-yellow-600',
  green:  'text-green-600',
  gray:   'text-gray-600',
};

const iconColor = {
  blue:   'text-blue-400',
  yellow: 'text-yellow-400',
  green:  'text-green-400',
  gray:   'text-gray-400',
};

const SummaryCard = ({ label, count, color, icon: Icon, to }: Props) => {
  const inner = (
    <div className={`rounded-xl border p-5 flex flex-col gap-1 ${colorMap[color]} ${to ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${iconColor[color]}`} />}
      </div>
      <span className={`text-4xl font-bold ${countColor[color]}`}>{count}</span>
    </div>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
};

export default SummaryCard;
