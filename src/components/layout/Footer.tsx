export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} GolfSocial. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
