import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { GITHUB_REPO_URL } from '@/lib/constants';

export default function TeamPage() {
  const teamMembers = [
    {
      id: "sam-yati",
      name: "Sam Yati",
      role: "Dev 1 - Senior Architect",
      avatar: "🔍",
      email: "samyati.syt@gmail.com",
      github: "narattscoward",
      linkedin: "https://www.linkedin.com/in/sam-yati-7683b7288/",
      contributions: [
        "Codebase Analysis",
        "Architecture Planning",
        "Dependency Mapping"
      ],
      bobMode: "Code Analysis Mode"
    },
    {
      id: "win-yu-maung",
      name: "Win Yu Maung",
      role: "Dev 2 - Lead Developer",
      avatar: "⚙️",
      email: "winyumg2003a@gmail.com",
      github: "Kusk24",
      linkedin: "https://www.linkedin.com/in/win-yu-maung-06747827b/",
      contributions: [
        "Code Refactoring",
        "Spring Boot 3 Migration",
        "Jakarta Namespace Updates"
      ],
      bobMode: "Code Refactoring Mode"
    },
    {
      id: "swan-htet-aung",
      name: "Swan Htet Aung",
      role: "Dev 3 - QA Engineer",
      avatar: "✅",
      email: "swanhtetag09@gmail.com",
      github: "swanhtetaung01",
      linkedin: "https://www.linkedin.com/in/swan-htet-aung09/",
      contributions: [
        "Test Generation",
        "Quality Assurance",
        "Integration Testing"
      ],
      bobMode: "Test Generation Mode"
    }
  ];

  return (
    <div className="min-h-screen bg-[#161616] text-white">
      <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium mb-4">
            👥 Meet the Team
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            SpringBoard Team
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The developers behind the IBM Bob-powered Spring Boot modernization project
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover:border-primary/50 transition-all group"
            >
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/30 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <span className="text-5xl">{member.avatar}</span>
              </div>

              {/* Name & Role */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-1">{member.role}</p>
                <p className="text-xs text-gray-500">{member.bobMode}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center space-x-3 text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{member.email}</span>
                </a>

                <a
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>@{member.github}</span>
                </a>

                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>

              {/* Contributions */}
              <div className="border-t border-gray-800 pt-6">
                <p className="text-xs text-gray-500 mb-3 font-semibold">Key Contributions</p>
                <ul className="space-y-2">
                  {member.contributions.map((contribution, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{contribution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Team Stats */}
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Team Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">9</div>
              <div className="text-sm text-gray-400">Files Modernized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">~8h</div>
              <div className="text-sm text-gray-400">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* IBM Bob Section */}
        <div className="text-center">
          <div className="inline-block bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-4xl">🤖</span>
              <h3 className="text-2xl font-bold">Powered by IBM Bob IDE</h3>
            </div>
            <p className="text-gray-400 max-w-2xl">
              This project was built using IBM Bob IDE's AI-powered development capabilities,
              demonstrating how AI can accelerate legacy code modernization.
            </p>
            <div className="mt-6">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>View Project on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Made with Bob
