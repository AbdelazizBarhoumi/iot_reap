import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Star,
    Users,
    Terminal,
    Clock,
    ArrowRight,
    BookOpen,
    Globe,
    Cloud,
    BarChart3,
    Lock,
    Smartphone,
    Cpu,
    Plug,
    Network,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    thumbnail?: string | null;
    modules?: { lessons: unknown[] }[];
}
const levelConfig: Record<string, { color: string; bg: string }> = {
    Beginner: {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    },
    Intermediate: {
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    },
    Advanced: {
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
    },
};
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Web Development': Globe,
    'Cloud & DevOps': Cloud,
    'Data Science': BarChart3,
    'Cybersecurity': Lock,
    'Mobile Development': Smartphone,
    'AI & ML': Cpu,
    'IoT & Embedded': Plug,
    'Networking': Network,
    'General': BookOpen,
};
const categoryGradients: Record<string, string> = {
    'Web Development': 'from-blue-500/20 to-primary/20',
    'Cloud & DevOps': 'from-purple-500/20 to-indigo-500/20',
    'Data Science': 'from-green-500/20 to-primary/20',
    'Cybersecurity': 'from-red-500/20 to-orange-500/20',
    'Mobile Development': 'from-cyan-500/20 to-sky-500/20',
    'AI & ML': 'from-violet-500/20 to-fuchsia-500/20',
    'IoT & Embedded': 'from-yellow-500/20 to-amber-500/20',
    'Networking': 'from-teal-500/20 to-green-500/20',
    'General': 'from-gray-500/20 to-secondary/20',
};
const CourseCard = ({
    course,
    index = 0,
}: {
    course: CourseCardData;
    index?: number;
}) => {
    const lessonCount =
        course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
    const levelStyle = levelConfig[course.level] ?? levelConfig.Beginner;
    const gradient =
        categoryGradients[course.category] ||
        'from-primary/80 via-primary/70 to-secondary/80';
    const IconComponent = categoryIcons[course.category] || BookOpen;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="h-full"
        >
            <Link href={`/courses/${course.id}`} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                    {/* Header with gradient background */}
                    <div
                        className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}
                    >
                        {/* Pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                backgroundSize: '24px 24px',
                            }}
                        />
                        {/* Category icon */}
                        <div className="absolute top-4 left-4 drop-shadow-lg">
                            <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        {/* VM Labs badge */}
                        {course.hasVirtualMachine && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.08 + 0.2 }}
                                className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                            >
                                <Terminal className="h-3.5 w-3.5" />
                                <span>VM Labs</span>
                            </motion.div>
                        )}
                        {/* Category text */}
                        <div className="absolute right-4 bottom-4 left-4">
                            <span className="text-xs font-medium tracking-wider text-white/80 uppercase">
                                {course.category}
                            </span>
                        </div>
                        {/* Hover overlay with arrow */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                            <div className="flex h-12 w-12 scale-0 transform items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
                                <ArrowRight className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                        {/* Level and duration badges */}
                        <div className="mb-3 flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-xs font-medium ${levelStyle.bg} ${levelStyle.color}`}
                            >
                                {course.level}
                            </Badge>
                            {course.duration && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {course.duration}
                                </span>
                            )}
                            {lessonCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <BookOpen className="h-3 w-3" />
                                    {lessonCount} lessons
                                </span>
                            )}
                        </div>
                        {/* Title */}
                        <h3 className="mb-2 line-clamp-2 font-heading text-lg leading-tight font-bold text-card-foreground transition-colors group-hover:text-primary">
                            {course.title}
                        </h3>
                        {/* Description */}
                        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
                            {course.description}
                        </p>
                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                            <span className="text-sm font-medium text-foreground">
                                {course.instructor}
                            </span>
                            <div className="flex items-center gap-3">
                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3.5 w-3.5 ${i < Math.floor(course.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                                        {course.rating.toFixed(1)}
                                    </span>
                                </div>
                                {/* Students */}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" />
                                    {course.students >= 1000
                                        ? `${(course.students / 1000).toFixed(1)}k`
                                        : course.students.toLocaleString()}
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


