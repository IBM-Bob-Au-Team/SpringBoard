import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#161616] text-white flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
                🚀 AI-Powered Spring Boot Migration
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Modernize Spring Boot 2 to 3,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Faster with IBM Bob
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              SpringBoard uses AI to analyze your legacy codebase, plan the migration,
              refactor the code, and generate tests automatically
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <a
                href="#demo"
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
              >
                See the Demo
              </a>
              <a
                href="#report"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
              >
                View Report
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">6</div>
              <div className="text-sm text-gray-400">Java Files Refactored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">2.x → 3.1.5</div>
              <div className="text-sm text-gray-400">Spring Boot Upgrade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">11 → 17</div>
              <div className="text-sm text-gray-400">Java Version</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">⚡</div>
              <div className="text-sm text-gray-400">Powered by IBM Bob</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="demo" className="py-24 bg-[#161616]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Three simple steps to modernize your Spring Boot application</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover:border-primary/50 transition-all group">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-all">
                <span className="text-3xl">🔍</span>
              </div>
              <div className="text-2xl font-bold mb-2 text-primary">Step 1</div>
              <h3 className="text-2xl font-bold mb-4">Analyze</h3>
              <p className="text-gray-400 leading-relaxed">
                Bob reads your entire Spring Boot 2 codebase, identifies deprecated patterns,
                and creates a comprehensive migration plan
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover:border-primary/50 transition-all group">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-all">
                <span className="text-3xl">⚙️</span>
              </div>
              <div className="text-2xl font-bold mb-2 text-primary">Step 2</div>
              <h3 className="text-2xl font-bold mb-4">Modernize</h3>
              <p className="text-gray-400 leading-relaxed">
                Bob refactors code to Spring Boot 3 standards, updates dependencies,
                and migrates javax.* to jakarta.* namespaces
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover:border-primary/50 transition-all group">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-all">
                <span className="text-3xl">🚀</span>
              </div>
              <div className="text-2xl font-bold mb-2 text-primary">Step 3</div>
              <h3 className="text-2xl font-bold mb-4">Deploy</h3>
              <p className="text-gray-400 leading-relaxed">
                Ready for Java 17 and Docker with updated Dockerfile,
                comprehensive documentation, and deployment guides
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="report" className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Complete Migration Report</h2>
                <p className="text-xl text-gray-400 mb-8">
                  Get detailed documentation of every change, including:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-gray-300">Comprehensive changelog with reasons for each modification</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-gray-300">Docker deployment guide with best practices</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-gray-300">Javadoc added to all public methods</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-gray-300">Updated configuration files and properties</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#161616] border border-gray-800 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                    <span className="text-gray-400">Files Modified</span>
                    <span className="text-2xl font-bold text-primary">9</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                    <span className="text-gray-400">Lines of Code</span>
                    <span className="text-2xl font-bold text-white">1,200+</span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                    <span className="text-gray-400">Documentation</span>
                    <span className="text-2xl font-bold text-white">545 lines</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Time Saved</span>
                    <span className="text-2xl font-bold text-primary">~8 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Made with Bob
