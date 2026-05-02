import Navigation from '@/components/Navigation';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#161616] text-white">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            SpringBoard in Action
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Watch how IBM Bob modernizes a Spring Boot 2 application to Spring Boot 3 
            in 5 automated steps
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1 - Analyze */}
          <div className="relative pl-8 pb-16">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-800"></div>
            
            {/* Timeline dot */}
            <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-[#161616]">
              <span className="text-white text-sm font-bold">1</span>
            </div>

            {/* Card */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 ml-8 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-green-500 text-2xl">✓</span>
                    <h3 className="text-2xl font-bold">Bob Analyzes the Legacy Codebase</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    IBM Bob reads every file in the Spring Boot 2 project and identifies 
                    outdated dependencies, deprecated APIs, javax imports, and missing tests
                  </p>
                </div>
              </div>

              {/* Code snippet */}
              <div className="mt-6 bg-[#0d1117] border border-gray-800 rounded-lg p-4 overflow-x-auto">
                <div className="text-xs text-gray-500 mb-2">legacy-app/pom.xml</div>
                <pre className="text-sm text-gray-300 font-mono">
{`<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.0.2.RELEASE</version>
</parent>

<properties>
  <java.version>1.8</java.version>
</properties>`}
                </pre>
              </div>

              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full">Outdated</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">Java 8</span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">Spring Boot 2.x</span>
              </div>
            </div>
          </div>

          {/* Step 2 - Plan */}
          <div className="relative pl-8 pb-16">
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-800"></div>
            
            <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-[#161616]">
              <span className="text-white text-sm font-bold">2</span>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 ml-8 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-green-500 text-2xl">✓</span>
                    <h3 className="text-2xl font-bold">Bob Creates a Modernization Plan</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    Bob generates a prioritized plan with risk levels for each change needed
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="mt-6 bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#161616] border-b border-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Priority</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Change</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-800">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">Critical</span>
                      </td>
                      <td className="px-4 py-3">Upgrade to Spring Boot 3.1.5</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">High</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">Critical</span>
                      </td>
                      <td className="px-4 py-3">Java 11 to Java 17</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Medium</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">Important</span>
                      </td>
                      <td className="px-4 py-3">javax to jakarta migration</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Medium</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">Nice to have</span>
                      </td>
                      <td className="px-4 py-3">Add missing Javadoc</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Low</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 3 - Refactor */}
          <div className="relative pl-8 pb-16">
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-800"></div>
            
            <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-[#161616]">
              <span className="text-white text-sm font-bold">3</span>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 ml-8 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-green-500 text-2xl">✓</span>
                    <h3 className="text-2xl font-bold">Bob Refactors the Code</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    Bob automatically updates all files - pom.xml, Java classes, Dockerfile, application.properties
                  </p>
                </div>
              </div>

              {/* Before/After Diff */}
              <div className="mt-6 space-y-4">
                <div className="bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-red-500/10 border-b border-gray-800 px-4 py-2 flex items-center space-x-2">
                    <span className="text-red-400 text-xs font-mono">- BEFORE</span>
                    <span className="text-xs text-gray-500">Dockerfile</span>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono p-4">
{`FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
...
FROM java:8-jre-alpine`}
                  </pre>
                </div>

                <div className="flex justify-center">
                  <div className="text-primary text-2xl">↓</div>
                </div>

                <div className="bg-[#0d1117] border border-gray-800 rounded-lg overflow-hidden">
                  <div className="bg-green-500/10 border-b border-gray-800 px-4 py-2 flex items-center space-x-2">
                    <span className="text-green-400 text-xs font-mono">+ AFTER</span>
                    <span className="text-xs text-gray-500">Dockerfile</span>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono p-4">
{`FROM maven:3.9-eclipse-temurin-17-alpine AS MAVEN_TOOL_CHAIN
...
FROM eclipse-temurin:17-jdk-alpine`}
                  </pre>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">✓ pom.xml updated</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">✓ 6 Java files refactored</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">✓ Dockerfile modernized</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">✓ Properties updated</span>
              </div>
            </div>
          </div>

          {/* Step 4 - Test */}
          <div className="relative pl-8 pb-16">
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-800"></div>
            
            <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-[#161616]">
              <span className="text-white text-sm font-bold">4</span>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 ml-8 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-green-500 text-2xl">✓</span>
                    <h3 className="text-2xl font-bold">Bob Generates Tests</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    Bob writes JUnit 5 tests with Mockito for all refactored components
                  </p>
                </div>
              </div>

              {/* Test files list */}
              <div className="mt-6 bg-[#0d1117] border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-3">Generated Test Files</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300 font-mono">HelloWorldServiceTest.java</span>
                    <span className="text-xs text-gray-500">3 tests</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300 font-mono">SampleControllerTest.java</span>
                    <span className="text-xs text-gray-500">5 tests</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300 font-mono">ExampleInfoContributorTest.java</span>
                    <span className="text-xs text-gray-500">2 tests</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300 font-mono">HealthIT.java</span>
                    <span className="text-xs text-gray-500">4 integration tests</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400">
                  <span className="text-xl">✓</span>
                  <span className="font-semibold">All tests passing</span>
                  <span className="text-sm text-gray-400">14/14 tests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 - Deploy */}
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-[#161616]">
              <span className="text-white text-sm font-bold">5</span>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 ml-8 hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-green-500 text-2xl">✓</span>
                    <h3 className="text-2xl font-bold">Ready to Deploy</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">
                    The modernized app is ready for Docker deployment with Java 17
                  </p>
                </div>
              </div>

              {/* Docker commands */}
              <div className="mt-6 space-y-4">
                <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-2">Build Docker Image</div>
                  <pre className="text-sm text-primary font-mono">
{`docker build -t spring-boot-actuator:3.1.5 .`}
                  </pre>
                </div>

                <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-2">Run Container</div>
                  <pre className="text-sm text-primary font-mono">
{`docker run -p 8080:8080 spring-boot-actuator:3.1.5`}
                  </pre>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold mb-2">🚀 Deployment Ready</div>
                    <div className="text-sm text-gray-400">
                      Spring Boot 3.1.5 • Java 17 • Docker • Production Ready
                    </div>
                  </div>
                  <div className="text-4xl">✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Migration Complete</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5/5</div>
                <div className="text-sm text-gray-400">Steps Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">9</div>
                <div className="text-sm text-gray-400">Files Updated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">~8h</div>
                <div className="text-sm text-gray-400">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                <div className="text-sm text-gray-400">Tests Passing</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a 
            href="/#report" 
            className="inline-block px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
          >
            View Full Report
          </a>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
