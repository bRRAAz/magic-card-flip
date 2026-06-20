import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Baralho Terapêutico Digital
 * --------------------------------------------------------------
 * Como adicionar / editar / remover cartas:
 *
 * Modo fácil (recomendado para a psicóloga):
 *   1. Toque e segure o título "Baralho Terapêutico" por ~1 segundo
 *      (ou pressione Ctrl + Shift + A) para abrir o painel oculto.
 *   2. No painel é possível adicionar uma carta nova enviando a imagem
 *      da FRENTE e do VERSO, editar uma carta existente trocando suas
 *      imagens, ou remover cartas.
 *   3. As alterações ficam salvas neste dispositivo (localStorage).
 *
 * Modo avançado (cartas padrão do projeto):
 *   1. Coloque as imagens em `public/cartas/` (ex.: `7_frente.jpg`).
 *   2. Edite `public/cartas/cartas.json` adicionando o item:
 *        { "id": 7, "frente": "/cartas/7_frente.jpg", "tras": "/cartas/7_tras.jpg" }
 *   3. Salve. As cartas padrão são usadas na primeira vez que o app
 *      carrega; depois disso o que vale é o painel oculto.
 *
 * Para resetar tudo e voltar às cartas padrão: abra o painel oculto e
 * clique em "Restaurar cartas padrão".
 * --------------------------------------------------------------
 */

type Carta = { id: number; frente: string; tras: string };

const STORAGE_KEY = "baralho-terapeutico:cartas";

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

function fileParaDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Index() {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionada, setSelecionada] = useState<Carta | null>(null);
  const [virada, setVirada] = useState(false);
  const [admin, setAdmin] = useState(false);

  // Carrega: localStorage primeiro; senão, JSON padrão.
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const data = JSON.parse(salvo) as Carta[];
        if (Array.isArray(data) && data.length) {
          setCartas(data);
          return;
        }
      }
    } catch {
      /* ignora */
    }
    fetch("/cartas/cartas.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error("Não foi possível carregar as cartas.");
        return r.json();
      })
      .then((data: Carta[]) => setCartas(data))
      .catch((e: Error) => setErro(e.message));
  }, []);

  const persistir = useCallback((novas: Carta[]) => {
    setCartas(novas);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
    } catch (e) {
      console.error("Falha ao salvar cartas", e);
      alert(
        "Atenção: Não foi possível salvar as cartas no navegador porque o tamanho acumulado das imagens excede o limite de armazenamento do navegador (localStorage, máximo de ~5MB). Para salvar permanentemente, reduza bastante a resolução/tamanho das imagens ou use o modo avançado colocando as imagens diretamente na pasta 'public/cartas/' do projeto e editando o arquivo 'cartas.json'."
      );
    }
  }, []);

  const fechar = useCallback(() => {
    setSelecionada(null);
    setVirada(false);
  }, []);

  // Esc fecha modais
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selecionada) fechar();
        else if (admin) setAdmin(false);
      }
      // Atalho oculto para abrir o admin
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "A" || e.key === "a")
      ) {
        e.preventDefault();
        setAdmin(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selecionada, admin, fechar]);

  // Toque longo no título abre o admin
  const longPress = useRef<number | null>(null);
  const iniciarLongPress = () => {
    if (longPress.current) window.clearTimeout(longPress.current);
    longPress.current = window.setTimeout(() => setAdmin(true), 1000);
  };
  const cancelarLongPress = () => {
    if (longPress.current) {
      window.clearTimeout(longPress.current);
      longPress.current = null;
    }
  };

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 sm:py-14">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <h1
          onPointerDown={iniciarLongPress}
          onPointerUp={cancelarLongPress}
          onPointerLeave={cancelarLongPress}
          onPointerCancel={cancelarLongPress}
          className="cursor-default select-none text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          title="Pressione e segure para abrir o painel"
        >
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
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
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

      {/* Modal de carta selecionada */}
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

      {/* Painel admin oculto */}
      {admin && (
        <PainelAdmin
          cartas={cartas}
          onFechar={() => setAdmin(false)}
          onSalvar={persistir}
        />
      )}
    </main>
  );
}

