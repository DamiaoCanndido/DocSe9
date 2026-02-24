interface BadgeProps {
  active: boolean;
}

export default function UserBadge({ active }: BadgeProps) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full tracking-wide ${
        active ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
      }`}
    >
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}
