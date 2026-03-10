"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Jogador = {
  nome: string;
  desc: string;
  preco: string;
  img: string;
};

const jogadores: Jogador[] = [
  {
    nome: "Andre Ramalho",
    desc: "Muito ruim, pouco qi.",
    preco: "R$ 2,00",
    img: "/lojinha/andreramalho.png",
  },
  {
    nome: "Pedro Raul",
    desc: "Rei das noites paulistas.",
    preco: "R$ 5,00",
    img: "/lojinha/pedroraul-1.jpg",
  },
  {
    nome: "Hugo",
    desc: "Avenida na lateral esquerda.",
    preco: "R$ 1,25",
    img: "/lojinha/hugp.jpg",
  },
  {
    nome: "Charles",
    desc: "Nao cuida nem dele.",
    preco: "R$ 3,00",
    img: "/lojinha/charles.png",
  },
  {
    nome: "Tchoca",
    desc: "Ruim e novo.",
    preco: "R$ 1,25",
    img: "/lojinha/tchoca.jpeg",
  },
];

type CardProps = {
  jogador: Jogador;
  quantity: number;
  onAdd: (nome: string) => void;
  onRemove: (nome: string) => void;
  canRemove: boolean;
};

function JogadorCard({ jogador, quantity, onAdd, onRemove, canRemove }: CardProps) {
  return (
    <article className={styles.card}>
      <img className={styles.cardImage} src={jogador.img} alt={jogador.nome} />
      <h3>{jogador.nome}</h3>
      <p className={styles.cardDesc}>{jogador.desc}</p>
      <p className={styles.price}>{jogador.preco}</p>
      <p>No carrinho: {quantity}</p>
      <div className={styles.buttonRow}>
        <button className={styles.button} onClick={() => onAdd(jogador.nome)}>
          Adicionar
        </button>
        <button
          className={styles.button}
          onClick={() => onRemove(jogador.nome)}
          disabled={!canRemove}
        >
          Remover
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const totalCarrinho = Object.values(cartQuantities).reduce((soma, item) => soma + item, 0);

  const produtosSelecionados = jogadores
    .map((jogador) => ({
      ...jogador,
      quantidade: cartQuantities[jogador.nome] ?? 0,
    }))
    .filter((item) => item.quantidade > 0);

  const adicionar = (nome: string) => {
    setCartQuantities((anterior) => ({
      ...anterior,
      [nome]: (anterior[nome] ?? 0) + 1,
    }));
  };

  const remover = (nome: string) => {
    setCartQuantities((anterior) => {
      const atual = anterior[nome] ?? 0;
      if (atual <= 0) {
        return anterior;
      }

      const proximo = { ...anterior, [nome]: atual - 1 };
      if (proximo[nome] === 0) {
        delete proximo[nome];
      }

      return proximo;
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <img src="/lojinha/logobagres.png" className={styles.logo} alt="logo timao" />
        <div className={styles.userBox}>
          <span>Ola, Gaviao1910</span>

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
                        <span>{item.nome}</span>
                        <span>x{item.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Catalogo de Bagres</h1>
        <section className={styles.vitrine}>
          {jogadores.map((jogador) => (
            <JogadorCard
              key={jogador.nome}
              jogador={jogador}
              quantity={cartQuantities[jogador.nome] ?? 0}
              onAdd={adicionar}
              onRemove={remover}
              canRemove={(cartQuantities[jogador.nome] ?? 0) > 0}
            />
          ))}
        </section>
      </main>
    </div>
  );
}