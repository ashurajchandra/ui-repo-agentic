import Todos from "./todos";

export default function Page() {
  return (
    <main>
      <h1>Todos</h1>
      <p className="muted">Add things to do and tick them off.</p>
      <Todos />
    </main>
  );
}
