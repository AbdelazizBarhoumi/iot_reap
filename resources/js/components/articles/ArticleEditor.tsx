/**
 * ArticleEditor Component
 * Teacher-facing rich text editor for article content.
 * Uses a simplified editor (TipTap-like structure output).
 */
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Save,
    FileText,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import type { Article, TipTapContent, TipTapNode } from '@/types/article.types';
interface ArticleEditorProps {
    lessonId: string;
    article: Article | null;
    onSave?: (article: Article) => void;
}
export function ArticleEditor({
    lessonId,
    article: initialArticle,
    onSave,
}: ArticleEditorProps) {
    const [_article, setArticle] = useState<Article | null>(initialArticle);
    const [content, setContent] = useState<string>(
        initialArticle?.content
            ? extractTextFromContent(initialArticle.content)
            : '',
    );
    const [isSaving, setIsSaving] = useState(false);
    // Word count calculation
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Convert plain text to TipTap-like JSON structure
            const tipTapContent = convertToTipTapContent(content);
            const response = await fetch(
                `/teaching/lessons/${lessonId}/article`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN':
                            document.cookie
                                .split('; ')
                                .find((row) => row.startsWith('XSRF-TOKEN='))
                                ?.split('=')[1] ?? '',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ content: tipTapContent }),
                },
            );
            if (!response.ok) throw new Error('Failed to save article');
            const data = await response.json();
            setArticle(data.article);
            onSave?.(data.article);
            toast.success('Article saved successfully!');
        } catch {
            toast.error('Failed to save article');
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <FileText className="h-5 w-5" />
                    Article Content
                </CardTitle>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        {wordCount} words · {readTime} min read
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !content.trim()}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Article'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Simplified toolbar */}
                <div className="mb-4 flex items-center gap-1 rounded-lg bg-muted/50 p-2">
                    <Toggle size="sm" aria-label="Bold">
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Italic">
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    <Toggle size="sm" aria-label="Heading 1">
                        <Heading1 className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Heading 2">
                        <Heading2 className="h-4 w-4" />
                    </Toggle>
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    <Toggle size="sm" aria-label="Bullet list">
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Numbered list">
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                    <Separator orientation="vertical" className="mx-1 h-6" />
                    <Toggle size="sm" aria-label="Quote">
                        <Quote className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" aria-label="Code">
                        <Code className="h-4 w-4" />
                    </Toggle>
                </div>
                {/* Content editor */}
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your article content here...
You can use markdown-style formatting:
# Heading 1
## Heading 2
**bold text**
*italic text*
- bullet points
1. numbered lists
> blockquotes
`code`"
                    className="min-h-[400px] resize-y font-mono text-sm"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                    Tip: Use markdown formatting for headings (#, ##), bold
                    (**text**), italic (*text*), lists (-, 1.), quotes (&gt;),
                    and code (`code`).
                </p>
            </CardContent>
        </Card>
    );
}

/**
 * Extract plain text from TipTap JSON content
 */
function extractTextFromContent(content: TipTapContent): string {
    let text = '';
    function extract(node: unknown): void {
        const typedNode = node as TipTapNode;
        if (typedNode.text) {
            text += typedNode.text;
        }
        if (typedNode.content && Array.isArray(typedNode.content)) {
            typedNode.content.forEach(extract);
            // Add newlines between block elements
            if (
                [
                    'paragraph',
                    'heading',
                    'bulletList',
                    'orderedList',
                    'blockquote',
                ].includes(typedNode.type || '')
            ) {
                text += '\n\n';
            }
        }
    }
    extract(content);
    return text.trim();
}
/**
 * Convert plain text with basic markdown to TipTap JSON structure
 */
function convertToTipTapContent(text: string): TipTapContent {
    const lines = text.split('\n');
    const content: unknown[] = [];
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        // Heading 1
        if (trimmed.startsWith('# ')) {
            content.push({
                type: 'heading',
                attrs: { level: 1 },
                content: [{ type: 'text', text: trimmed.slice(2) }],
            });
        }
        // Heading 2
        else if (trimmed.startsWith('## ')) {
            content.push({
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: trimmed.slice(3) }],
            });
        }
        // Blockquote
        else if (trimmed.startsWith('> ')) {
            content.push({
                type: 'blockquote',
                content: [
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: trimmed.slice(2) }],
                    },
                ],
            });
        }
        // Bullet list item
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const lastItem = content[content.length - 1] as TipTapNode | undefined;
            const listItem: TipTapNode = {
                type: 'listItem',
                content: [
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: trimmed.slice(2) }],
                    },
                ],
            };
            if (lastItem?.type === 'bulletList' && lastItem.content) {
                lastItem.content.push(listItem);
            } else {
                content.push({
                    type: 'bulletList',
                    content: [listItem],
                });
            }
        }
        // Numbered list item
        else if (/^\d+\.\s/.test(trimmed)) {
            const lastItem = content[content.length - 1] as TipTapNode | undefined;
            const text = trimmed.replace(/^\d+\.\s/, '');
            const listItem: TipTapNode = {
                type: 'listItem',
                content: [
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text }],
                    },
                ],
            };
            if (lastItem?.type === 'orderedList' && lastItem.content) {
                lastItem.content.push(listItem);
            } else {
                content.push({
                    type: 'orderedList',
                    content: [listItem],
                });
            }
        }
        // Regular paragraph
        else {
            content.push({
                type: 'paragraph',
                content: parseInlineFormatting(trimmed),
            });
        }
    });
    return {
        type: 'doc',
        content:
            content.length > 0
                ? (content as TipTapNode[])
                : ([{ type: 'paragraph', content: [] }] as TipTapNode[]),
    };
}
/**
 * Parse inline formatting (bold, italic, code)
 */
function parseInlineFormatting(text: string): unknown[] {
    const result: unknown[] = [];
    const remaining = text;
    // Simple regex-based parsing for inline formatting
    // For simplicity, just return plain text
    // A full implementation would parse the patterns
    if (remaining) {
        result.push({ type: 'text', text: remaining });
    }
    return result;
}


