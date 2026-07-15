'use client';

import TargetCursor from '@/components/TargetCursor';

export default function CursorProvider() {
  return (
    <TargetCursor
      targetSelector="button, a, [role='button'], .cursor-pointer, input[type='range']"
      cursorColor="#ffb000"
      cursorColorOnTarget="#00ff88"
      spinDuration={3}
    />
  );
}
