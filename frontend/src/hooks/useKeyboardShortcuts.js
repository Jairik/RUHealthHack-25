import { useEffect, useCallback } from 'react';

export default function useKeyboardShortcuts(handlers = {}) {
    const handleKeyDown = useCallback((event) => {
        // Don't trigger if user is typing in an input/textarea
        if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            return;
        }

        const key = event.key.toLowerCase();

        switch (key) {
            case 'y':
                if (handlers.onYes) {
                    event.preventDefault();
                    handlers.onYes();
                }
                break;
            case 'n':
                if (handlers.onNo) {
                    event.preventDefault();
                    handlers.onNo();
                }
                break;
            case 's':
                if (handlers.onSkip) {
                    event.preventDefault();
                    handlers.onSkip();
                }
                break;
            case 'enter':
                if (handlers.onSubmit) {
                    event.preventDefault();
                    handlers.onSubmit();
                }
                break;
            case 'e':
                if (event.ctrlKey && handlers.onEnd) {
                    event.preventDefault();
                    handlers.onEnd();
                }
                break;
            case 'p':
                if (event.ctrlKey && handlers.onProtocols) {
                    event.preventDefault();
                    handlers.onProtocols();
                }
                break;
            case '?':
                if (handlers.onHelp) {
                    event.preventDefault();
                    handlers.onHelp();
                }
                break;
            default:
                break;
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Keyboard shortcuts reference
export const SHORTCUTS = [
    { key: 'Y', description: 'Answer Yes' },
    { key: 'N', description: 'Answer No' },
    { key: 'S', description: 'Skip Question' },
    { key: 'Enter', description: 'Submit Answer' },
    { key: 'Ctrl + E', description: 'End Conversation' },
    { key: 'Ctrl + P', description: 'Toggle Protocols' },
    { key: '?', description: 'Show Shortcuts' },
];
