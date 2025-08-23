const SecondaryButton = ({ children, ...props }) => (
  <button
    className={`
      bg-secondary hover:bg-brand-orange-light
      text-white font-medium
      px-6 py-2.5 rounded-lg
      transition-colors duration-200
      shadow-soft-orange
    `}
    {...props}
  >
    {children}
  </button>
);

export default SecondaryButton;