import { UserProfile, JobApplication, MasterQAItem } from '../types';

export const DEFAULT_MASTER_QA: MasterQAItem[] = [
  {
    id: 'mqa-auth-1',
    category: 'work_authorization',
    question: 'Are you legally authorized to work in the country of this position?',
    answer: 'Yes',
    options: ['Yes', 'No'],
    explanation: 'Candidate holds legal work authorization in the target country / jurisdiction.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-auth-2',
    category: 'work_authorization',
    question: 'Will you now or in the future require employment visa sponsorship?',
    answer: 'No',
    options: ['Yes', 'No'],
    explanation: 'No current visa sponsorship required for permanent employment.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-hist-1',
    category: 'company_history',
    question: 'Have you ever been previously employed by, or worked as a contractor/consultant for this company?',
    answer: 'No',
    options: ['Yes', 'No'],
    explanation: 'No prior direct employment or contractor affiliation with this specific enterprise entity.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-hist-2',
    category: 'company_history',
    question: 'Have you ever worked with any partner alliance, client subsidiary, or vendor of this organization?',
    answer: 'Yes (Wissen Technology on client engagement for tier-1 financial institutions including Morgan Stanley)',
    options: ['Yes', 'No'],
    explanation: 'Consultant experience with enterprise partner Wissen Technology deploying Cash Equities OMS platforms.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-demo-1',
    category: 'demographics',
    question: 'What is your gender identity?',
    answer: 'Male (or I prefer not to declare)',
    options: ['Male', 'Female', 'Non-Binary', 'I prefer not to say'],
    explanation: 'Standard voluntary EEO demographic question.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-demo-2',
    category: 'demographics',
    question: 'What is your race / ethnicity?',
    answer: 'Asian / South Asian (or I prefer not to declare)',
    options: ['Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Two or More Races', 'I prefer not to say'],
    explanation: 'Standard voluntary Equal Opportunity Employment question.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-demo-3',
    category: 'demographics',
    question: 'What is your veteran status?',
    answer: 'I am not a protected veteran',
    options: ['I am a protected veteran', 'I am not a protected veteran', 'I prefer not to say'],
    explanation: 'Standard voluntary veteran status disclosure.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-demo-4',
    category: 'demographics',
    question: 'Do you have a disability or a history/record of having a disability?',
    answer: 'No, I do not have a disability',
    options: ['Yes, I have a disability', 'No, I do not have a disability', 'I do not wish to answer'],
    explanation: 'Standard voluntary self-identification of disability (Form CC-305).',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-avail-1',
    category: 'availability',
    question: 'What is your current notice period and earliest available joining date?',
    answer: '30 Days (Negotiable / Immediate upon mutual agreement)',
    options: ['Immediate', '15 Days', '30 Days', '60 Days', '90 Days'],
    explanation: 'Standard notice period for software engineering roles.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-avail-2',
    category: 'availability',
    question: 'Are you open to hybrid / on-site working arrangements at the specified office location?',
    answer: 'Yes, fully open to hybrid or on-site schedules.',
    options: ['Yes', 'No - Remote Only', 'Open to discussion'],
    explanation: 'Flexible for hybrid or location requirements.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-comp-1',
    category: 'compensation',
    question: 'What are your annual base salary expectations?',
    answer: 'Competitive / Open to discussing in line with company standard compensation bands for this role and location.',
    explanation: 'Flexible compensation aligning with market and candidate engineering seniority.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-gen-1',
    category: 'general',
    question: 'Do you have any relatives or family members currently employed at this company?',
    answer: 'No',
    options: ['Yes', 'No'],
    explanation: 'Standard conflict-of-interest check.',
    updatedAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'mqa-gen-2',
    category: 'general',
    question: 'Are you subject to any non-compete agreements or restrictive covenants from your current or past employer?',
    answer: 'No',
    options: ['Yes', 'No'],
    explanation: 'Candidate is free of non-compete restrictions.',
    updatedAt: '2026-08-28T10:00:00Z'
  }
];

