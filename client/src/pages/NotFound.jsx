import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-indigo-600 mb-4">404</p>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h1>
      <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  );
}
