# Breakdown

## React Strict Mode (React 18 -> React 19): The Double-Mount Dilemma

The bug we just encountered is a rite of passage for modern React development. It originates from architectural shifts fundamentally introduced in **React 18** and fully solidified in **React 19**. 

Here are the engineering notes you can save for your team regarding what changed, why it causes backend crashes, and how to permanently solve it.

---

### What Actually Changed? (React 18 & 19)

Prior to React 18, `useEffect` with an empty dependency array `[]` was universally treated as a direct equivalent to the old `componentDidMount` lifecycle. It was guaranteed to fire exactly once.

Starting in **React 18** (and strictly enforced in **React 19**), React core developers introduced the concept of **Reusable State** to support rapid features like back/forward browser caching, `<Offscreen>` API, and instant tab switching. To ensure your app gracefully handles being paused and resumed indefinitely, development mode now aggressively stress-tests your effects.

**The Strict Mode Sequence (Dev Only):**
1. React mounts the component.
2. React fires `useEffect` (Fires Request A).
3. React *immediately* unmounts the component.
4. React remounts the component using the exact same state.
5. React fires `useEffect` again (Fires Request B).

All of this happens invisibly in milliseconds.

> [!WARNING]
> React strictly warns: *"If your effect breaks because it runs twice, your effect has a bug."* Effects are now evaluated mathematically—they must safely clean themselves up.

---

### Why Did This Crash Our Backend?

React expects you to write "Idempotent" effects (effects that can run 100 times without duplicating side effects). 

When our `startSession` fired twice, it generated two simultaneous network requests. Because our backend intelligently utilizes **MongoDB Transactions** to create test sessions synchronously, both requests hit the exact same MongoDB document lock at exactly the same time. 

MongoDB evaluates this as a **WriteConflict** and brutally aborts one of the requests to prevent corrupted data, throwing the `500 Server Error` right back to the UI.

---

### How to Deal With This (3 Best Practices)

If you are fetching data or initiating sessions on mount, you must protect your backend. Moving forward, use one of these three strategies:

#### 1. The `useRef` Barrier (Our Quick Fix)
A manual Boolean flag that transcends unmounts. This blocks the second execution entirely. This is considered the "vanilla React" hack. 
```typescript
const effectRan = useRef(false);

useEffect(() => {
    if (effectRan.current === false) {
        startSession();
    }
    // Cleanup function sets the flag so the immediate remount skips execution
    return () => {
        effectRan.current = true;
    }
}, []);
```

#### 2. The AbortController (The Native Web Approach)
Instead of ignoring the second fetch, you gracefully cancel the first one. This is deeply respected by browsers but requires your backend logic to be capable of handling broken client pipes.
```typescript
useEffect(() => {
    const controller = new AbortController();
    
    // Pass controller.signal to your native fetch() call
    testAPI.startTest(testId, { signal: controller.signal });

    return () => {
        // Automatically cancels the inflight request A when React unmounts it
        controller.abort(); 
    }
}, []);
```

#### 3. Data Fetching Libraries (The Defacto React 19 Approach)
React 19's overarching philosophy is that `useEffect` should **rarely be used for data fetching**. The industry standard is mapping data requests to external caches that automatically de-duplicate concurrent requests out-of-the-box. 

If you migrate to **React Query (@tanstack/react-query)**, **SWR**, or React Router **Loaders**, this problem evaporates instantly. When two identical requests are detected in those libraries, the second request silently subscribes to the first request's promise, cutting backend impact by 50% automatically.
