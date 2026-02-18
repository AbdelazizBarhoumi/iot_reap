/**
 * VM Template Card component.
 * Displays template info with OS icon and launch button.
 * Sprint 2 - Phase 2
 */

import { Monitor, Terminal, Skull } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { VMTemplate } from '../types/vm.types';

interface VMTemplateCardProps {
  template: VMTemplate;
  onLaunch: (template: VMTemplate) => void;
}

const OS_ICONS = {
  windows: Monitor,
  linux: Terminal,
  kali: Skull,
};

const OS_COLORS = {
  windows: 'bg-blue-500',
  linux: 'bg-orange-500',
  kali: 'bg-purple-500',
};

export function VMTemplateCard({ template, onLaunch }: VMTemplateCardProps) {
  const IconComponent = OS_ICONS[template.os_type];
  const iconColor = OS_COLORS[template.os_type];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor} text-white`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">{template.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>CPU Cores:</span>
            <span className="font-medium text-foreground">{template.cpu_cores}</span>
          </div>
          <div className="flex justify-between">
            <span>RAM:</span>
            <span className="font-medium text-foreground">{template.ram_mb / 1024} GB</span>
          </div>
          <div className="flex justify-between">
            <span>Disk:</span>
            <span className="font-medium text-foreground">{template.disk_gb} GB</span>
          </div>
          <div className="flex justify-between">
            <span>Protocol:</span>
            <Badge variant="outline" className="uppercase">
              {template.protocol}
            </Badge>
          </div>
        </div>
        {template.tags && template.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onLaunch(template)}>
          Launch VM
        </Button>
      </CardFooter>
    </Card>
  );
}
