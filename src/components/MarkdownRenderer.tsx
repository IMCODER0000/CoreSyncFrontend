import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Box } from '@mui/material';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <Box
      sx={{
        '& h1': {
          fontSize: '2rem',
          fontWeight: 700,
          marginTop: '1.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '0.5rem',
        },
        '& h2': {
          fontSize: '1.5rem',
          fontWeight: 600,
          marginTop: '1.25rem',
          marginBottom: '0.75rem',
        },
        '& h3': {
          fontSize: '1.25rem',
          fontWeight: 600,
          marginTop: '1rem',
          marginBottom: '0.5rem',
        },
        '& p': {
          marginBottom: '0.75rem',
          lineHeight: 1.7,
          color: '#37352f',
        },
        '& ul, & ol': {
          marginLeft: '1.5rem',
          marginBottom: '0.75rem',
        },
        '& li': {
          marginBottom: '0.25rem',
          lineHeight: 1.6,
        },
        '& code': {
          backgroundColor: 'rgba(135, 131, 120, 0.15)',
          color: '#eb5757',
          padding: '0.2em 0.4em',
          borderRadius: '3px',
          fontSize: '0.85em',
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        },
        '& pre': {
          backgroundColor: '#f7f6f3',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          marginBottom: '1rem',
          border: '1px solid #e0e0e0',
        },
        '& pre code': {
          backgroundColor: 'transparent',
          color: 'inherit',
          padding: 0,
          fontSize: '0.9em',
        },
        '& blockquote': {
          borderLeft: '3px solid #e0e0e0',
          paddingLeft: '1rem',
          marginLeft: 0,
          marginBottom: '1rem',
          color: '#6b7280',
          fontStyle: 'italic',
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '1rem',
        },
        '& th, & td': {
          border: '1px solid #e0e0e0',
          padding: '0.5rem',
          textAlign: 'left',
        },
        '& th': {
          backgroundColor: '#f7f6f3',
          fontWeight: 600,
        },
        '& a': {
          color: '#0066cc',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid #e0e0e0',
          margin: '1.5rem 0',
        },
        '& strong': {
          fontWeight: 600,
        },
        '& em': {
          fontStyle: 'italic',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
