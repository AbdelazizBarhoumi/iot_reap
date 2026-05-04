/**
 * MarkdownContent Component
 * Renders Markdown text with full feature support:
 * - Headings (h1-h6)
 * - Bold, italic, strikethrough
 * - Inline code and code blocks with language support
 * - Ordered/unordered lists and nested lists
 * - Blockquotes
 * - Links and images
 * - Tables
 * - Horizontal rules
 * - Line breaks
 */

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';
import './markdown.css';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

// Configure marked for enhanced markdown support
marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true, // GitHub Flavored Markdown (tables, strikethrough, etc.)
    pedantic: false,
    headerIds: true,
} as Parameters<typeof marked.setOptions>[0]);

export function MarkdownContent({
    content,
    className = '',
}: MarkdownContentProps) {
    const html = useMemo(() => {
        if (!content || !content.trim()) {
            return '';
        }
        try {
            // marked.parse is the synchronous method
            const rawHtml = marked.parse(content);

            // Handle both string and Promise returns
            if (typeof rawHtml === 'string') {
                // Sanitize HTML to prevent XSS while preserving markdown output
                return DOMPurify.sanitize(rawHtml, {
                    ALLOWED_TAGS: [
                        'p',
                        'br',
                        'strong',
                        'em',
                        'u',
                        'code',
                        'pre',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'ul',
                        'ol',
                        'li',
                        'blockquote',
                        'a',
                        'img',
                        'table',
                        'thead',
                        'tbody',
                        'tr',
                        'th',
                        'td',
                        'hr',
                        'del',
                        'span',
                    ],
                    ALLOWED_ATTR: [
                        'href',
                        'title',
                        'target',
                        'rel',
                        'src',
                        'alt',
                        'width',
                        'height',
                        'class',
                    ],
                    FORCE_BODY: false,
                });
            }
            return '';
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return '';
        }
    }, [content]);

    if (!html) {
        return (
            <p className="text-muted-foreground italic">
                No content available.
            </p>
        );
    }

    return (
        <div
            className={`markdown-content ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
