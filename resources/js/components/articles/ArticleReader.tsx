/**
 * ArticleReader Component
 * Student-facing article content display.
 */
import { BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Article, TipTapContent, TipTapNode } from '@/types/article.types';
interface ArticleReaderProps {
    article: Article;
    _onComplete?: () => void;
}
export function ArticleReader({ article, _onComplete }: ArticleReaderProps) {
    return (
        <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between border-b">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="font-heading text-lg">
                        Reading Material
                    </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                        {article.word_count} words
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {article.estimated_read_time_minutes} min read
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <RenderContent content={article.content} />
                </div>
            </CardContent>
        </Card>
    );
}
/**
 * Render TipTap JSON content to React elements
 */
function RenderContent({ content }: { content: TipTapContent }) {
    if (!content || !content.content) {
        return <p className="text-muted-foreground">No content available.</p>;
    }
    return (
        <>
            {content.content.map((node, index) => (
                <RenderNode key={index} node={node} />
            ))}
        </>
    );
}
function RenderNode({ node }: { node: TipTapNode }) {
    switch (node.type) {
        case 'paragraph':
            return (
                <p>
                    {node.content?.map((child, i) => (
                        <RenderNode key={i} node={child} />
                    ))}
                </p>
            );
        case 'heading': {
            const level = (node.attrs?.level as number) || 1;
            const HeadingTag =
                `h${Math.min(level, 6)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";        
            return (
                <HeadingTag>
                    {node.content?.map((child, i) => (
                        <RenderNode key={i} node={child} />
                    ))}
                </HeadingTag>
            );
        }
        case 'bulletList':
            return (
                <ul>
                    {node.content?.map((child, i) => (
                        <RenderNode key={i} node={child} />
                    ))}
                </ul>
            );
        case 'orderedList':
            return (
                <ol>
                    {node.content?.map((child, i) => (
                        <RenderNode key={i} node={child} />
                    ))}
                </ol>
            );
        case 'listItem':
            return (
                <li>
                    {node.content?.map((child, i) => (
                        <RenderNode key={i} node={child} />
                    ))}
                </li>
            );
        case 'blockquote':
            return (
                <blockquote className="border-l-4 border-primary/30 pl-4 text-muted-foreground italic">
                    {node.content?.map((child, i) => (
                        <RenderNode key={i} node={child} />
                    ))}
                </blockquote>
            );
        case 'codeBlock':
            return (
                <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                    <code>
                        {node.content?.map((child, i) => (
                            <RenderNode key={i} node={child} />
                        ))}
                    </code>
                </pre>
            );
        case 'text': {
            let element: React.ReactNode = node.text || '';
            // Apply marks (bold, italic, code, etc.)
            if (node.marks) {
                node.marks.forEach((mark) => {
                    switch (mark.type) {
                        case 'bold':
                            element = <strong>{element}</strong>;
                            break;
                        case 'italic':
                            element = <em>{element}</em>;
                            break;
                        case 'code':
                            element = (
                                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                                    {element}
                                </code>
                            );
                            break;
                        case 'link':
                            element = (
                                <a
                                    href={mark.attrs?.href as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {element}
                                </a>
                            );
                            break;
                    }
                });
            }
            return <>{element}</>;
        }
        case 'hardBreak':
            return <br />;
        case 'horizontalRule':
            return <hr className="my-6 border-border" />;
        case 'image':
            return (
                <img
                    src={node.attrs?.src as string}
                    alt={(node.attrs?.alt as string) || ''}
                    className="h-auto max-w-full rounded-lg"
                />
            );
        default:
            // Fallback: render children if present
            if (node.content) {
                return (
                    <>
                        {node.content.map((child, i) => (
                            <RenderNode key={i} node={child} />
                        ))}
                    </>
                );
            }
            return null;
    }
}


