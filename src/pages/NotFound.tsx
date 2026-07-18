import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/yobest-hub/') {
      console.error("404: route not found:", location.pathname)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
        <p className="text-xl text-text-secondary mb-6">Oops! Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-accent-blue/25">
          <Home size={18} />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
