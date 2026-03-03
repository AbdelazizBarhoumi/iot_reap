import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Star, Users, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * CourseCard only displays a subset of course properties.
 * This interface allows both full Course objects and mock data to be used.
 */
interface CourseCardData {
  id: string | number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string | null;
  rating: number;
  students: number;
  hasVirtualMachine?: boolean;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-success/10 text-success border-success/20",
  Intermediate: "bg-warning/10 text-warning border-warning/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const categoryGradients: Record<string, string> = {
  'Web Development': 'from-blue-500/20 to-primary/20',
  'Cloud & DevOps': 'from-purple-500/20 to-indigo-500/20',
  'Data Science': 'from-green-500/20 to-primary/20',
  'Cybersecurity': 'from-red-500/20 to-orange-500/20',
  'Mobile Development': 'from-cyan-500/20 to-sky-500/20',
  'AI & ML': 'from-violet-500/20 to-fuchsia-500/20',
};

const CourseCard = ({ course, index = 0 }: { course: CourseCardData; index?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/courses/${course.id}`} className="group block">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:ring-2 hover:ring-ring">
          <div className={`h-40 bg-gradient-to-br ${categoryGradients[course.category] || 'from-primary/20 to-secondary/20'} flex items-center justify-center relative`}>
            <span className="font-heading text-lg font-bold text-foreground/60">{course.category}</span>
            {course.hasVirtualMachine && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                <Terminal className="h-3 w-3" /> VM Labs
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${levelColors[course.level]}`}>
                {course.level}
              </Badge>
              <span className="text-xs text-muted-foreground">{course.duration}</span>
            </div>
            <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{course.instructor}</span>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {course.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {course.students.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