function PainelAdmin({
  cartas,
  onFechar,
  onSalvar,
}: {
  cartas: Carta[];
  onFechar: () => void;
  onSalvar: (novas: Carta[]) => void;
}) {
  const [editando, setEditando] = useState<Carta | "nova" | null>(null);

  const remover = (id: number) => {
    if (!confirm("Remover esta carta?")) return;
    onSalvar(cartas.filter((c) => c.id !== id));
  };

  const restaurarPadrao = async () => {
    if (
      !confirm(
        "Isso apaga TODAS as cartas personalizadas e restaura as padrão. Continuar?",
      )
    )
      return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      const r = await fetch("/cartas/cartas.json", { cache: "no-cache" });
      const data = (await r.json()) as Carta[];
      onSalvar(data);
    } catch {
      alert("Não foi possível restaurar as cartas padrão.");
    }
  };

  const salvarCarta = (carta: Carta) => {
    const existe = cartas.some((c) => c.id === carta.id);
    const novas = existe
      ? cartas.map((c) => (c.id === carta.id ? carta : c))
      : [...cartas, carta];
    onSalvar(novas);
    setEditando(null);
  };

  return (
    <div
      className="backdrop-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 px-4 py-6 backdrop-blur-md"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Painel da psicóloga"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Painel da psicóloga
            </h2>
            <p className="text-xs text-muted-foreground">
              Adicione, edite ou remova cartas. As alterações ficam salvas neste
              dispositivo.
            </p>
          </div>
          <button
            onClick={onFechar}
            aria-label="Fechar painel"
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {editando ? (
          <FormularioCarta
            carta={editando === "nova" ? null : editando}
            cartasExistentes={cartas}
            onCancelar={() => setEditando(null)}
            onSalvar={salvarCarta}
          />
        ) : (
          <>
            <div className="flex items-center gap-2 border-b border-border/60 px-6 py-3">
              <button
                onClick={() => setEditando("nova")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Nova carta
              </button>
              <button
                onClick={restaurarPadrao}
                className="ml-auto rounded-full px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Restaurar padrão
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartas.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma carta cadastrada. Toque em "Nova carta".
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {cartas.map((c) => (
                    <li
                      key={c.id}
                      className="group relative overflow-hidden rounded-2xl ring-1 ring-border/60"
                    >
                      <div className="aspect-[2/3] bg-muted">
                        <img
                          src={c.frente}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <button
                          onClick={() => setEditando(c)}
                          className="flex-1 rounded-full bg-card/90 px-2 py-1 text-xs font-medium text-foreground shadow transition hover:bg-card"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => remover(c.id)}
                          className="rounded-full bg-destructive/90 px-2 py-1 text-xs font-medium text-destructive-foreground shadow transition hover:bg-destructive"
                          aria-label={`Remover carta ${c.id}`}
                        >
                          Remover
                        </button>
                      </div>
                      <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        #{c.id}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FormularioCarta({
  carta,
  cartasExistentes,
  onCancelar,
  onSalvar,
}: {
  carta: Carta | null;
  cartasExistentes: Carta[];
  onCancelar: () => void;
  onSalvar: (c: Carta) => void;
}) {
  const [frente, setFrente] = useState(carta?.frente ?? "");
  const [tras, setTras] = useState(carta?.tras ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<"frente" | "tras" | null>(null);

  const handleArquivo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "frente" | "tras",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    setCarregando(tipo);
    setErro(null);
    try {
      const dataUrl = await fileParaDataURL(file);
      if (tipo === "frente") setFrente(dataUrl);
      else setTras(dataUrl);
    } catch {
      setErro("Falha ao ler a imagem.");
    } finally {
      setCarregando(null);
    }
  };

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frente || !tras) {
      setErro("Envie a imagem da frente e do verso.");
      return;
    }
    const id =
      carta?.id ??
      (cartasExistentes.length
        ? Math.max(...cartasExistentes.map((c) => c.id)) + 1
        : 1);
    onSalvar({ id, frente, tras });
  };

  return (
    <form
      onSubmit={submeter}
      className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5"
    >
      <h3 className="text-base font-semibold text-foreground">
        {carta ? `Editar carta #${carta.id}` : "Nova carta"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoImagem
          label="Frente (ilustração)"
          valor={frente}
          carregando={carregando === "frente"}
          onArquivo={(e) => handleArquivo(e, "frente")}
          onLimpar={() => setFrente("")}
        />
        <CampoImagem
          label="Verso (pergunta / texto)"
          valor={tras}
          carregando={carregando === "tras"}
          onArquivo={(e) => handleArquivo(e, "tras")}
          onLimpar={() => setTras("")}
        />
      </div>

      {erro && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="mt-auto flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
        >
          Salvar carta
        </button>
      </div>
    </form>
  );
}

function CampoImagem({
  label,
  valor,
  carregando,
  onArquivo,
  onLimpar,
}: {
  label: string;
  valor: string;
  carregando: boolean;
  onArquivo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLimpar: () => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60">
        {valor ? (
          <img src={valor} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {carregando ? "Carregando..." : "Nenhuma imagem"}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={onArquivo}
          className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-2 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-secondary-foreground hover:file:opacity-90"
        />
        {valor && (
          <button
            type="button"
            onClick={onLimpar}
            className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Limpar
          </button>
        )}
      </div>
    </label>
  );
}
