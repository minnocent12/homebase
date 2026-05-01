interface Props {
  label: string;
  count: number;
  color: 'blue' | 'yellow' | 'green' | 'gray';
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

const SummaryCard = ({ label, count, color }: Props) => (
  <div className={`rounded-xl border p-5 flex flex-col gap-1 ${colorMap[color]}`}>
    <span className="text-sm font-medium">{label}</span>
    <span className={`text-4xl font-bold ${countColor[color]}`}>{count}</span>
  </div>
);

export default SummaryCard;