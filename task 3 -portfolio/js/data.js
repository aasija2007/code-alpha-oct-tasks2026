/**
 * Portfolio Data File - Aasija Personal Portfolio
 * Centralized data source for dynamic content rendering
 */

const PORTFOLIO_DATA = {
  personalInfo: {
    name: "Aasija K",
    title: "Web Design & UI/UX Design Intern Aspirant",
    roles: [
      "Web Design & UI/UX Intern Aspirant",
      "Front-End Developer",
      "Wireframe & Design Thinking Specialist",
      "Smart India Hackathon Participant"
    ],
    tagline: "Combining web design, UI/UX design thinking, and front-end coding to build intuitive, user-centered digital experiences.",
    availability: "Available for Web Design & UI/UX Internships",
    location: "Chennai, 600127, India",
    email: "aasija2007@gmail.com",
    phone: "9150683866",
    github: "https://github.com/aasija2007",
    linkedin: "https://www.linkedin.com/in/aasija-k-9b5b05386/",
    twitter: "https://twitter.com/aasija_dev",
    bio: "A motivated and detail-oriented student with a strong foundation in web design, UI/UX design, and front-end development. Proficient in wireframe creation, design thinking, and user-centered design principles. Certified in UI/UX Design, Microsoft technologies, and Anthropic Claude (13 Certificates), with hands-on experience through academic projects like the Smart India Hackathon (SIH). Eager to apply creative and technical skills in a professional internship environment.",
    languages: [
      { name: "English", level: "Fluent" },
      { name: "Tamil", level: "Native" },
      { name: "Kannada", level: "Proficient" }
    ],
    quickFacts: [
      { label: "Class 12", value: "Maharishi Vidya Mandir (84.8% • 2024–2025)" },
      { label: "Class 10", value: "Maharishi Vidya Mandir (77% • 2022–2023)" },
      { label: "Specialization", value: "Web Design, UI/UX Design & Front-End Coding" },
      { label: "Certifications", value: "Microsoft (3), UI/UX Design, Anthropic Claude (13)" },
      { label: "Location", value: "Chennai, 600127" },
      { label: "Status", value: "Actively seeking Web Design & UI/UX Internships" }
    ],
    stats: [
      { id: "stat-projects", value: 15, suffix: "+", label: "Projects Completed" },
      { id: "stat-tech", value: 12, suffix: "+", label: "Skills & Tools Mastered" },
      { id: "stat-internships", value: 18, suffix: "+", label: "Certifications Earned" },
      { id: "stat-commits", value: 450, suffix: "+", label: "Git Commits Made" }
    ]
  },

  services: [
    {
      id: "ui-ux",
      icon: "fas fa-paint-brush",
      title: "UI/UX & Wireframe Design",
      description: "Crafting intuitive wireframes, user-centered design systems, design thinking frameworks, and accessible UI component prototypes."
    },
    {
      id: "web-dev",
      icon: "fas fa-code",
      title: "Front-End Coding",
      description: "Building responsive, modern web interfaces using semantic HTML5, CSS3, ES6+ JavaScript, and mobile-first design principles."
    },
    {
      id: "design-thinking",
      icon: "fas fa-lightbulb",
      title: "Design Thinking & Problem Solving",
      description: "Applying structured user research, empathy mapping, wireframe iteration, and solution-oriented project planning."
    },
    {
      id: "performance",
      icon: "fas fa-tachometer-alt",
      title: "Performance & Computer Literacy",
      description: "Utilizing project management tools, computer literacy, and AI assistance tools to streamline project workflows and delivery."
    }
  ],

  skills: {
    frontend: [
      { name: "Web Design & UI/UX Principles", level: 95, icon: "fas fa-drafting-compass", color: "#6366f1" },
      { name: "Wireframe Creation & Prototyping", level: 92, icon: "fas fa-layer-group", color: "#a855f7" },
      { name: "Front-End Coding (HTML5 & CSS3)", level: 95, icon: "fab fa-html5", color: "#e34f26" },
      { name: "Vanilla JavaScript (ES6+)", level: 88, icon: "fab fa-js", color: "#f7df1e" },
      { name: "Responsive & Mobile-First Design", level: 94, icon: "fas fa-mobile-alt", color: "#10b981" },
      { name: "User-Centered Design Thinking", level: 90, icon: "fas fa-user-check", color: "#ec4899" }
    ],
    backend: [
      { name: "Microsoft Technologies", level: 88, icon: "fab fa-microsoft", color: "#0078d4" },
      { name: "Anthropic Claude AI Tools (13 Certificates)", level: 95, icon: "fas fa-robot", color: "#d97706" },
      { name: "Computer Literacy & Office Suites", level: 92, icon: "fas fa-desktop", color: "#007acc" },
      { name: "Project Management Tools", level: 85, icon: "fas fa-tasks", color: "#339933" },
      { name: "Problem-Solving & Data Handling", level: 90, icon: "fas fa-brain", color: "#3776ab" }
    ],
    tools: [
      { name: "Figma & UI Wireframing Tools", level: 90, icon: "fab fa-figma", color: "#f24e1e" },
      { name: "Git & GitHub Workflow", level: 88, icon: "fab fa-github", color: "#f05032" },
      { name: "VS Code & DevTools", level: 92, icon: "fas fa-code-branch", color: "#007acc" },
      { name: "Command Line / Terminal", level: 85, icon: "fas fa-terminal", color: "#4d4d4d" },
      { name: "Claude & Microsoft Tools", level: 94, icon: "fas fa-cogs", color: "#6366f1" }
    ],
    softSkills: [
      { name: "Strong Communication", level: 95, icon: "fas fa-comments", color: "#06b6d4" },
      { name: "Problem-Solving Mindset", level: 92, icon: "fas fa-lightbulb", color: "#eab308" },
      { name: "Design Thinking & Empathy", level: 94, icon: "fas fa-heart", color: "#ec4899" },
      { name: "Team Collaboration & Adaptability", level: 90, icon: "fas fa-users", color: "#8b5cf6" }
    ]
  },

  projects: [
    {
      id: "project-sih-hackathon",
      title: "SIH (Smart India Hackathon) Project",
      subtitle: "Academic Project Participant",
      category: "hackathon",
      image: "assets/project-sih.webp",
      placeholderGradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      description: "Participated in the Smart India Hackathon (SIH), collaborating with a team to develop a solution-oriented project. Applied design thinking, wireframing, and front-end development skills to address a real-world problem statement.",
      tags: ["Design Thinking", "Wireframing", "Front-End Coding", "SIH Participant", "Team Project"],
      liveUrl: "https://github.com/aasija2007/weather-management",
      githubUrl: "https://github.com/aasija2007/weather-management",
      featured: true,
      details: {
        problem: "Addressing a real-world problem statement under national hackathon constraints requiring clear wireframing and fast execution.",
        features: [
          "Applied structured design thinking and empathy mapping",
          "Created intuitive wireframe prototypes for solution workflows",
          "Implemented clean front-end coding for user interaction",
          "Collaborated effectively in a high-intensity team environment"
        ],
        role: "UI/UX & Front-End Developer",
        challenges: "Synthesizing real-world user requirements into a sleek visual design within tight hackathon deadlines."
      }
    },
    {
      id: "project-yatra-flow",
      title: "Yatra Flow Travel Portal",
      subtitle: "Travel & Booking Experience",
      category: "web",
      image: "assets/project-gallery.webp",
      placeholderGradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      description: "An end-to-end travel workflow application featuring destination discovery, itinerary planning, interactive maps, and responsive booking layouts.",
      tags: ["HTML5", "CSS3", "JavaScript", "Travel UI", "Grid"],
      liveUrl: "https://6ab61d57f4c6771401f3c983--grand-gecko-1fbab1.netlify.app/",
      githubUrl: "https://github.com/aasija2007/yatra-flow",
      featured: true,
      details: {
        problem: "Travelers need a seamless, unified web platform to explore destinations and manage trip itineraries without friction.",
        features: [
          "Interactive destination search & filtering",
          "Itinerary builder with dynamic schedule items",
          "Responsive mobile-first layout with smooth micro-interactions",
          "Fast load performance & clean CSS token system"
        ],
        role: "Lead Frontend Engineer",
        challenges: "Designing an intuitive multi-step booking flow with responsive UI elements."
      }
    },
    {
      id: "project-security-app",
      title: "Security & Shield Web App",
      subtitle: "Security Audit & Protection Portal",
      category: "full-stack",
      image: "assets/project-calculator.webp",
      placeholderGradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      description: "A cybersecurity web application providing user authentication, system health monitoring, security logs, and real-time threat alert dashboards.",
      tags: ["JavaScript", "Security UI", "CSS Custom Properties", "Dashboard"],
      liveUrl: "https://6ab625f61ed841b0b45a99a1--jocular-figolla-a46adc.netlify.app/",
      githubUrl: "https://github.com/aasija2007/security-app",
      featured: true,
      details: {
        problem: "Users require a clear visual dashboard to monitor account activity, device logins, and system vulnerabilities.",
        features: [
          "Real-time threat status monitor & alert indicators",
          "Role-based access view and activity log feed",
          "Glassmorphism dark theme UI architecture"
        ],
        role: "Frontend Developer",
        challenges: "Structuring dynamic security log tables with responsive mobile drawers."
      }
    },
    {
      id: "project-personal-portfolio",
      title: "Personal Portfolio Portal",
      subtitle: "Developer Portfolio Site",
      category: "web",
      image: "assets/project-ledger.webp",
      placeholderGradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
      description: "A modern, high-performance personal portfolio site showcasing engineering projects, interactive resume, skill meters, and contact channels.",
      tags: ["HTML5", "CSS3", "JavaScript", "SEO", "PWA"],
      liveUrl: "https://6ab626b3252bef5d6c3b2035--inspiring-lamington-308f6f.netlify.app/",
      githubUrl: "https://github.com/aasija2007/portfolio",
      featured: true,
      details: {
        problem: "Recruiters and clients need a fast, accessible, and stunning visual presentation of developer skills and live projects.",
        features: [
          "Dark/Light theme engine with local storage memory",
          "Animated typing roles & particle background canvas",
          "Command palette (Ctrl+K) quick navigation"
        ],
        role: "Sole Creator",
        challenges: "Targeting 95+ scores across all Lighthouse audit categories."
      }
    },
    {
      id: "project-unit-conversion",
      title: "Unit Conversion Utility",
      subtitle: "Multi-Category Converter App",
      category: "web",
      image: "assets/project-pinkrose.webp",
      placeholderGradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
      description: "A fast, accurate unit converter supporting Length, Weight, Temperature, Area, Volume, and Currency conversions with real-time calculations.",
      tags: ["JavaScript ES6", "Math Algorithms", "CSS Flexbox", "Utility UI"],
      liveUrl: "https://6ab6274d7065cce2481f9107--soft-pithivier-f55ebc.netlify.app/",
      githubUrl: "https://github.com/aasija2007/unit-conversion",
      featured: false,
      details: {
        problem: "Users often need instant unit conversions without heavy ad-laden websites.",
        features: [
          "Instant dual-way unit conversion calculations",
          "Category tabs for Length, Weight, Temperature, and Currency",
          "Copy-to-clipboard result action"
        ],
        role: "Frontend Developer",
        challenges: "Ensuring floating point math precision across all metric and imperial units."
      }
    },
    {
      id: "project-quiz-app",
      title: "Interactive Quiz Application",
      subtitle: "Gamified Knowledge Assessment",
      category: "web",
      image: "assets/project-quiz.webp",
      placeholderGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      description: "A dynamic quiz web application with timed questions, score tracking, progress bar, category selection, and instant answer feedback.",
      tags: ["JavaScript ES6", "Async API", "CSS Animations", "LocalStorage"],
      liveUrl: "https://6ab627ff57ad1aff0ef44da9--clever-tapioca-bbf867.netlify.app/",
      githubUrl: "https://github.com/aasija2007/quiz-app",
      featured: true,
      details: {
        problem: "Learning assessments are frequently boring and lack interactive visual feedback.",
        features: [
          "Timed quiz countdown clock with visual progress indicator",
          "High score leaderboard stored in browser LocalStorage",
          "Responsive layout with instant correct/incorrect feedback"
        ],
        role: "Frontend Developer",
        challenges: "Managing state transitions cleanly between quiz lobby, question rounds, and score screens."
      }
    },
    {
      id: "project-contact-mgmt",
      title: "Contact Management System",
      subtitle: "CRUD Utility Application",
      category: "web",
      image: "assets/project-contact.webp",
      placeholderGradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      description: "A fast, client-side contact manager featuring search indexing, contact grouping, favorite tagging, and quick editing capabilities.",
      tags: ["JavaScript", "LocalStorage", "CSS Grid", "Modal UI"],
      liveUrl: "https://6ab6286c3560568faa1ba65c--illustrious-bunny-61dae3.netlify.app/",
      githubUrl: "https://github.com/aasija2007/contact-management-system",
      featured: true,
      details: {
        problem: "Managing contact directories requires quick search, live editing, and cross-platform backup capabilities.",
        features: [
          "Instant live search filter by name, company, or phone number",
          "Add, edit, delete, and favorite contact actions",
          "Sleek card-based user interface"
        ],
        role: "Frontend Engineer",
        challenges: "Building robust browser storage synchronization without external database dependencies."
      }
    }
  ],

  timeline: [
    {
      type: "experience",
      period: "Oct 2026 - Present",
      title: "Frontend Web Developer Intern",
      organization: "CodeAlpha",
      location: "Remote",
      description: "Building production-quality frontend projects focused on modern web design, performance optimization, and web accessibility. Developing responsive galleries, scientific calculators, and personal portfolios using pure HTML, CSS, and ES6+ JavaScript.",
      highlights: [
        "Crafted modular, framework-free web apps with zero build step dependencies",
        "Achieved 95+ Lighthouse scores across performance and accessibility",
        "Implemented custom CSS token architectures and dark theme engines"
      ]
    },
    {
      type: "experience",
      period: "Academic Project Participant",
      title: "Smart India Hackathon (SIH) Participant",
      organization: "Smart India Hackathon (SIH)",
      location: "India",
      description: "Participated in the Smart India Hackathon (SIH), collaborating with a team to develop a solution-oriented project. Applied design thinking, wireframing, and front-end development skills to address a real-world problem statement.",
      highlights: [
        "Applied structured design thinking and empathy mapping to address problem statements",
        "Created user-centered wireframe prototypes for interactive digital workflows",
        "Collaborated seamlessly in a team to build front-end components"
      ]
    },
    {
      type: "education",
      period: "2024 – 2025",
      title: "Class 12 (Senior Secondary)",
      organization: "Maharishi Vidya Mandir",
      location: "Chennai, 600127",
      description: "Completed Class 12 education with high academic achievement, building a strong analytical foundation in computer science and logical problem-solving.",
      highlights: [
        "Secured 84.8% Score in Board Examinations",
        "Specialized in core academic subjects with excellence in computer literacy"
      ]
    },
    {
      type: "education",
      period: "2022 – 2023",
      title: "Class 10 (Secondary School)",
      organization: "Maharishi Vidya Mandir",
      location: "Chennai, 600127",
      description: "Completed secondary school education with solid foundational performance.",
      highlights: [
        "Secured 77% Score in Class 10 Board Examinations",
        "Active participant in school technical and creative activities"
      ]
    }
  ],

  certifications: [
    {
      title: "Microsoft Certifications",
      count: "3 Certifications",
      issuer: "Microsoft",
      description: "Demonstrated proficiency across Microsoft technologies and productivity platforms."
    },
    {
      title: "UI/UX Design Certifications",
      count: "Professional Certifications",
      issuer: "UI/UX Industry Certifications",
      description: "Certified in user experience design, wireframing, user research, and visual design principles."
    },
    {
      title: "Anthropic Claude Certificates",
      count: "13 Certificates",
      issuer: "Anthropic Claude",
      description: "13 certificates earned in Anthropic Claude AI tools, prompt engineering, and modern AI workflows."
    },
    {
      title: "Additional Professional Certifications",
      count: "Multiple Badges",
      issuer: "Industry Recognized Bodies",
      description: "Demonstrating commitment to continuous learning and staying current with emerging tools and technologies."
    }
  ],

  testimonials: [
    {
      quote: "Aasija demonstrated exceptional attention to detail during her CodeAlpha tasks. Her wireframing and front-end code are remarkably clean, semantic, and user-centered!",
      author: "CodeAlpha Internship Mentor",
      role: "Senior Web Lead",
      avatar: "assets/mentor-avatar.webp",
      initials: "CM"
    },
    {
      quote: "Working with Aasija during the Smart India Hackathon was fantastic. She applied design thinking and took charge of wireframing and front-end user interfaces under tight hackathon deadlines!",
      author: "Hackathon Team Captain",
      role: "SIH Team Colleague",
      avatar: "assets/peer-avatar.webp",
      initials: "TC"
    }
  ],

  resumeData: {
    downloadUrl: "assets/profile.jpg",
    filename: "Aasija_K_Resume.pdf",
    highlights: [
      "Target Role: Web Design & UI/UX Design Intern Aspirant",
      "Skills: Web Design, UI/UX Design, Wireframe Creation, Front-End Coding, Design Thinking",
      "Certifications: Microsoft (3), UI/UX Design, 13 Certificates in Anthropic Claude",
      "Education: Maharishi Vidya Mandir Class 12 (84.8%) & Class 10 (77%)"
    ]
  }
};

// Freeze object to prevent unintentional modification
Object.freeze(PORTFOLIO_DATA);
