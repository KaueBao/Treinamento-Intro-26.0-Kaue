"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import styles from "./page.module.css";
import { authClient } from "@/lib/auth-client";

type Jogador = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  img: string;
};

const jogadores: Jogador[] = [
  {
    id: "fallback-1",
    nome: "Andre Ramalho",
    descricao: "Muito ruim, pouco qi.",
    preco: 2,
    img: "/lojinha/andreramalho.png",
  },
  {
    id: "fallback-2",
    nome: "Pedro Raul",
    descricao: "Rei das noites paulistas.",
    preco: 5,
    img: "/lojinha/pedroraul-1.jpg",
  },
  {
    id: "fallback-3",
    nome: "Hugo",
    descricao: "Avenida na lateral esquerda.",
    preco: 1.25,
    img: "/lojinha/hugp.jpg",
  },
  {
    id: "fallback-4",
    nome: "Charles",
    descricao: "Nao cuida nem dele.",
    preco: 3,
    img: "/lojinha/charles.png",
  },
  {
    id: "fallback-5",
    nome: "Tchoca",
    descricao: "Ruim e novo.",
    preco: 1.25,
    img: "/lojinha/tchoca.jpeg",
  },
];

type CarrinhoApi = {
  itens: Array<{
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
    subtotal: number;
  }>;
  totalItens: number;
  totalPreco: number;
};

type CardProps = {
  jogador: Jogador;
  quantity: number;
  onAdd: (produtoId: string) => void;
  onRemove: (produtoId: string) => void;
  canRemove: boolean;
  disabled?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function isObjectId(value: string) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

function JogadorCard({ jogador, quantity, onAdd, onRemove, canRemove, disabled }: CardProps) {
  return (
    <article className={styles.card}>
      <img className={styles.cardImage} src={jogador.img} alt={jogador.nome} />
      <h3>{jogador.nome}</h3>
      <p className={styles.cardDesc}>{jogador.descricao}</p>
      <p className={styles.price}>{formatCurrency(jogador.preco)}</p>
      <p>No carrinho: {quantity}</p>
      <div className={styles.buttonRow}>
        <button className={styles.button} onClick={() => onAdd(jogador.id)} disabled={disabled}>
          Adicionar
        </button>
        <button
          className={styles.button}
          onClick={() => onRemove(jogador.id)}
          disabled={!canRemove || disabled}
        >
          Remover
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const { data: sessionData } = authClient.useSession();

  const [cartOpen, setCartOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [produtos, setProdutos] = useState<Jogador[]>(jogadores);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const totalCarrinho = Object.values(cartQuantities).reduce((soma, item) => soma + item, 0);

  const isAuthenticated = Boolean(sessionData?.user);
  const userName = sessionData?.user?.name || "Visitante";

  const refreshCarrinho = async () => {
    if (!isAuthenticated) {
      setCartQuantities({});
      return;
    }

    const response = await fetch("/api/carrinho", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return;
    }

    const carrinho: CarrinhoApi = await response.json();
    const quantidades: Record<string, number> = {};

    for (const item of carrinho.itens) {
      quantidades[item.produtoId] = item.quantidade;
    }

    setCartQuantities(quantidades);
  };

  const loadProdutos = async () => {
    const response = await fetch("/api/produtos", {
      method: "GET",
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return;
    }

    // Keep fallback images by index while API does not store image URLs.
    const mappedProdutos: Jogador[] = data.map((item, index) => ({
      id: item.id,
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      img: jogadores[index % jogadores.length].img,
    }));

    setProdutos(mappedProdutos);
  };

  useEffect(() => {
    const run = async () => {
      setLoadingData(true);
      await loadProdutos();
      await refreshCarrinho();
      setLoadingData(false);
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const produtosSelecionados = produtos
    .map((jogador) => ({
      ...jogador,
      quantidade: cartQuantities[jogador.id] ?? 0,
    }))
    .filter((item) => item.quantidade > 0);

  const adicionar = async (produtoId: string) => {
    if (!isAuthenticated || updatingCart) {
      return;
    }

    if (!isObjectId(produtoId)) {
      setCartQuantities((prev) => ({
        ...prev,
        [produtoId]: (prev[produtoId] ?? 0) + 1,
      }));
      return;
    }

    setUpdatingCart(true);

    try {
      const response = await fetch("/api/carrinho", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          produtoId,
          quantidade: 1,
        }),
      });

      if (!response.ok) {
        return;
      }

      await refreshCarrinho();
    } finally {
      setUpdatingCart(false);
    }
  };

  const remover = async (produtoId: string) => {
    if (!isAuthenticated || updatingCart) {
      return;
    }

    if (!isObjectId(produtoId)) {
      setCartQuantities((prev) => {
        const atual = prev[produtoId] ?? 0;

        if (atual <= 1) {
          const clone = { ...prev };
          delete clone[produtoId];
          return clone;
        }

        return {
          ...prev,
          [produtoId]: atual - 1,
        };
      });
      return;
    }

    setUpdatingCart(true);

    try {
      const response = await fetch("/api/carrinho", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          produtoId,
          quantidade: 1,
        }),
      });

      if (!response.ok) {
        return;
      }

      await refreshCarrinho();
    } finally {
      setUpdatingCart(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <img src="/lojinha/logobagres.png" className={styles.logo} alt="logo timao" />
        <div className={styles.userBox}>
          <span>Ola, {userName}</span>

          {!isAuthenticated ? (
            <div className={styles.authLinks}>
              <Link href="/login">Entrar</Link>
              <Link href="/cadastro">Criar conta</Link>
            </div>
          ) : (
            <Link href="/logout" className={styles.authLinkSingle}>Sair</Link>
          )}

          <div className={styles.cartWrapper}>
            <button className={styles.cartButton} onClick={() => setCartOpen((aberto) => !aberto)}>
              Carrinho: <strong>{totalCarrinho}</strong>
            </button>

            {cartOpen && (
              <aside className={styles.cartPopup}>
                <h3>Produtos selecionados</h3>

                {produtosSelecionados.length === 0 ? (
                  <p className={styles.emptyCart}>Carrinho vazio.</p>
                ) : (
                  <ul className={styles.cartList}>
                    {produtosSelecionados.map((item) => (
                      <li key={item.nome} className={styles.cartItem}>
                        <span>{item.nome} ({formatCurrency(item.preco)})</span>
                        <span>x{item.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className={styles.cartTotal}>Total: {formatCurrency(
                  produtosSelecionados.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)
                )}</p>
              </aside>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Catalogo de Bagres</h1>
        {loadingData && <p className={styles.loading}>Carregando produtos...</p>}
        <section className={styles.vitrine}>
          {produtos.map((jogador) => (
            <JogadorCard
              key={jogador.id}
              jogador={jogador}
              quantity={cartQuantities[jogador.id] ?? 0}
              onAdd={adicionar}
              onRemove={remover}
              canRemove={(cartQuantities[jogador.id] ?? 0) > 0}
              disabled={!isAuthenticated || updatingCart}
            />
          ))}
        </section>
        {!isAuthenticated && (
          <p className={styles.loginHint}>Faca login para salvar o carrinho no seu usuario.</p>
        )}
      </main>
    </div>
  );
}