export const DEFAULT_MASTER_TEX: string = `\\documentclass[10pt,a4paper]{article}
\\usepackage[left=0.6in,right=0.6in,top=0.5in,bottom=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue
}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}
\\setlist[itemize]{noitemsep, topsep=2pt, leftmargin=1.2em}

\\begin{document}

% HEADER
\\begin{center}
    {\\LARGE \\textbf{ABHISHEK KALGUDI}} \\\\[3pt]
    Software Engineer --- Java, Spring Boot, Microservices \\& Distributed Systems \\\\[2pt]
    \\small Bangalore, India \\quad | \\quad 
    \\href{mailto:abhishekkalgudi03@gmail.com}{abhishekkalgudi03@gmail.com} \\quad | \\quad 
    +91 98765 43210 \\quad | \\quad 
    \\href{https://linkedin.com/in/abhishekkalgudi}{linkedin.com/in/abhishekkalgudi} \\quad | \\quad 
    \\href{https://github.com/abhishekkalgudi}{github.com/abhishekkalgudi}
\\end{center}

% PROFESSIONAL SUMMARY
\\section{Professional Summary}
Software Engineer with strong expertise in building resilient, high-throughput distributed systems using Java, Spring Boot, Apache Kafka, React, and TypeScript. Experienced in architecting enterprise Order Management Systems (OMS) for tier-1 investment banking clients, optimizing low-latency order routing pipelines, and developing robust RESTful microservices with rigorous automated testing.

% TECHNICAL SKILLS
\\section{Technical Skills}
\\begin{itemize}
    \\item \\textbf{Languages:} Java (8/11/17/21), TypeScript, JavaScript, SQL, Bash
    \\item \\textbf{Frameworks \\& Libraries:} Spring Boot, Spring MVC, Spring Data JPA, Hibernate, React.js, Redux, Express.js
    \\item \\textbf{Distributed Systems \\& Messaging:} Apache Kafka, Event-Driven Architecture, Microservices, RESTful APIs, gRPC
    \\item \\textbf{Databases \\& Caching:} PostgreSQL, MySQL, Redis, Oracle DB
    \\item \\textbf{Tools \\& DevOps:} Git, Docker, Maven, Gradle, Jenkins, JUnit 5, Mockito, Postman, Linux
\\end{itemize}

% EXPERIENCE
\\section{Work Experience}

\\textbf{Wissen Technology} \\hfill Bangalore, India \\\\
\\textit{Software Engineer (Client: Morgan Stanley --- Cash Equities OMS)} \\hfill Aug 2024 --- Present
\\begin{itemize}
    \\item Engineered scalable microservices using Java 17 and Spring Boot for high-volume Cash Equities Order Management System (OMS), handling over 500,000 daily order events with sub-50ms latency.
    \\item Architected and implemented distributed Kafka event pipelines with robust consumer group partitioning, dead-letter queues, and exactly-once processing guarantees for trade executions.
    \\item Designed and published secure, contract-first RESTful APIs integrated with upstream market data gateways and downstream settlement services, adhering strictly to OpenAPI specs.
    \\item Built interactive real-time trader dashboards using React, TypeScript, and WebSocket feeds, delivering sub-second order book updates and trade execution status indicators.
    \\item Optimized database query execution plans in PostgreSQL and integrated Redis multi-level caching, reducing query latency by 35\\% across high-concurrency order querying flows.
    \\item Authored comprehensive unit and integration test suites utilizing JUnit 5, Mockito, and Testcontainers, maintaining over 88\\% code coverage across critical service modules.
\\end{itemize}

% PROJECTS
\\section{Key Projects}

\\textbf{Distributed Real-Time Order Processing Engine} \\hfill \\textit{Java 17, Spring Boot, Kafka, Redis, PostgreSQL}
\\begin{itemize}
    \\item Developed an event-driven order processing engine supporting asynchronous transaction reconciliation and real-time risk checks with distributed lock management using Redis.
    \\item Implemented idempotency mechanisms and circuit breakers with Resilience4j to prevent cascading failures across interconnected settlement microservices.
    \\item Structured comprehensive metrics and distributed tracing using Micrometer and Prometheus, enabling proactive monitoring and automated alerting.
\\end{itemize}

\\vspace{2pt}
\\textbf{Financial Portfolio & Analytics Dashboard} \\hfill \\textit{React, TypeScript, Tailwind CSS, Spring Boot REST}
\\begin{itemize}
    \\item Built a full-stack portfolio tracking system visualizing live PnL, asset allocation, and historical performance charts with responsive interactive filtering.
    \\item Created custom middleware for rate-limiting, JWT authentication, and secure request validation across financial analytics endpoints.
\\end{itemize}

% EDUCATION
\\section{Education}
\\textbf{Bachelor of Technology (B.Tech) in Computer Science and Engineering} \\hfill 2020 --- 2024 \\\\
Visvesvaraya Technological University \\hfill GPA: 8.6 / 10.0

% ACHIEVEMENTS & CERTIFICATIONS
\\section{Achievements \\& Certifications}
\\begin{itemize}
    \\item Winner of Internal FinTech Hackathon at Wissen Technology for developing an automated trade anomaly detection pipeline.
    \\item Solved 400+ algorithmic problems on LeetCode and GeeksforGeeks with focus on Distributed Data Structures, Graph Algorithms, and Dynamic Programming.
\\end{itemize}

\\end{document}
`;

