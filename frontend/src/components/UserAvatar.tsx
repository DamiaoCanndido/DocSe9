interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

export default function UserAvatar({ name, size = 'md' }: AvatarProps) {
  const sz = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <div
      className={`${sz} rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center shrink-0`}
    >
      {name[0]}
    </div>
  );
}
