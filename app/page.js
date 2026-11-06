import { Suspense } from "react";
import Todos from "./todos";

export default function Page() {
  return (
    <main>
      <h1>Todos</h1>
      <p className="muted">Add things to do and tick them off.</p>
      <Suspense fallback={<p className="muted">Loading todos...</p>}>
        <Todos />
      </Suspense>
    </main>
  );
}
