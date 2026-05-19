import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useNavigationStore from '../store/navigationStore.js';

export default function useNavigationHistory() {
  const location = useLocation();
  const push = useNavigationStore(s => s.push);

  useEffect(() => {
    push(location.pathname + location.search);
  }, [location.pathname, location.search, push]);
}
