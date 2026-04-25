import { Terminal, Play, Square, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const VirtualMachinePanel = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([
        'Welcome to the IoT-REAP Industrial Lab',
        'Type your commands below to practice factory operations...',
        '',
        '$ _',
    ]);
    const [command, setCommand] = useState('');

    const handleRun = () => {
        if (!command.trim()) return;
        const newOutput = [...output.slice(0, -1), `$ ${command}`];

        // Simulate command responses
        const responses: Record<string, string[]> = {
            ls: [
                'plc-config.yml  sensor-map.json  hmi-dashboard.tsx  README.md',
            ],
            pwd: ['/opt/industrial-lab'],
            whoami: ['operator'],
            'node --version': ['v20.11.0'],
            'python --version': ['Python 3.12.1'],
            help: [
                'Available commands: ls, pwd, whoami, node --version, python --version, clear, help',
            ],
            clear: [],
        };

        if (command === 'clear') {
            setOutput(['$ _']);
        } else {
            const response = responses[command] || [
                `Command '${command}' executed successfully.`,
            ];
            newOutput.push(...response, '', '$ _');
            setOutput(newOutput);
        }
        setCommand('');
    };

    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2">
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="font-heading text-sm font-medium text-secondary-foreground">
                        Industrial Lab Terminal
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                        onClick={() => setIsRunning(!isRunning)}
                    >
                        {isRunning ? (
                            <Square className="h-3.5 w-3.5" />
                        ) : (
                            <Play className="h-3.5 w-3.5" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-secondary-foreground/70 hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
                        onClick={() => setOutput(['$ _'])}
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
            <div className="max-h-[400px] min-h-[300px] overflow-y-auto bg-slate-900 p-4 font-mono text-green-400">
                {output.map((line, i) => (
                    <div
                        key={i}
                        className="text-sm leading-6 whitespace-pre-wrap"
                    >
                        {line}
                    </div>
                ))}
            </div>
            <div className="flex border-t border-border">
                <span className="bg-slate-900 px-3 py-2 font-mono text-sm text-green-400">
                    $
                </span>
                <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                    placeholder="Type a factory command..."
                    className="flex-1 bg-slate-900 px-2 py-2 font-mono text-sm text-green-400 outline-none placeholder:text-green-400/40"
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRun}
                    className="rounded-none text-primary hover:bg-primary/10 hover:text-primary"
                >
                    Execute
                </Button>
            </div>
        </div>
    );
};

export default VirtualMachinePanel;
