import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

/**
 * Baralho Terapêutico Digital
 * --------------------------------------------------------------
 * Estrutura por PASTAS — para adicionar um novo baralho:
 *
 *   1. Crie uma pasta em `public/baralhos/<slug>/`.
 *   2. Coloque as imagens das cartas e um `cartas.json` dentro dela.
 *   3. Adicione uma entrada em `public/baralhos/baralhos.json`.
 *
 * Veja `public/baralhos/README.md` para um passo a passo completo.
 * --------------------------------------------------------------
 */

type Carta = { id: number; frente: string; tras: string };
type Baralho = {
  id: string;
  nome: string;
  descricao?: string;
  capa: string;
  cartas: string; // caminho para o cartas.json do baralho
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baralhos Terapêuticos" },
      {
        name: "description",
        content:
          "Coleção de baralhos terapêuticos digitais para sessões de psicologia infantil — escolha um baralho, abra uma carta e vire para revelar o verso.",
      },
      { property: "og:title", content: "Baralhos Terapêuticos" },
      {
        property: "og:description",
        content:
          "Coleção de baralhos terapêuticos digitais para sessões de psicologia infantil.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [baralhos, setBaralhos] = useState<Baralho[]>([]);
  const [baralhoAtivo, setBaralhoAtivo] = useState<Baralho | null>(null);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [carregandoCartas, setCarregandoCartas] = useState(false);
  const [selecionada, setSelecionada] = useState<Carta | null>(null);
  const [virada, setVirada] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/baralhos/baralhos.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("Não foi possível carregar os baralhos.");
        return r.json();
      })
      .then((data: Baralho[]) => setBaralhos(data))
      .catch((e: Error) => setErro(e.message));
  }, []);

  const abrirBaralho = useCallback((b: Baralho) => {
    setBaralhoAtivo(b);
    setCartas([]);
    setCarregandoCartas(true);
    setErro(null);
    fetch(b.cartas, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("Não foi possível carregar as cartas.");
        return r.json();
      })
      .then((data: Carta[]) => setCartas(data))
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregandoCartas(false));
  }, []);

  const voltarParaBaralhos = useCallback(() => {
    setBaralhoAtivo(null);
    setCartas([]);
    setSelecionada(null);
    setVirada(false);
  }, []);

  const fecharCarta = useCallback(() => {
    setSelecionada(null);
    setVirada(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selecionada) fecharCarta();
      else if (baralhoAtivo) voltarParaBaralhos();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selecionada, baralhoAtivo, fecharCarta, voltarParaBaralhos]);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 sm:py-14">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        {baralhoAtivo ? (
          <>
            <button
              onClick={voltarParaBaralhos}
              className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              aria-label="Voltar para os baralhos"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Voltar aos baralhos
            </button>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {baralhoAtivo.nome}
            </h1>
            {baralhoAtivo.descricao && (
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                {baralhoAtivo.descricao}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Baralhos Terapêuticos
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Escolha um baralho para começar.
            </p>
          </>
        )}
      </header>

      {erro && (
        <p className="mx-auto max-w-md rounded-2xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {erro}
        </p>
      )}

      {!baralhoAtivo ? (
        <section
          className="mx-auto grid max-w-5xl gap-6 sm:gap-8"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          }}
          aria-label="Lista de baralhos"
        >
          {baralhos.map((b) => (
            <button
              key={b.id}
              onClick={() => abrirBaralho(b)}
              className="group flex flex-col overflow-hidden rounded-3xl bg-card text-left shadow-[0_10px_30px_-14px_oklch(0.5_0.05_40_/_0.3)] ring-1 ring-border/60 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_-18px_oklch(0.5_0.05_40_/_0.4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-ring active:scale-[0.98]"
              aria-label={`Abrir baralho ${b.nome}`}
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
                <img
                  src={b.capa}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col gap-1 px-5 py-4">
                <span className="text-lg font-semibold text-foreground">
                  {b.nome}
                </span>
                {b.descricao && (
                  <span className="text-sm text-muted-foreground">
                    {b.descricao}
                  </span>
                )}
              </div>
            </button>
          ))}
        </section>
      ) : (
        <section
          className="mx-auto grid max-w-6xl gap-6 sm:gap-7"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
          aria-label={`Cartas do baralho ${baralhoAtivo.nome}`}
        >
          {carregandoCartas ? (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Carregando cartas...
            </p>
          ) : cartas.length === 0 ? (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              Este baralho ainda não tem cartas. Adicione imagens em{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                public/baralhos/{baralhoAtivo.id}/
              </code>{" "}
              e edite o <code>cartas.json</code> dessa pasta.
            </p>
          ) : (
            cartas.map((carta) => (
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
                  loading="lazy"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            ))
          )}
        </section>
      )}

      {/* Modal de carta selecionada */}
      {selecionada && (
        <div
          className="backdrop-fade-in fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-md"
          onClick={fecharCarta}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={fecharCarta}
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
