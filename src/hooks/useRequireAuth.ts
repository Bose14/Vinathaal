import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const useRequireAuth = (currentPath = '/') => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      navigate('/login');
    }
  }, [isAuthenticated, navigate, currentPath]);

  return isAuthenticated;
};
