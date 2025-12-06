/**
 * CopyButton Component
 * Button to copy text to clipboard with visual feedback
 */

'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  field: string;
  isCopied: boolean;
  onCopy: (text: string, field: string) => void;
}

export function CopyButton({ text, field, isCopied, onCopy }: CopyButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCopy(text, field)}
        >
          {isCopied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isCopied ? 'Copied!' : `Copy ${field}`}</p>
      </TooltipContent>
    </Tooltip>
  );
}
