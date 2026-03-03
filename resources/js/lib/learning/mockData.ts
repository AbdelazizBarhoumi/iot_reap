export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  modules: Module[];
  hasVirtualMachine?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'practice' | 'vm-lab';
  duration: string;
  completed?: boolean;
  content?: string;
  objectives?: string[];
  vmEnabled?: boolean;
  videoUrl?: string;
  resources?: string[];
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Full-Stack Web Development Bootcamp',
    description: 'Master modern web development from front-end to back-end. Build real-world projects with React, Node.js, and databases.',
    instructor: 'Dr. Sarah Chen',
    thumbnail: '',
    category: 'Web Development',
    level: 'Beginner',
    duration: '48 hours',
    students: 12450,
    rating: 4.8,
    hasVirtualMachine: true,
    modules: [
      {
        id: 'm1',
        title: 'Getting Started with HTML & CSS',
        lessons: [
          { id: 'l1', title: 'Introduction to Web Development', type: 'video', duration: '15 min', completed: true, content: 'In this lesson, we explore the fundamentals of web development. You will learn about how the internet works, the role of browsers, and the basic technologies that power the modern web — HTML, CSS, and JavaScript.', objectives: ['Understand how the web works', 'Learn about HTTP requests and responses', 'Set up your development environment'] },
          { id: 'l2', title: 'HTML Fundamentals', type: 'reading', duration: '20 min', completed: true, content: 'HTML (HyperText Markup Language) is the backbone of every web page. In this reading, you will learn about HTML elements, attributes, semantic tags, and how to structure a web page properly using headings, paragraphs, lists, links, and images.', objectives: ['Write valid HTML5 markup', 'Use semantic elements correctly', 'Create accessible page structures'] },
          { id: 'l3', title: 'CSS Styling Basics', type: 'video', duration: '25 min', completed: false, content: 'CSS (Cascading Style Sheets) brings your HTML to life with colors, layouts, and responsive designs. This lesson covers selectors, the box model, flexbox, and grid layout systems.', objectives: ['Apply CSS selectors and specificity', 'Master the box model', 'Build responsive layouts with flexbox'] },
          { id: 'l4', title: 'Build Your First Page', type: 'practice', duration: '30 min', completed: false, content: 'Put your HTML and CSS knowledge to the test! In this hands-on exercise, you will build a complete landing page from scratch. Follow the design mockup provided and implement it step by step.', objectives: ['Combine HTML and CSS skills', 'Build a complete web page', 'Practice responsive design techniques'] },
        ],
      },
      {
        id: 'm2',
        title: 'JavaScript Essentials',
        lessons: [
          { id: 'l5', title: 'Variables and Data Types', type: 'video', duration: '20 min', content: 'JavaScript variables are containers for storing data values. Learn about let, const, var, and the different data types including strings, numbers, booleans, arrays, and objects.', objectives: ['Declare variables with let, const, and var', 'Work with primitive and complex data types'] },
          { id: 'l6', title: 'Functions and Scope', type: 'video', duration: '25 min', content: 'Functions are reusable blocks of code. This lesson covers function declarations, arrow functions, parameters, return values, and the important concept of scope — how JavaScript determines variable accessibility.', objectives: ['Write and call functions', 'Understand lexical scope and closures'] },
          { id: 'l7', title: 'DOM Manipulation', type: 'practice', duration: '35 min', content: 'The Document Object Model (DOM) lets JavaScript interact with HTML elements. Practice selecting elements, changing content, adding event listeners, and dynamically updating the page.', objectives: ['Select and modify DOM elements', 'Handle user events', 'Create dynamic page content'] },
          { id: 'l8', title: 'JS Coding Lab', type: 'vm-lab', duration: '45 min', vmEnabled: true, content: 'Open the virtual machine terminal and practice JavaScript in a real Node.js environment. Complete the coding challenges by writing and running scripts directly in the terminal.', objectives: ['Run JavaScript in a terminal environment', 'Debug code using console output', 'Complete 5 coding challenges'] },
        ],
      },
      {
        id: 'm3',
        title: 'React Fundamentals',
        lessons: [
          { id: 'l9', title: 'Introduction to React', type: 'video', duration: '20 min', content: 'React is a powerful JavaScript library for building user interfaces. Learn about components, JSX syntax, and the virtual DOM that makes React so fast and efficient.', objectives: ['Understand component-based architecture', 'Write JSX syntax'] },
          { id: 'l10', title: 'Components and Props', type: 'reading', duration: '15 min', content: 'Components are the building blocks of React applications. This reading covers functional components, passing data through props, prop types, default props, and component composition patterns.', objectives: ['Create reusable components', 'Pass and validate props'] },
          { id: 'l11', title: 'State and Lifecycle', type: 'video', duration: '30 min', content: 'State is what makes React applications interactive. Learn about useState, useEffect, and how React manages component lifecycle to keep your UI in sync with your data.', objectives: ['Manage component state with hooks', 'Handle side effects with useEffect'] },
          { id: 'l12', title: 'React Project Lab', type: 'vm-lab', duration: '60 min', vmEnabled: true, content: 'Build a complete React application from scratch in the virtual machine. You will create a task manager app with add, delete, and filter functionality using everything you have learned.', objectives: ['Bootstrap a React project', 'Build a full CRUD application', 'Deploy your first React app'] },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Cloud Computing & DevOps Mastery',
    description: 'Learn cloud infrastructure, containerization, CI/CD pipelines, and modern DevOps practices with hands-on labs.',
    instructor: 'James Rodriguez',
    thumbnail: '',
    category: 'Cloud & DevOps',
    level: 'Intermediate',
    duration: '36 hours',
    students: 8320,
    rating: 4.7,
    hasVirtualMachine: true,
    modules: [
      {
        id: 'm4',
        title: 'Cloud Fundamentals',
        lessons: [
          { id: 'l13', title: 'What is Cloud Computing?', type: 'video', duration: '20 min', content: 'Cloud computing delivers computing services over the internet. This lesson covers IaaS, PaaS, SaaS models, major cloud providers, and when to use each service type.', objectives: ['Distinguish between cloud service models', 'Compare major cloud providers'] },
          { id: 'l14', title: 'Cloud Service Models', type: 'reading', duration: '15 min', content: 'Deep dive into Infrastructure as a Service, Platform as a Service, and Software as a Service. Learn the trade-offs, pricing models, and real-world use cases for each.', objectives: ['Choose the right service model', 'Estimate cloud costs'] },
          { id: 'l15', title: 'Setting Up Your Cloud Environment', type: 'vm-lab', duration: '40 min', vmEnabled: true, content: 'Use the virtual machine to set up a cloud environment from scratch. Configure a virtual server, set up networking, and deploy a simple application.', objectives: ['Provision cloud resources', 'Configure networking and security groups', 'Deploy a web application'] },
        ],
      },
      {
        id: 'm5',
        title: 'Docker & Containers',
        lessons: [
          { id: 'l16', title: 'Container Basics', type: 'video', duration: '25 min', content: 'Containers package applications with their dependencies for consistent deployment. Learn Docker fundamentals, images vs containers, and the container lifecycle.', objectives: ['Understand containerization concepts', 'Pull and run Docker images'] },
          { id: 'l17', title: 'Docker Hands-on Lab', type: 'vm-lab', duration: '50 min', vmEnabled: true, content: 'Get hands-on with Docker in this lab. Build custom Docker images, write Dockerfiles, manage containers, and set up multi-container applications with Docker Compose.', objectives: ['Write production Dockerfiles', 'Use Docker Compose for multi-service apps'] },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Data Science with Python',
    description: 'From data analysis to machine learning. Master Python, pandas, scikit-learn, and build predictive models.',
    instructor: 'Dr. Emily Watson',
    thumbnail: '',
    category: 'Data Science',
    level: 'Intermediate',
    duration: '42 hours',
    students: 15600,
    rating: 4.9,
    modules: [
      {
        id: 'm6',
        title: 'Python for Data Science',
        lessons: [
          { id: 'l18', title: 'Python Refresher', type: 'video', duration: '25 min', content: 'A quick refresher on Python fundamentals tailored for data science. Covers data structures, list comprehensions, file I/O, and essential libraries.', objectives: ['Review Python fundamentals', 'Work with files and data structures'] },
          { id: 'l19', title: 'NumPy & Pandas', type: 'practice', duration: '35 min', content: 'NumPy provides powerful numerical computing, while Pandas excels at data manipulation. Practice creating arrays, DataFrames, filtering, grouping, and transforming data.', objectives: ['Create and manipulate NumPy arrays', 'Perform data analysis with Pandas'] },
          { id: 'l20', title: 'Data Visualization', type: 'video', duration: '30 min', content: 'Visualization turns data into insight. Learn to create compelling charts and graphs with Matplotlib and Seaborn, including bar charts, scatter plots, heatmaps, and dashboards.', objectives: ['Create publication-quality visualizations', 'Choose the right chart type for your data'] },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Cybersecurity Fundamentals',
    description: 'Learn network security, ethical hacking, and defense strategies. Includes hands-on penetration testing labs.',
    instructor: 'Alex Thompson',
    thumbnail: '',
    category: 'Cybersecurity',
    level: 'Beginner',
    duration: '30 hours',
    students: 6780,
    rating: 4.6,
    hasVirtualMachine: true,
    modules: [
      {
        id: 'm7',
        title: 'Security Basics',
        lessons: [
          { id: 'l21', title: 'Introduction to Cybersecurity', type: 'video', duration: '20 min', content: 'Cybersecurity protects systems, networks, and data from digital attacks. Learn about threat landscapes, attack vectors, and the CIA triad of security.', objectives: ['Understand the cybersecurity landscape', 'Identify common attack vectors'] },
          { id: 'l22', title: 'Network Security Lab', type: 'vm-lab', duration: '45 min', vmEnabled: true, content: 'Use the virtual machine to practice network security techniques. Scan for vulnerabilities, configure firewalls, and analyze network traffic using industry tools.', objectives: ['Perform network reconnaissance', 'Configure firewall rules', 'Analyze packet captures'] },
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'Mobile App Development with Flutter',
    description: 'Build beautiful cross-platform mobile apps with Flutter and Dart. Deploy to iOS and Android.',
    instructor: 'Maria Garcia',
    thumbnail: '',
    category: 'Mobile Development',
    level: 'Beginner',
    duration: '35 hours',
    students: 9200,
    rating: 4.7,
    modules: [
      {
        id: 'm8',
        title: 'Flutter Basics',
        lessons: [
          { id: 'l23', title: 'Getting Started with Flutter', type: 'video', duration: '20 min', content: 'Flutter is Google\'s UI toolkit for building natively compiled apps. This lesson covers the Flutter architecture, Dart language basics, and setting up your development environment.', objectives: ['Install Flutter SDK', 'Understand the widget tree'] },
          { id: 'l24', title: 'Widgets and Layouts', type: 'reading', duration: '25 min', content: 'Everything in Flutter is a widget. Learn about stateless and stateful widgets, layout widgets like Row, Column, Stack, and how to create responsive layouts for different screen sizes.', objectives: ['Build complex layouts with widgets', 'Create responsive mobile UIs'] },
          { id: 'l25', title: 'Build a Todo App', type: 'practice', duration: '40 min', content: 'Apply your Flutter skills by building a complete Todo application. Implement state management, persistent storage, and beautiful Material Design UI components.', objectives: ['Build a complete mobile app', 'Implement state management', 'Add local data persistence'] },
        ],
      },
    ],
  },
  {
    id: '6',
    title: 'AI & Machine Learning Engineering',
    description: 'Deep dive into neural networks, NLP, computer vision, and deploy ML models to production.',
    instructor: 'Prof. David Kim',
    thumbnail: '',
    category: 'AI & ML',
    level: 'Advanced',
    duration: '56 hours',
    students: 11400,
    rating: 4.8,
    modules: [
      {
        id: 'm9',
        title: 'Neural Networks',
        lessons: [
          { id: 'l26', title: 'Perceptrons and Activation', type: 'video', duration: '30 min', content: 'Neural networks are inspired by biological neurons. Learn about perceptrons, activation functions (ReLU, sigmoid, softmax), and how networks learn through forward and backward propagation.', objectives: ['Understand neural network architecture', 'Implement activation functions'] },
          { id: 'l27', title: 'Building Your First NN', type: 'practice', duration: '45 min', content: 'Build a neural network from scratch using Python and NumPy. Then rebuild it with PyTorch to understand the difference between manual and framework-based implementations.', objectives: ['Implement a neural network from scratch', 'Train a model on real data'] },
        ],
      },
    ],
  },
];

export const categories = [
  'Web Development',
  'Cloud & DevOps',
  'Data Science',
  'Cybersecurity',
  'Mobile Development',
  'AI & ML',
];

export const teacherStats = {
  totalCourses: 3,
  totalStudents: 36570,
  totalRevenue: '$45,230',
  avgRating: 4.8,
};
