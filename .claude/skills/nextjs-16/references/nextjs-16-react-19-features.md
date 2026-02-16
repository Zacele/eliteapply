# Next.js 16 React 19.2 Features

## React Compiler (Stable)

Auto-optimizes without manual memoization. No code changes required.

```javascript
// next.config.js
module.exports = {
  experimental: { reactCompiler: true },
}
```

**Before (manual):**
```typescript
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
const memoizedCallback = useCallback(() => handleClick(id), [id]);
const MemoComponent = React.memo(MyComponent);
```

**After (automatic):**
```typescript
const value = computeExpensive(a, b); // Auto-memoized by compiler
const handleClick = () => doSomething(id); // Auto-optimized
function MyComponent() { ... } // Auto-memo'd when beneficial
```

Benefits: 20-50% fewer re-renders, 10-30% faster interactions, zero runtime overhead.

**When to enable:** Complex component trees, frequent re-renders, large lists.
**Skip for:** Simple static sites, minimal interactivity.

## View Transitions (React 19.2)

Animated page transitions with `startTransition`:

```typescript
'use client';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';

function Navigation() {
  const router = useRouter();

  const navigate = (path: string) => {
    startTransition(() => {
      router.push(path); // Triggers View Transition
    });
  };

  return <button onClick={() => navigate('/about')}>About</button>;
}
```

Requires browser View Transitions API support (Chrome 111+, Edge 111+).

## useEffectEvent (React 19.2)

Extract non-reactive logic from Effects:

```typescript
'use client';
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  // This function reads `theme` but doesn't re-trigger the Effect
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on('connected', () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]); // theme NOT in deps - correct!
}
```

Solves the stale closure problem without adding deps that cause re-connection.

## Activity API (React 19.2)

Pre-render or hide content without unmounting:

```typescript
'use client';
import { Activity } from 'react';

function TabContainer({ activeTab }) {
  return (
    <div>
      <Activity mode={activeTab === 'home' ? 'visible' : 'hidden'}>
        <HomeTab />
      </Activity>
      <Activity mode={activeTab === 'profile' ? 'visible' : 'hidden'}>
        <ProfileTab />
      </Activity>
    </div>
  );
}
```

Hidden tabs render with `display: none` but keep state. Switching tabs is instant.

## Server Actions Improvements

### Optimistic Updates Pattern

```typescript
'use client';
import { useOptimistic } from 'react';
import { addItem } from './actions';

function TodoList({ items }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, newItem) => [...state, { ...newItem, pending: true }]
  );

  async function handleAdd(formData: FormData) {
    const title = formData.get('title') as string;
    addOptimisticItem({ title, id: crypto.randomUUID() });
    await addItem(formData);
  }

  return (
    <form action={handleAdd}>
      <input name="title" />
      <button type="submit">Add</button>
      <ul>
        {optimisticItems.map(item => (
          <li key={item.id} style={{ opacity: item.pending ? 0.5 : 1 }}>
            {item.title}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

### useFormStatus

```typescript
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;
}
```
