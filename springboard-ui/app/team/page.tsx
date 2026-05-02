import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { GITHUB_REPO_URL } from '@/lib/constants';

export default function TeamPage() {
  const teamMembers = [
    {
      id: "dev-1",
      name: "Sam Yati",
      role: "Analyst & Planner",
      avatar: "🔍",
      image: "https://media.licdn.com/dms/image/v2/D5603AQGxHqVLZ8LHPQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1709288634128?e=1743638400&v=beta&t=8KxQZxYxQxYxQxYxQxYxQxYxQxYxQxYxQxYxQxYxQxY",
      email: "samyati.syt@gmail.com",
      github: "https://github.com/narattscoward",
      linkedin: "https://www.linkedin.com/in/sam-yati-7683b7288/",
      description: "Analyzed the legacy codebase and created comprehensive modernization plans",
      bobModes: ["Ask Mode", "Plan Mode"],
      contributions: [
        "Codebase Analysis",
        "Architecture Planning",
        "Dependency Mapping",
        "Risk Assessment"
      ]
    },
    {
      id: "dev-2",
      name: "Win Yu Maung",
      role: "Refactor & UI Builder",
      avatar: "⚙️",
      image: "https://media.licdn.com/dms/image/v2/D5603AQEZxQxYxQxYxQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1709288634128?e=1743638400&v=beta&t=8KxQZxYxQxYxQxYxQxYxQxYxQxYxQxYxQxYxQxYxQxY",
      email: "winyumg2003a@gmail.com",
      github: "https://github.com/Kusk24",
      linkedin: "https://www.linkedin.com/in/win-yu-maung-06747827b/",
      description: "Executed code refactoring and built the SpringBoard UI showcase",
      bobModes: ["Code Mode"],
      contributions: [
        "Code Refactoring",
        "Spring Boot 3 Migration",
        "Jakarta Namespace Updates",
        "UI Development"
      ]
    },
    {
      id: "dev-3",
      name: "Swan Htet Aung",
      role: "Security & Deployment",
      avatar: "🔒",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFxQxYxQxYxQx/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1709288634128?e=1743638400&v=beta&t=8KxQZxYxQxYxQxYxQxYxQxYxQxYxQxYxQxYxQxYxQxY",
      email: "swanhtetag09@gmail.com",
      github: "https://github.com/swanhtetaung01",
      linkedin: "https://www.linkedin.com/in/swan-htet-aung09/",
      description: "Implemented security measures and deployment infrastructure",
      bobModes: ["Code Mode", "Advanced Mode"],
      contributions: [
        "Security Implementation",
        "Docker Configuration",
        "CI/CD Pipeline",
        "Deployment Automation"
      ]
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
            AU Team
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The developers behind the SpringBoard modernization project, powered by IBM Bob IDE
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
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border-2 border-primary/30 rounded-2xl overflow-hidden mb-6 mx-auto group-hover:scale-110 transition-transform">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-5xl flex items-center justify-center h-full">${member.avatar}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-5xl flex items-center justify-center h-full">{member.avatar}</span>
                )}
              </div>

              {/* Name & Role */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{member.description}</p>
                
                {/* Contact Links */}
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="Email"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="GitHub"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Bob Modes Used */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-3 font-semibold text-center">IBM Bob Modes Used</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.bobModes.map((mode, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-xs rounded-full"
                    >
                      {mode}
                    </span>
                  ))}
                </div>
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
          <div className="inline-block bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 max-w-3xl">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-4xl">🤖</span>
              <h3 className="text-2xl font-bold">Built with IBM Bob IDE</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              This project was built using IBM Bob IDE's AI-powered development capabilities,
              demonstrating how AI can accelerate legacy code modernization across multiple
              development modes and workflows.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              <a 
                href="/demo"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all"
              >
                See How We Did It
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