export const DEFAULT_USER_PROFILE: UserProfile = {
  personal: {
    name: 'Abhishek Kalgudi',
    email: 'abhishekkalgudi03@gmail.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    linkedin: 'https://linkedin.com/in/abhishekkalgudi',
    github: 'https://github.com/abhishekkalgudi',
    portfolio: 'https://abhishekkalgudi.dev'
  },
  summary: 'Software Engineer with strong expertise in building resilient, high-throughput distributed systems using Java, Spring Boot, Apache Kafka, React, and TypeScript. Experienced in architecting enterprise Order Management Systems (OMS) for tier-1 investment banking clients, optimizing low-latency order routing pipelines, and developing robust RESTful microservices with rigorous automated testing.',
  skills: [
    { name: 'Java', category: 'Language' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'JavaScript', category: 'Language' },
    { name: 'SQL', category: 'Language' },
    { name: 'Spring Boot', category: 'Framework' },
    { name: 'Spring MVC', category: 'Framework' },
    { name: 'Spring Data JPA', category: 'Framework' },
    { name: 'Hibernate', category: 'Framework' },
    { name: 'React', category: 'Framework' },
    { name: 'Redux', category: 'Framework' },
    { name: 'Apache Kafka', category: 'Architecture' },
    { name: 'Microservices', category: 'Architecture' },
    { name: 'REST APIs', category: 'Architecture' },
    { name: 'Event-Driven Architecture', category: 'Architecture' },
    { name: 'Distributed Systems', category: 'Architecture' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'Docker', category: 'Cloud/DevOps' },
    { name: 'Git', category: 'Tools' },
    { name: 'JUnit 5 / Mockito', category: 'Tools' },
    { name: 'Maven / Gradle', category: 'Tools' },
    { name: 'Linux', category: 'Tools' }
  ],
  experience: [
    {
      id: 'exp-001',
      company: 'Wissen Technology',
      client: 'Morgan Stanley',
      role: 'Software Engineer',
      location: 'Bangalore, India',
      startDate: '2024-08',
      endDate: 'Present',
      current: true,
      technologies: ['Java 17', 'Spring Boot', 'Kafka', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'],
      bullets: [
        {
          id: 'exp-001-b1',
          text: 'Engineered scalable microservices using Java 17 and Spring Boot for high-volume Cash Equities Order Management System (OMS), handling over 500,000 daily order events with sub-50ms latency.',
          evidenceTags: ['Java', 'Spring Boot', 'Microservices', 'OMS', 'Low-Latency', 'High-Throughput']
        },
        {
          id: 'exp-001-b2',
          text: 'Architected and implemented distributed Kafka event pipelines with robust consumer group partitioning, dead-letter queues, and exactly-once processing guarantees for trade executions.',
          evidenceTags: ['Apache Kafka', 'Event-Driven Architecture', 'Distributed Systems', 'Message Queues', 'Kafka']
        },
        {
          id: 'exp-001-b3',
          text: 'Designed and published secure, contract-first RESTful APIs integrated with upstream market data gateways and downstream settlement services, adhering strictly to OpenAPI specs.',
          evidenceTags: ['REST APIs', 'API Design', 'OpenAPI', 'Spring Boot', 'Integration']
        },
        {
          id: 'exp-001-b4',
          text: 'Built interactive real-time trader dashboards using React, TypeScript, and WebSocket feeds, delivering sub-second order book updates and trade execution status indicators.',
          evidenceTags: ['React', 'TypeScript', 'WebSockets', 'Frontend', 'Real-Time']
        },
        {
          id: 'exp-001-b5',
          text: 'Optimized database query execution plans in PostgreSQL and integrated Redis multi-level caching, reducing query latency by 35% across high-concurrency order querying flows.',
          evidenceTags: ['PostgreSQL', 'Redis', 'Database Optimization', 'Caching', 'Performance']
        },
        {
          id: 'exp-001-b6',
          text: 'Authored comprehensive unit and integration test suites utilizing JUnit 5, Mockito, and Testcontainers, maintaining over 88% code coverage across critical service modules.',
          evidenceTags: ['JUnit', 'Mockito', 'Testing', 'CI/CD', 'Code Quality']
        }
      ]
    }
  ],
  projects: [
    {
      id: 'proj-001',
      name: 'Distributed Real-Time Order Processing Engine',
      role: 'Lead Developer',
      technologies: ['Java 17', 'Spring Boot', 'Apache Kafka', 'Redis', 'PostgreSQL', 'Docker'],
      description: 'High-throughput event-driven trade processing system with distributed locking and fault tolerance.',
      bullets: [
        'Developed an event-driven order processing engine supporting asynchronous transaction reconciliation and real-time risk checks with distributed lock management using Redis.',
        'Implemented idempotency mechanisms and circuit breakers with Resilience4j to prevent cascading failures across interconnected settlement microservices.',
        'Structured comprehensive metrics and distributed tracing using Micrometer and Prometheus, enabling proactive monitoring and automated alerting.'
      ]
    },
    {
      id: 'proj-002',
      name: 'Financial Portfolio & Analytics Dashboard',
      role: 'Full Stack Developer',
      technologies: ['React', 'TypeScript', 'Spring Boot', 'Tailwind CSS', 'PostgreSQL'],
      description: 'Real-time portfolio management platform for tracking PnL and asset allocation.',
      bullets: [
        'Built a full-stack portfolio tracking system visualizing live PnL, asset allocation, and historical performance charts with responsive interactive filtering.',
        'Created custom middleware for rate-limiting, JWT authentication, and secure request validation across financial analytics endpoints.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-001',
      degree: 'Bachelor of Technology (B.Tech)',
      field: 'Computer Science and Engineering',
      institution: 'Visvesvaraya Technological University',
      location: 'Bangalore, India',
      startDate: '2020',
      endDate: '2024',
      grade: '8.6 / 10.0'
    }
  ],
  certifications: [
    'Oracle Certified Professional: Java SE 17 Developer',
    'Confluent Certified Developer for Apache Kafka (In Progress)',
    'HackerRank Problem Solving (Advanced) Certified'
  ],
  masterTexResume: DEFAULT_MASTER_TEX,
  masterQA: DEFAULT_MASTER_QA
};

export const SAMPLE_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-oracle-java-sde-2026',
    title: 'Senior Software Engineer - Cloud Order Management',
    company: 'Oracle',
    location: 'Bangalore, India (Hybrid)',
    url: 'https://careers.oracle.com/jobs/senior-software-engineer-cloud-oms',
    status: 'READY_TO_APPLY',
    createdAt: '2026-08-28T09:30:00Z',
    updatedAt: '2026-08-29T11:15:00Z',
    notes: 'Strong alignment with Java 17, Spring Boot, distributed order workflows, and Kafka event streaming.',
    jobDescription: `About the Role:
Oracle is looking for a Software Engineer to join our Cloud Order Management and Transaction Platform team in Bangalore. You will be building resilient, distributed backend services that process millions of transactions per day for global enterprise customers.

Key Responsibilities:
- Design, develop, and maintain high-performance microservices in Java and Spring Boot.
- Implement event-driven asynchronous processing pipelines using Apache Kafka and message brokers.
- Build and maintain secure, high-throughput REST APIs and integration points.
- Collaborate with database engineers to optimize PostgreSQL / Oracle DB schemas, queries, and caching strategies.
- Maintain high code quality through rigorous automated testing (JUnit, Mockito) and CI/CD best practices.

Requirements:
- Bachelor's degree in Computer Science, Engineering, or related technical field.
- 1-4 years of hands-on software development experience with Java (8/11/17) and Spring Boot.
- Proven experience with distributed systems, microservices architecture, and Apache Kafka.
- Strong knowledge of relational databases (PostgreSQL, Oracle DB) and caching mechanisms (Redis).
- Familiarity with modern frontend technologies like React or TypeScript is a plus.
- Excellent analytical, debugging, and communication skills.`,
    analysis: {
      title: 'Senior Software Engineer - Cloud Order Management',
      company: 'Oracle',
      location: 'Bangalore, India (Hybrid)',
      seniority: 'Mid-Senior Level (1-4 years)',
      jobType: 'Full-time / Hybrid',
      summary: 'Oracle is hiring a Software Engineer to build high-performance distributed microservices and event-driven transaction processing pipelines using Java, Spring Boot, and Kafka for Cloud Order Management.',
      technicalRequirements: [
        { name: 'Java (8/11/17)', category: 'language', importance: 'must-have', evidenceInJD: 'Hands-on software development experience with Java (8/11/17)' },
        { name: 'Spring Boot', category: 'framework', importance: 'must-have', evidenceInJD: 'Design, develop, and maintain high-performance microservices in Java and Spring Boot.' },
        { name: 'Apache Kafka', category: 'architecture', importance: 'must-have', evidenceInJD: 'Implement event-driven asynchronous processing pipelines using Apache Kafka' },
        { name: 'Microservices Architecture', category: 'architecture', importance: 'must-have', evidenceInJD: 'Proven experience with distributed systems, microservices architecture' },
        { name: 'REST APIs', category: 'architecture', importance: 'must-have', evidenceInJD: 'Build and maintain secure, high-throughput REST APIs and integration points' },
        { name: 'PostgreSQL / Relational DB', category: 'database', importance: 'must-have', evidenceInJD: 'Strong knowledge of relational databases (PostgreSQL, Oracle DB)' },
        { name: 'Redis Caching', category: 'database', importance: 'preferred', evidenceInJD: 'caching mechanisms (Redis)' },
        { name: 'JUnit / Mockito Testing', category: 'tool', importance: 'must-have', evidenceInJD: 'automated testing (JUnit, Mockito) and CI/CD best practices' },
        { name: 'React / TypeScript', category: 'framework', importance: 'preferred', evidenceInJD: 'Familiarity with modern frontend technologies like React or TypeScript is a plus' }
      ],
      softSkillRequirements: [
        { name: 'Analytical & Problem Solving', category: 'soft-skill', importance: 'must-have' },
        { name: 'Cross-functional Collaboration', category: 'soft-skill', importance: 'preferred' },
        { name: 'Clear Technical Communication', category: 'soft-skill', importance: 'must-have' }
      ],
      responsibilities: [
        'Design and deploy resilient Java/Spring Boot microservices for global transaction pipelines.',
        'Implement fault-tolerant Kafka event streaming with partition strategies and dead-letter topics.',
        'Tune relational database queries and caching layers to guarantee sub-50ms SLA response times.',
        'Drive automated test automation and contract verification for API integrations.'
      ],
      keywords: [
        { term: 'Java 17', importance: 1.0, category: 'technical', occurrences: 4 },
        { term: 'Spring Boot', importance: 1.0, category: 'technical', occurrences: 3 },
        { term: 'Apache Kafka', importance: 0.95, category: 'technical', occurrences: 3 },
        { term: 'Microservices', importance: 0.9, category: 'technical', occurrences: 3 },
        { term: 'Order Management System', importance: 0.85, category: 'domain', occurrences: 2 },
        { term: 'REST APIs', importance: 0.85, category: 'technical', occurrences: 2 },
        { term: 'PostgreSQL', importance: 0.8, category: 'technical', occurrences: 2 },
        { term: 'Redis', importance: 0.75, category: 'technical', occurrences: 1 },
        { term: 'JUnit / Mockito', importance: 0.7, category: 'technical', occurrences: 1 },
        { term: 'Event-Driven', importance: 0.85, category: 'technical', occurrences: 2 }
      ],
      domainTerms: ['Order Management', 'Transaction Processing', 'Low Latency', 'Event-Driven Architecture', 'Cloud Infrastructure'],
      prioritySkills: ['Java 17', 'Spring Boot', 'Apache Kafka', 'Microservices', 'PostgreSQL', 'REST APIs']
    },
    match: {
      overallScore: 92,
      mustHaveScore: 96,
      matches: [
        { requirement: 'Java (8/11/17)', importance: 'must-have', status: 'strong', candidateEvidence: ['Core language at Wissen/Morgan Stanley', 'Lead Developer on Order Processing Engine', 'OCP Java 17 Certified'], confidence: 0.98 },
        { requirement: 'Spring Boot', importance: 'must-have', status: 'strong', candidateEvidence: ['Production OMS microservices development', 'REST API gateway integrations'], confidence: 0.96 },
        { requirement: 'Apache Kafka', importance: 'must-have', status: 'strong', candidateEvidence: ['Kafka event pipelines with consumer group partitioning & DLQ handling at Morgan Stanley'], confidence: 0.95 },
        { requirement: 'Microservices Architecture', importance: 'must-have', status: 'strong', candidateEvidence: ['Designed low-latency microservices for cash equities order workflows'], confidence: 0.92 },
        { requirement: 'REST APIs', importance: 'must-have', status: 'strong', candidateEvidence: ['Contract-first OpenAPI development and integration'], confidence: 0.94 },
        { requirement: 'PostgreSQL / Relational DB', importance: 'must-have', status: 'strong', candidateEvidence: ['Database query tuning & PostgreSQL indexing reducing latency by 35%'], confidence: 0.90 },
        { requirement: 'Redis Caching', importance: 'preferred', status: 'strong', candidateEvidence: ['Distributed lock management & multi-level caching with Redis'], confidence: 0.90 },
        { requirement: 'JUnit / Mockito Testing', importance: 'must-have', status: 'strong', candidateEvidence: ['Maintained 88%+ code coverage with JUnit 5 & Mockito'], confidence: 0.92 },
        { requirement: 'React / TypeScript', importance: 'preferred', status: 'strong', candidateEvidence: ['Trader UI dashboards with React & TypeScript'], confidence: 0.88 }
      ],
      gaps: [],
      strongAlignments: ['Java 17 & Spring Boot OMS Microservices', 'High-throughput Kafka event streaming', 'PostgreSQL performance optimization', 'Order Management domain expertise'],
      recommendations: [
        'Emphasize asynchronous transaction handling and Kafka partitioning in the resume bullets.',
        'Highlight query optimization metrics (35% latency reduction in PostgreSQL).',
        'Lead with Order Management System (OMS) experience in the professional summary.'
      ]
    }
  }
];
