<?php

namespace Database\Seeders;

use App\Enums\CourseLevel;
use App\Enums\CourseStatus;
use App\Enums\LessonType;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Seeder for courses, modules, and lessons.
 * Recreates the mock data from the frontend.
 */
class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create an instructor
        $instructor = User::where('email', 'instructor@example.com')->first();
        if (!$instructor) {
            $instructor = User::factory()->create([
                'name' => 'Dr. Sarah Chen',
                'email' => 'instructor@example.com',
            ]);
        }

        $secondInstructor = User::where('email', 'instructor2@example.com')->first();
        if (!$secondInstructor) {
            $secondInstructor = User::factory()->create([
                'name' => 'James Rodriguez',
                'email' => 'instructor2@example.com',
            ]);
        }

        // Course 1: Full-Stack Web Development
        $course1 = Course::create([
            'title' => 'Full-Stack Web Development Bootcamp',
            'description' => 'Master modern web development from front-end to back-end. Build real-world projects with React, Node.js, and databases.',
            'instructor_id' => $instructor->id,
            'category' => 'Web Development',
            'level' => CourseLevel::BEGINNER,
            'duration' => '48 hours',
            'rating' => 4.8,
            'has_virtual_machine' => true,
            'status' => CourseStatus::APPROVED,
        ]);

        // Module 1: HTML & CSS
        $module1 = CourseModule::create([
            'course_id' => $course1->id,
            'title' => 'Getting Started with HTML & CSS',
            'sort_order' => 0,
        ]);

        Lesson::insert([
            [
                'module_id' => $module1->id,
                'title' => 'Introduction to Web Development',
                'type' => LessonType::VIDEO->value,
                'duration' => '15 min',
                'content' => 'In this lesson, we explore the fundamentals of web development. You will learn about how the internet works, the role of browsers, and the basic technologies that power the modern web — HTML, CSS, and JavaScript.',
                'objectives' => json_encode(['Understand how the web works', 'Learn about HTTP requests and responses', 'Set up your development environment']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module1->id,
                'title' => 'HTML Fundamentals',
                'type' => LessonType::READING->value,
                'duration' => '20 min',
                'content' => 'HTML (HyperText Markup Language) is the backbone of every web page. In this reading, you will learn about HTML elements, attributes, semantic tags, and how to structure a web page properly.',
                'objectives' => json_encode(['Write valid HTML5 markup', 'Use semantic elements correctly', 'Create accessible page structures']),
                'vm_enabled' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module1->id,
                'title' => 'CSS Styling Basics',
                'type' => LessonType::VIDEO->value,
                'duration' => '25 min',
                'content' => 'CSS (Cascading Style Sheets) brings your HTML to life with colors, layouts, and responsive designs. This lesson covers selectors, the box model, flexbox, and grid layout systems.',
                'objectives' => json_encode(['Apply CSS selectors and specificity', 'Master the box model', 'Build responsive layouts with flexbox']),
                'vm_enabled' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module1->id,
                'title' => 'Build Your First Page',
                'type' => LessonType::PRACTICE->value,
                'duration' => '30 min',
                'content' => 'Put your HTML and CSS knowledge to the test! In this hands-on exercise, you will build a complete landing page from scratch.',
                'objectives' => json_encode(['Combine HTML and CSS skills', 'Build a complete web page', 'Practice responsive design techniques']),
                'vm_enabled' => false,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Module 2: JavaScript Essentials
        $module2 = CourseModule::create([
            'course_id' => $course1->id,
            'title' => 'JavaScript Essentials',
            'sort_order' => 1,
        ]);

        Lesson::insert([
            [
                'module_id' => $module2->id,
                'title' => 'Variables and Data Types',
                'type' => LessonType::VIDEO->value,
                'duration' => '20 min',
                'content' => 'JavaScript variables are containers for storing data values. Learn about let, const, var, and the different data types.',
                'objectives' => json_encode(['Declare variables with let, const, and var', 'Work with primitive and complex data types']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module2->id,
                'title' => 'Functions and Scope',
                'type' => LessonType::VIDEO->value,
                'duration' => '25 min',
                'content' => 'Functions are reusable blocks of code. This lesson covers function declarations, arrow functions, and scope.',
                'objectives' => json_encode(['Write and call functions', 'Understand lexical scope and closures']),
                'vm_enabled' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module2->id,
                'title' => 'JS Coding Lab',
                'type' => LessonType::VM_LAB->value,
                'duration' => '45 min',
                'content' => 'Open the virtual machine terminal and practice JavaScript in a real Node.js environment. Complete the coding challenges.',
                'objectives' => json_encode(['Run JavaScript in a terminal environment', 'Debug code using console output', 'Complete 5 coding challenges']),
                'vm_enabled' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Module 3: React Fundamentals
        $module3 = CourseModule::create([
            'course_id' => $course1->id,
            'title' => 'React Fundamentals',
            'sort_order' => 2,
        ]);

        Lesson::insert([
            [
                'module_id' => $module3->id,
                'title' => 'Introduction to React',
                'type' => LessonType::VIDEO->value,
                'duration' => '20 min',
                'content' => 'React is a powerful JavaScript library for building user interfaces. Learn about components, JSX syntax, and the virtual DOM.',
                'objectives' => json_encode(['Understand component-based architecture', 'Write JSX syntax']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module3->id,
                'title' => 'React Project Lab',
                'type' => LessonType::VM_LAB->value,
                'duration' => '60 min',
                'content' => 'Build a complete React application from scratch in the virtual machine.',
                'objectives' => json_encode(['Bootstrap a React project', 'Build a full CRUD application', 'Deploy your first React app']),
                'vm_enabled' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Course 2: Cloud Computing & DevOps
        $course2 = Course::create([
            'title' => 'Cloud Computing & DevOps Mastery',
            'description' => 'Learn cloud infrastructure, containerization, CI/CD pipelines, and modern DevOps practices with hands-on labs.',
            'instructor_id' => $secondInstructor->id,
            'category' => 'Cloud & DevOps',
            'level' => CourseLevel::INTERMEDIATE,
            'duration' => '36 hours',
            'rating' => 4.7,
            'has_virtual_machine' => true,
            'status' => CourseStatus::APPROVED,
        ]);

        $module4 = CourseModule::create([
            'course_id' => $course2->id,
            'title' => 'Cloud Fundamentals',
            'sort_order' => 0,
        ]);

        Lesson::insert([
            [
                'module_id' => $module4->id,
                'title' => 'What is Cloud Computing?',
                'type' => LessonType::VIDEO->value,
                'duration' => '20 min',
                'content' => 'Cloud computing delivers computing services over the internet. This lesson covers IaaS, PaaS, SaaS models.',
                'objectives' => json_encode(['Distinguish between cloud service models', 'Compare major cloud providers']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module4->id,
                'title' => 'Setting Up Your Cloud Environment',
                'type' => LessonType::VM_LAB->value,
                'duration' => '40 min',
                'content' => 'Use the virtual machine to set up a cloud environment from scratch.',
                'objectives' => json_encode(['Provision cloud resources', 'Configure networking and security groups', 'Deploy a web application']),
                'vm_enabled' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $module5 = CourseModule::create([
            'course_id' => $course2->id,
            'title' => 'Docker & Containers',
            'sort_order' => 1,
        ]);

        Lesson::insert([
            [
                'module_id' => $module5->id,
                'title' => 'Container Basics',
                'type' => LessonType::VIDEO->value,
                'duration' => '25 min',
                'content' => 'Containers package applications with their dependencies for consistent deployment.',
                'objectives' => json_encode(['Understand containerization concepts', 'Pull and run Docker images']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module5->id,
                'title' => 'Docker Hands-on Lab',
                'type' => LessonType::VM_LAB->value,
                'duration' => '50 min',
                'content' => 'Get hands-on with Docker in this lab. Build custom Docker images and use Docker Compose.',
                'objectives' => json_encode(['Write production Dockerfiles', 'Use Docker Compose for multi-service apps']),
                'vm_enabled' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Course 3: Data Science with Python
        $course3 = Course::create([
            'title' => 'Data Science with Python',
            'description' => 'From data analysis to machine learning. Master Python, pandas, scikit-learn, and build predictive models.',
            'instructor_id' => $instructor->id,
            'category' => 'Data Science',
            'level' => CourseLevel::INTERMEDIATE,
            'duration' => '42 hours',
            'rating' => 4.9,
            'has_virtual_machine' => false,
            'status' => CourseStatus::APPROVED,
        ]);

        $module6 = CourseModule::create([
            'course_id' => $course3->id,
            'title' => 'Python for Data Science',
            'sort_order' => 0,
        ]);

        Lesson::insert([
            [
                'module_id' => $module6->id,
                'title' => 'Python Refresher',
                'type' => LessonType::VIDEO->value,
                'duration' => '25 min',
                'content' => 'A quick refresher on Python fundamentals tailored for data science.',
                'objectives' => json_encode(['Review Python fundamentals', 'Work with files and data structures']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module6->id,
                'title' => 'NumPy & Pandas',
                'type' => LessonType::PRACTICE->value,
                'duration' => '35 min',
                'content' => 'NumPy provides powerful numerical computing, while Pandas excels at data manipulation.',
                'objectives' => json_encode(['Create and manipulate NumPy arrays', 'Perform data analysis with Pandas']),
                'vm_enabled' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module6->id,
                'title' => 'Data Visualization',
                'type' => LessonType::VIDEO->value,
                'duration' => '30 min',
                'content' => 'Visualization turns data into insight. Learn to create compelling charts and graphs.',
                'objectives' => json_encode(['Create publication-quality visualizations', 'Choose the right chart type for your data']),
                'vm_enabled' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Course 4: Cybersecurity
        $course4 = Course::create([
            'title' => 'Cybersecurity Fundamentals',
            'description' => 'Learn network security, ethical hacking, and defense strategies. Includes hands-on penetration testing labs.',
            'instructor_id' => $secondInstructor->id,
            'category' => 'Cybersecurity',
            'level' => CourseLevel::BEGINNER,
            'duration' => '30 hours',
            'rating' => 4.6,
            'has_virtual_machine' => true,
            'status' => CourseStatus::APPROVED,
        ]);

        $module7 = CourseModule::create([
            'course_id' => $course4->id,
            'title' => 'Security Basics',
            'sort_order' => 0,
        ]);

        Lesson::insert([
            [
                'module_id' => $module7->id,
                'title' => 'Introduction to Cybersecurity',
                'type' => LessonType::VIDEO->value,
                'duration' => '20 min',
                'content' => 'Cybersecurity protects systems, networks, and data from digital attacks.',
                'objectives' => json_encode(['Understand the cybersecurity landscape', 'Identify common attack vectors']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module7->id,
                'title' => 'Network Security Lab',
                'type' => LessonType::VM_LAB->value,
                'duration' => '45 min',
                'content' => 'Use the virtual machine to practice network security techniques.',
                'objectives' => json_encode(['Perform network reconnaissance', 'Configure firewall rules', 'Analyze packet captures']),
                'vm_enabled' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Course 5: Mobile Development
        $course5 = Course::create([
            'title' => 'Mobile App Development with Flutter',
            'description' => 'Build beautiful cross-platform mobile apps with Flutter and Dart. Deploy to iOS and Android.',
            'instructor_id' => $instructor->id,
            'category' => 'Mobile Development',
            'level' => CourseLevel::BEGINNER,
            'duration' => '35 hours',
            'rating' => 4.7,
            'has_virtual_machine' => false,
            'status' => CourseStatus::APPROVED,
        ]);

        $module8 = CourseModule::create([
            'course_id' => $course5->id,
            'title' => 'Flutter Basics',
            'sort_order' => 0,
        ]);

        Lesson::insert([
            [
                'module_id' => $module8->id,
                'title' => 'Getting Started with Flutter',
                'type' => LessonType::VIDEO->value,
                'duration' => '20 min',
                'content' => 'Flutter is Google\'s UI toolkit for building natively compiled apps.',
                'objectives' => json_encode(['Install Flutter SDK', 'Understand the widget tree']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module8->id,
                'title' => 'Widgets and Layouts',
                'type' => LessonType::READING->value,
                'duration' => '25 min',
                'content' => 'Everything in Flutter is a widget. Learn about stateless and stateful widgets.',
                'objectives' => json_encode(['Build complex layouts with widgets', 'Create responsive mobile UIs']),
                'vm_enabled' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module8->id,
                'title' => 'Build a Todo App',
                'type' => LessonType::PRACTICE->value,
                'duration' => '40 min',
                'content' => 'Apply your Flutter skills by building a complete Todo application.',
                'objectives' => json_encode(['Build a complete mobile app', 'Implement state management', 'Add local data persistence']),
                'vm_enabled' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Course 6: AI & ML (Advanced)
        $course6 = Course::create([
            'title' => 'AI & Machine Learning Engineering',
            'description' => 'Deep dive into neural networks, NLP, computer vision, and deploy ML models to production.',
            'instructor_id' => $secondInstructor->id,
            'category' => 'AI & ML',
            'level' => CourseLevel::ADVANCED,
            'duration' => '56 hours',
            'rating' => 4.8,
            'has_virtual_machine' => false,
            'status' => CourseStatus::APPROVED,
        ]);

        $module9 = CourseModule::create([
            'course_id' => $course6->id,
            'title' => 'Neural Networks',
            'sort_order' => 0,
        ]);

        Lesson::insert([
            [
                'module_id' => $module9->id,
                'title' => 'Perceptrons and Activation',
                'type' => LessonType::VIDEO->value,
                'duration' => '30 min',
                'content' => 'Neural networks are inspired by biological neurons. Learn about perceptrons and activation functions.',
                'objectives' => json_encode(['Understand neural network architecture', 'Implement activation functions']),
                'vm_enabled' => false,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module_id' => $module9->id,
                'title' => 'Building Your First NN',
                'type' => LessonType::PRACTICE->value,
                'duration' => '45 min',
                'content' => 'Build a neural network from scratch using Python and NumPy.',
                'objectives' => json_encode(['Implement a neural network from scratch', 'Train a model on real data']),
                'vm_enabled' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info('Seeded 6 courses with modules and lessons.');
    }
}
