# Baralhos

Cada baralho é uma pasta dentro de `public/baralhos/`.

## Como adicionar um novo baralho

1. Crie uma pasta nova aqui, ex.: `public/baralhos/meu-baralho/`.
2. Coloque dentro dela:
   - As imagens das cartas (frente e verso), ex.: `01-f.jpg`, `01-t.jpg`.
   - Um arquivo `cartas.json` listando as cartas:
     ```json
     [
       { "id": 1, "frente": "/baralhos/meu-baralho/01-f.jpg", "tras": "/baralhos/meu-baralho/01-t.jpg" },
       { "id": 2, "frente": "/baralhos/meu-baralho/02-f.jpg", "tras": "/baralhos/meu-baralho/02-t.jpg" }
     ]
     ```
   - (Opcional) Uma imagem `capa.jpg` para usar como capa do baralho.
3. Abra `public/baralhos/baralhos.json` e adicione uma entrada nova:
   ```json
   {
     "id": "meu-baralho",
     "nome": "Meu Baralho",
     "descricao": "Descrição curta.",
     "capa": "/baralhos/meu-baralho/capa.jpg",
     "cartas": "/baralhos/meu-baralho/cartas.json"
   }
   ```
4. Salve. O baralho aparece automaticamente na tela inicial.
