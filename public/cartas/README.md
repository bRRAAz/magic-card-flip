# Como adicionar novas cartas

Esta pasta contém as imagens do baralho terapêutico e o arquivo `cartas.json`
que controla quais cartas aparecem na galeria. **Você não precisa mexer no
código React** para incluir cartas novas.

## Passo a passo

1. **Coloque as imagens nesta pasta** (`public/cartas/`).
   - Cada carta precisa de duas imagens: uma frente (ilustração) e um verso
     (a pergunta ou texto).
   - Pode usar `.jpg`, `.png` ou `.svg`. Recomendamos proporção retrato
     (ex.: 800x1200).
   - Sugestão de nome: `7_frente.jpg` e `7_tras.jpg` (mas qualquer nome
     funciona).

2. **Edite o arquivo `cartas.json`** desta mesma pasta e acrescente um item
   no final da lista, seguindo o modelo:

   ```json
   {
     "id": 7,
     "frente": "/cartas/7_frente.jpg",
     "tras": "/cartas/7_tras.jpg"
   }
   ```

   - O `id` precisa ser um número único (use o próximo livre).
   - Os caminhos sempre começam com `/cartas/...`.
   - Lembre da vírgula entre os itens (todos menos o último).

3. **Salve o arquivo**. A galeria mostrará a carta nova automaticamente
   ao recarregar a página.

## Remover uma carta

Apague o item correspondente no `cartas.json` (e, se quiser, as imagens
desta pasta).
