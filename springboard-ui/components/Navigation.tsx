export default function Navigation() {
  return (
    <nav className="border-b border-gray-800 bg-[#161616]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">SpringBoard</span>
            <span className="text-2xl">⚡</span>
          </a>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="/demo" className="text-gray-300 hover:text-white transition-colors">
              Demo
            </a>
            <a href="/reports" className="text-gray-300 hover:text-white transition-colors">
              Reports
            </a>
            <a href="/team" className="text-gray-300 hover:text-white transition-colors">
              Team
            </a>
            <div className="hidden md:flex items-center space-x-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-primary">Powered by IBM Bob</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Made with Bob
