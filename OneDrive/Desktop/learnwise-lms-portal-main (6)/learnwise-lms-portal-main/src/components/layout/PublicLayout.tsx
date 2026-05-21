import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PublicLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, hideNavigation }) => {
  return (
    <div className="min-h-screen bg-lms-dark">
      {!hideNavigation && (
        <header className="bg-lms-darker border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold">
                <span className="text-lms-primary">LMS</span> Portal
              </h1>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/#courses" className="text-gray-300 hover:text-white transition-colors">Courses</Link>
              <Link to="/#trainers" className="text-gray-300 hover:text-white transition-colors">Trainers</Link>
              <Link to="/#reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link>
              <Link to="/#about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="lms-button-primary">
                Register
              </Link>
            </div>
          </div>
        </header>
      )}
      
      <main>
        {children}
      </main>
      
      {!hideNavigation && (
        <footer className="bg-lms-darker border-t border-gray-800 py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">
                  <span className="text-lms-primary">LMS</span> Portal
                </h2>
                <p className="text-gray-400 mb-4">
                  Transforming education through technology and innovation.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/#courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
                  <li><Link to="/#trainers" className="text-gray-400 hover:text-white transition-colors">Trainers</Link></li>
                  <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">About Us</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Our Story</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Team</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Contact Us</h3>
                <address className="text-gray-400 not-italic">
                  <p>Email: info@lmsportal.com</p>
                  <p>Phone: (123) 456-7890</p>
                  <div className="flex mt-4 space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">FB</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">TW</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">IG</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">LI</a>
                  </div>
                </address>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} LMS Portal. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;
