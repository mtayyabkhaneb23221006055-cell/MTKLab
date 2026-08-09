import React from 'react';

/**
 * Cleans raw LaTeX math notation, dollar signs, and unformatted escape characters
 * into clean, human-readable scientific plain text.
 */
export function cleanLatexAndMath(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Replace \text{...}
  cleaned = cleaned.replace(new RegExp('\\\\text\\s*\\{([^}]+)\\}', 'g'), '$1');

  // 2. Remove $$...$$ and $...$
  cleaned = cleaned.replace(new RegExp('\\$\\$([^$]+)\\$\\$', 'g'), '$1');
  cleaned = cleaned.replace(new RegExp('\\$([^$]+)\\$', 'g'), '$1');

  // 3. Convert subscript _2 -> ₂, _{2} -> ₂
  const subscriptMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'n': 'ₙ'
  };

  cleaned = cleaned.replace(new RegExp('_\\{([0-9a-z])\\}', 'gi'), (_, char) => subscriptMap[char.toLowerCase()] || char);
  cleaned = cleaned.replace(new RegExp('_([0-9a-z])', 'gi'), (_, char) => subscriptMap[char.toLowerCase()] || char);

  // 4. Convert \frac{num}{den} -> (num / den)
  cleaned = cleaned.replace(new RegExp('\\\\frac\\s*\\{([^}]+)\\}\\s*\\{([^}]+)\\}', 'g'), '($1 / $2)');

  // 5. Convert common LaTeX operators
  cleaned = cleaned.replace(new RegExp('\\\\times', 'g'), '×');
  cleaned = cleaned.replace(new RegExp('\\\\div', 'g'), '÷');
  cleaned = cleaned.replace(new RegExp('\\\\pm', 'g'), '±');
  cleaned = cleaned.replace(new RegExp('\\\\degree', 'g'), '°');
  cleaned = cleaned.replace(new RegExp('\\\\circ', 'g'), '°');
  cleaned = cleaned.replace(new RegExp('\\^\\{?\\circ\\}?', 'g'), '°');
  cleaned = cleaned.replace(new RegExp('\\\\approx', 'g'), '≈');
  cleaned = cleaned.replace(new RegExp('\\\\mu', 'g'), 'µ');

  // 6. Clean up backslashes
  cleaned = cleaned.replace(new RegExp('\\\\([a-zA-Z]+)', 'g'), '$1');

  return cleaned;
}

interface FormattedTextProps {
  content: string;
  className?: string;
}

/**
 * Parses bold **text** in a string into elements
 */
function renderInlineParts(text: string): React.ReactNode[] {
  if (!text) return [];

  const result: React.ReactNode[] = [];
  const boldRegex = new RegExp('\\*\\*([^*]+)\\*\\*', 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index));
    }
    result.push(
      React.createElement(
        'strong',
        { key: match.index, className: 'font-bold text-slate-900 dark:text-white' },
        match[1]
      )
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
}

/**
 * React Component that cleanly parses formatted AI text, bullet points,
 * numbered lists, bold text, and cleans up raw markdown/LaTeX symbols (*, #, $).
 */
export const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const cleanContent = cleanLatexAndMath(content);
  const lines = cleanContent.split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed font-sans text-xs ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Handle headers (# Header)
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(new RegExp('^#+\\s*'), '');
          return (
            <h4 key={lineIdx} className="font-bold text-sm text-teal-800 dark:text-teal-300 mt-2 mb-1">
              {renderInlineParts(headerText)}
            </h4>
          );
        }

        // Handle Bullet Points (* item, - item, • item)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const itemText = trimmed.replace(new RegExp('^[*•-]\\s+'), '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0 mt-0.5">•</span>
              <div className="flex-1">{renderInlineParts(itemText)}</div>
            </div>
          );
        }

        // Handle Numbered Lists (1. item, 2. item)
        const numMatch = trimmed.match(new RegExp('^(\\d+)\\.\\s+(.*)'));
        if (numMatch) {
          const num = numMatch[1];
          const itemText = numMatch[2];
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0">{num}.</span>
              <div className="flex-1">{renderInlineParts(itemText)}</div>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <div key={lineIdx} className="text-slate-800 dark:text-slate-200">
            {renderInlineParts(trimmed)}
          </div>
        );
      })}
    </div>
  );
};
