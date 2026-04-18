/**
 * Article Edit Page (Teacher)
 * Teacher view for creating and editing article content.
 */
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { ArticleEditor } from '@/components/articles';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Article } from '@/types/article.types';
interface ArticleEditPageProps {
    trainingUnitId: string;
    article: Article | null;
}
export default function ArticleEditPage({
    trainingUnitId,
    article,
}: ArticleEditPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            {
                title: article ? 'Edit Article' : 'Create Article',
                href: `/teaching/trainingUnits/${trainingUnitId}/article`,
            },
        ],
        [trainingUnitId, article],
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={article ? 'Edit Article' : 'Create Article'} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/teaching">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            {article ? 'Edit Article' : 'Create Article'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Write the reading content for this module
                        </p>
                    </div>
                </div>
                <div className="max-w-4xl">
                    <ArticleEditor trainingUnitId={trainingUnitId} article={article} />
                </div>
            </div>
        </AppLayout>
    );
}

