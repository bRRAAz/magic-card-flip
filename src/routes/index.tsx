import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

/**
 * Baralho Terapêutico Digital
 * --------------------------------------------------------------
 * Para adicionar novas cartas você NÃO precisa mexer neste arquivo.
 *
 * 1. Coloque as imagens em `public/cartas/`
 *    (ex.: `public/cartas/7_frente.jpg` e `public/cartas/7_tras.jpg`)
 * 2. Abra `public/cartas/cartas.json` e acrescente um item:
 *      { "id": 7, "frente": "/cartas/7_frente.jpg", "tras": "/cartas/7_tras.jpg" }
 * 3. Salve. A carta aparece automaticamente na galeria.
 *
 * Veja `public/cartas/README.md` para mais detalhes.
 * --------------------------------------------------------------
 */

type Carta = { id: number; frente: string; tras: string };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baralho Terapêutico" },
      {
        name: "description",
        content:
          "Baralho terapêutico digital para sessões de psicologia infantil — escolha uma carta e vire para revelar a pergunta.",
      },
      { property: "og:title", content: "Baralho Terapêutico" },
      {
        property: "og:description",
        content:
          "Baralho terapêutico digital para sessões de psicologia infantil.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<Carta | null>(null);
  const [virada, setVirada] = useState(false);

  useEffect(() => {
    fetch("/cartas/cartas.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("Não foi possível carregar as cartas.");
        return r.json();
      })
      .then((data: Carta[]) => setCartas(data))
      .catch((e: Error) => setErro(e.message));
  }, []);

  const fechar = useCallback(() => {
    setSelecionada(null);
    setVirada(false);
  }, []);

  useEffect(() => {
    if (!selecionada) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selecionada, fechar]);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 sm:py-14">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Baralho Terapêutico
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          Escolha uma carta para começar.
        </p>
      </header>

      {erro && (
        <p className="mx-auto max-w-md rounded-2xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {erro}
        </p>
      )}

      <section
        className="mx-auto grid max-w-6xl gap-6 sm:gap-7"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
        aria-label="Galeria de cartas"
      >
        {cartas.map((carta) => (
          <button
            key={carta.id}
            onClick={() => {
              setSelecionada(carta);
              setVirada(false);
            }}
            className="group relative aspect-[2/3] overflow-hidden rounded-3xl bg-card shadow-[0_8px_24px_-12px_oklch(0.5_0.05_40_/_0.25)] ring-1 ring-border/60 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_oklch(0.5_0.05_40_/_0.35)] focus:outline-none focus-visible:ring-4 focus-visible:ring-ring active:scale-[0.97]"
            aria-label={`Abrir carta ${carta.id}`}
          >
            <img
              src={carta.frente}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </button>
        ))}
      </section>

      {selecionada && (
        <div
          className="backdrop-fade-in fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-md"
          onClick={fechar}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={fechar}
            aria-label="Fechar carta"
            className="absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-card text-foreground shadow-lg ring-1 ring-border/70 transition hover:scale-105 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div
            className="carta-scene carta-pop-in"
            style={{
              aspectRatio: "2 / 3",
              height: "min(78vh, 640px)",
              maxWidth: "85vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVirada((v) => !v)}
              className={`carta-flipper ${virada ? "carta-flipped" : ""} cursor-pointer focus:outline-none`}
              aria-label={virada ? "Mostrar frente da carta" : "Virar carta"}
            >
              <span className="carta-face block bg-card shadow-[0_30px_60px_-20px_oklch(0.3_0.05_40_/_0.45)] ring-1 ring-border/70">
                <img
                  src={selecionada.frente}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </span>
              <span className="carta-face carta-face-back block bg-card shadow-[0_30px_60px_-20px_oklch(0.3_0.05_40_/_0.45)] ring-1 ring-border/70">
                <img
                  src={selecionada.tras}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </span>
            </button>

            {!virada && (
              <p className="mt-5 text-center text-sm text-card/90 drop-shadow sm:text-base">
                Toque na carta para virar
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
