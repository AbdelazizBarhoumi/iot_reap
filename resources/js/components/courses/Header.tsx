import { Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, Home, Menu, Server, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dashboard } from "@/routes";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { url, props } = usePage();
  const auth = props.auth as { user?: { id: string; name: string } | null } | undefined;
  const isTeacher = url.startsWith("/learn/teacher");
  const isStudent =
    url.startsWith("/learn/student") ||
    url.startsWith("/learn/course") ||
    url.startsWith("/learn/lesson");
  const isAdmin = url.startsWith("/learn/admin");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Server className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium hidden sm:inline">IoT-REAP</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            href="/learn"
            className="flex items-center gap-2 font-heading text-xl font-bold text-foreground"
          >
            <GraduationCap className="h-7 w-7 text-primary" />
            LearnLab
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/learn/student"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isStudent ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Browse Courses
          </Link>
          <Link
            href="/learn/teacher"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isTeacher ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Teach
          </Link>
          <Link
            href="/learn/admin"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isAdmin ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Admin
          </Link>
          {auth?.user && (
            <Button variant="outline" size="sm" asChild>
              <Link href={dashboard()}>
                <Home className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
          )}
          <Button size="sm" className="bg-primary text-white hover:bg-primary/90" asChild>
            <Link href="/learn/student">
              <BookOpen className="mr-2 h-4 w-4" /> Start Learning
            </Link>
          </Button>
        </nav>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-white/90 dark:bg-gray-900/90 md:hidden"
          >
            <div className="container flex flex-col gap-3 py-4">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                <Home className="inline-block mr-2 h-4 w-4" />IoT-REAP Home
              </Link>
              <Link
                href="/learn/student"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Browse Courses
              </Link>
              <Link
                href="/learn/teacher"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Teach
              </Link>
              <Link
                href="/learn/admin"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </Link>
              {auth?.user && (
                <Link
                  href={dashboard()}
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-primary text-white hover:bg-primary/90" asChild>
                  <Link href="/learn/student" onClick={() => setMobileOpen(false)}>
                    Start Learning
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
