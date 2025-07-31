import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

const BackButton = ({ children, className = '', ...props }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate(-1); // This is the key part - it goes back in history
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleClick}
      className={`flex items-center space-x-1 ${className}`}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || <span></span>}
    </Button>
  );
};

export default BackButton;
