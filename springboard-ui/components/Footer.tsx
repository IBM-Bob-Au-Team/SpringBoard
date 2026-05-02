export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#161616] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-white">SpringBoard</span>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Demonstrating IBM Bob IDE's capability to modernize legacy Spring Boot applications 
              with automated refactoring, testing, and deployment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/demo" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Demo
                </a>
              </li>
              <li>
                <a href="/report" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Report
                </a>
              </li>
              <li>
                <a href="/team" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Team
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.ibm.com/products/watsonx-code-assistant" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  IBM Bob IDE
                </a>
              </li>
              <li>
                <a 
                  href="https://spring.io/projects/spring-boot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  Spring Boot
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2026 SpringBoard Hackathon. Built with IBM Bob IDE.
            </p>
            <div className="flex items-center space-x-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-primary">Powered by IBM Bob</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Made with Bob
