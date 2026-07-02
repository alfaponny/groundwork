type ButtonProps = {
  text: string;
  variant?: 'blue' | 'orange';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  href?: string;
};

export default function PillButton({
  text,
  variant = 'blue',
  type = 'button',
  onClick,
  disabled,
  href,

}: ButtonProps) {
  const base = 'px-4 py-2 w-32 rounded-2xl text-white text-xs cursor-pointer text-center';
  const variants = {
    blue: 'bg-primary hover:bg-accent',
    orange: 'bg-darkorange hover:bg-accent',
  };
  const className = `${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {text}
      </a>
    );
  }

    return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
