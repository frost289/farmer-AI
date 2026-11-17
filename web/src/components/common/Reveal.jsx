/** 2D entrance animation: fades and slides content up. delay is in milliseconds. */
export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  return (
    <Tag className={`animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
