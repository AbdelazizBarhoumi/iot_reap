import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users, Award, ArrowRight, Terminal, Server } from "lucide-react";
import CourseCard from "@/components/courses/CourseCard";
import Header from "@/components/courses/Header";
import { Button } from "@/components/ui/button";
import { LearningAppProvider } from "@/lib/learning/appState";
import { courses } from "@/lib/learning/mockData";

const stats = [
  { icon: BookOpen, label: "Courses", value: "200+" },
  { icon: Users, label: "Students", value: "50,000+" },
  { icon: GraduationCap, label: "Instructors", value: "150+" },
  { icon: Award, label: "Certificates", value: "10,000+" },
];

const LearnpathIndexContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="container relative z-10 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl font-bold leading-tight text-secondary-foreground md:text-6xl">
              Learn by doing.{" "}
              <span className="text-primary">Build the future.</span>
            </h1>
            <p className="mt-6 text-lg text-secondary-foreground/70 max-w-lg">
              Hands-on courses with virtual machine labs. Whether you teach or learn, LearnLab gives you the tools to succeed.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow" asChild>
                <Link href="/learn/student">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
                <Link href="/learn/teacher">
                  <GraduationCap className="mr-2 h-4 w-4" /> Become an Instructor
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-secondary-foreground/60 text-sm">
              <Terminal className="h-4 w-4 text-primary" />
              <span>Includes hands-on virtual machine labs for real-world practice</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">Featured Courses</h2>
              <p className="mt-2 text-muted-foreground">Explore our most popular courses with hands-on labs</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/90" asChild>
              <Link href="/learn/student">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient py-20">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-bold text-secondary-foreground md:text-4xl">
              Ready to start your journey?
            </h2>
            <p className="mt-4 text-secondary-foreground/70 max-w-md mx-auto">
              Join thousands of learners and instructors building the next generation of tech talent.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/learn/student">Explore Courses</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
                <Link href="/learn/teacher">Start Teaching</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Server className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">IoT-REAP</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2 font-heading font-bold text-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              LearnLab
            </div>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 IoT-REAP LearnLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default function LearningIndex() {
  return (
    <LearningAppProvider>
      <LearnpathIndexContent />
    </LearningAppProvider>
  );
}
