# ObsidianUI — OTP Input

[Canonical page](https://www.obsidianui.dev/docs/otp-input) · [Agent guide](https://www.obsidianui.dev/agent-instructions.md)

An animated 6-digit OTP verification input with success/error states and smooth animations.

## Preview

[Open the interactive component preview](https://www.obsidianui.dev/docs/otp-input)

```tsx
import { OTPInput } from '@/components/block/otp-input'

export function Demo() {
return <OTPInput correctOTP="424242" />
}
```

## Install using CLI

```bash
npx shadcn@latest add "https://www.obsidianui.dev/r/otp-input.json"
```

## Install manually — complete source

Download the complete manifest: [otp-input.json](https://www.obsidianui.dev/r/otp-input.json). It includes every required local file and package dependency.

Install the listed package dependencies in your React project:

```bash
npm install clsx lucide-react motion tailwind-merge
```

Resolve @components/, @ui/, @lib/, and @hooks/ targets through your components.json aliases. For example, @components/block/example.tsx maps to src/components/block/example.tsx when components is @/components and @/\* resolves to src/\*. Do not create a literal @components directory. Preserve existing files deliberately and keep the use client directive where present.

### components/block/otp-input.tsx

Installation target: `@components/block/otp-input.tsx`

```tsx
'use client';

import React, { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
    correctOTP?: string;
    onSuccess?: () => void;
    onError?: () => void;
}

export function OTPInput({ correctOTP = '424242', onSuccess, onError }: OTPInputProps) {
    const id = useId();
    const length = Math.max(1, correctOTP.length);
    const [digits, setDigits] = useState<string[]>([]);
    const [state, setState] = useState<'idle' | 'error' | 'success'>('idle');
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const reduceMotion = useReducedMotion();

    const updateDigits = (next: string[]) => {
        setDigits(next);
        if (next.filter(Boolean).length !== length) {
            setState('idle');
            return;
        }
        if (next.join('') === correctOTP) {
            setState('success');
            inputs.current.forEach((input) => input?.blur());
            onSuccess?.();
        } else {
            setState('error');
            onError?.();
        }
    };

    const enterDigits = (value: string, index: number) => {
        const entered = value.replace(/\D/g, '').slice(0, length - index);
        const next = Array.from({ length }, (_, i) => digits[i] || '');
        if (!entered) next[index] = '';
        else entered.split('').forEach((digit, offset) => { next[index + offset] = digit; });
        updateDigits(next);
        if (entered && next.join('') !== correctOTP) {
            inputs.current[Math.min(index + entered.length, length - 1)]?.focus();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3" role="group" aria-labelledby={`${id}-label`}>
            <p id={`${id}-label`} className="font-medium text-lg">OTP Verification</p>
            <motion.div
                className="flex items-center justify-center gap-2"
                animate={{ x: state === 'error' && !reduceMotion ? [0, 3, -3, 3, -3, 0] : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.22 }}
            >
                {Array.from({ length }, (_, index) => (
                    <motion.div
                        key={index}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.22, delay: reduceMotion ? 0 : index * 0.04 }}
                        className={cn(
                            'w-9 h-10 bg-muted rounded-lg ring-2 ring-transparent focus-within:ring-ring overflow-hidden',
                            state === 'error' && 'ring-destructive',
                            state === 'success' && 'ring-green-500',
                        )}
                    >
                        <input
                            ref={(input) => { inputs.current[index] = input; }}
                            id={`${id}-digit-${index}`}
                            aria-label={`Digit ${index + 1} of ${length}`}
                            aria-invalid={state === 'error'}
                            aria-describedby={state === 'error' ? `${id}-status` : undefined}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete={index === 0 ? 'one-time-code' : 'off'}
                            value={digits[index] || ''}
                            onChange={(event) => enterDigits(event.target.value, index)}
                            onPaste={(event) => {
                                event.preventDefault();
                                enterDigits(event.clipboardData.getData('text'), index);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                                    event.preventDefault();
                                    inputs.current[Math.max(0, Math.min(length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1)))]?.focus();
                                } else if (event.key === 'Backspace') {
                                    event.preventDefault();
                                    const target = digits[index] ? index : Math.max(0, index - 1);
                                    const next = Array.from({ length }, (_, i) => digits[i] || '');
                                    next[target] = '';
                                    updateDigits(next);
                                    inputs.current[target]?.focus();
                                }
                            }}
                            onFocus={(event) => event.target.select()}
                            className="border-none outline-none w-9 h-10 text-center bg-transparent text-foreground"
                            disabled={state === 'success'}
                        />
                    </motion.div>
                ))}
            </motion.div>
            <p id={`${id}-status`} role="status" className={cn('min-h-5 text-sm', state === 'error' ? 'text-destructive' : 'text-green-600 dark:text-green-400')}>
                {state === 'success' && <><Check className="inline size-4 mr-1" aria-hidden="true" />OTP Verified Successfully!</>}
                {state === 'error' && 'Invalid OTP'}
            </p>
        </div>
    );
}

export default OTPInput;
```

### lib/utils.ts

Installation target: `@lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Usage

```tsx
import { OTPInput } from "@/components/block/otp-input"

export function Demo() {
return (
  <OTPInput
    correctOTP="424242"
    onSuccess={() => console.log("Verified!")}
    onError={() => console.log("Invalid OTP")}
  />
)
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| correctOTP | string | "424242" | The correct OTP code |
| onSuccess | () => void | - | Callback on success |
| onError | () => void | - | Callback on error |
