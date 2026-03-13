import { useEffect, useState, useCallback, useRef } from 'react';

interface DialogueBoxProps {
  lines: string[];
  onClose: () => void;
}

export function DialogueBox({ lines, onClose }: DialogueBoxProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const startTyping = useCallback((lineIndex: number) => {
    setDisplayedText('');
    setIsTyping(true);
    charIndexRef.current = 0;

    const line = lines[lineIndex] ?? '';

    const tick = () => {
      charIndexRef.current += 1;
      setDisplayedText(line.slice(0, charIndexRef.current));
      if (charIndexRef.current < line.length) {
        timerRef.current = setTimeout(tick, 30);
      } else {
        setIsTyping(false);
      }
    };

    timerRef.current = setTimeout(tick, 30);
  }, [lines]);

  useEffect(() => {
    startTyping(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTyping]);

  const advance = useCallback(() => {
    if (isTyping) {
      // Skip to end of current line
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayedText(lines[currentLine] ?? '');
      setIsTyping(false);
      return;
    }

    if (currentLine < lines.length - 1) {
      const next = currentLine + 1;
      setCurrentLine(next);
      startTyping(next);
    } else {
      onClose();
    }
  }, [isTyping, currentLine, lines, startTyping, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advance();
      }
      if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [advance, onClose]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
      style={{ fontFamily: '"Press Start 2P", monospace' }}
    >
      <div
        className="mx-auto max-w-3xl relative"
        style={{
          background: '#1a1a2e',
          border: '4px solid #FFE040',
          boxShadow: '0 0 0 2px #1a1a2e, 0 0 0 4px #FFE040, inset 0 0 0 2px #000',
          padding: '16px 20px',
          minHeight: '96px',
        }}
      >
        {/* Arrow indicator top-right */}
        <div
          className="absolute top-2 right-3 text-xs"
          style={{ color: '#FFE040' }}
        >
          {currentLine + 1}/{lines.length}
        </div>

        {/* Text */}
        <p
          className="text-white leading-relaxed"
          style={{ fontSize: '8px', minHeight: '40px', whiteSpace: 'pre-wrap' }}
        >
          {displayedText}
          {isTyping && <span className="animate-pulse">▌</span>}
        </p>

        {/* Advance hint */}
        {!isTyping && (
          <div
            className="absolute bottom-2 right-4 text-xs animate-bounce"
            style={{ color: '#FFE040', fontSize: '8px' }}
          >
            ▼
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div
        className="text-center mt-1"
        style={{ fontSize: '6px', color: '#888', fontFamily: '"Press Start 2P", monospace' }}
      >
        SPACE / ENTER — advance &nbsp;·&nbsp; ESC — close
      </div>
    </div>
  );
}
