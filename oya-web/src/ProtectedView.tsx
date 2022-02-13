import { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './AuthProvider';

const ProtectedView: FC = ({ children }) => {
  const { loaded, authorized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (loaded && !authorized && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/login', { state: { from: location } });
    }
  }, [authorized, navigate, location, isRedirecting, loaded]);

  if (isRedirecting) return <p>redirecting</p>;
  if (!loaded) return <p>loading</p>;
  if (!authorized) return <p>unauthorized</p>;
  return <>{children}</>;
};

export default ProtectedView;
