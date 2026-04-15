# Learning

The `Uncaught Error: Rendered more hooks than during the previous render` crash means I violated the absolute golden Rule of React: Hooks can never be placed inside or after conditional logic.

React components execute their code from top to bottom on every render. Because React relies heavily on "Hooks" (like `useState` and `useEffect`) to manage memory, it has one absolute, unbreakable rule: **Hooks must be called in the exact same order every single time the component renders**. You cannot hide them inside `if` statements or place them below early `return` statements.

### What caused the crash?
In `Exam.tsx`, there was code that essentially looked like this:

```javascript
export default function Exam() {
    // 1. If we are currently loading data from your backend...
    if (loading) {
        return <div>Loading...</div> // <-- React stops reading the file and exits here!
    }

    // 2. ONLY after loading finishes does React reach this hook...
    useEffect(() => {
        submitRef.current = handleSubmit
    })
}
```

When you clicked the "Attempt Now" button:
1. **Render 1:** `loading` was `true`. The component exited early and skipped the `useEffect`.
2. **Render 2:** The data arrived from the backend, so `loading` became `false`. The component continued downward and suddenly stumbled across the `useEffect`.
3. **The Crash:** React panicked and threw the error *"Rendered more hooks than during the previous render"* because a hook magically appeared out of nowhere that wasn't there during Render 1! It immediately crashed to a blank white screen to prevent memory corruption.

### What I did to fix it:
I simply copy-pasted the `handleSubmit` function and its `useEffect` hook higher up in the file, placing it safely *above* the `if (loading)` checks. 

Now, React registers the hook reliably on every single render before it ever encounters the loading screen. This completely silences the error!