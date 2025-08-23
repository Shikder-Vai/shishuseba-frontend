const BrandAlert = ({ variant = 'info', children }) => {
  const variants = {
    info: 'bg-info text-brand-teal-500',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white'
  };
  
  return (
    <div className={`${variants[variant]} p-4 rounded-lg`}>
      {children}
    </div>
  );
};

export default BrandAlert;