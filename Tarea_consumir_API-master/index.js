const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=20');
    const pokemons = response.data.results;

    const cards = await Promise.all(pokemons.map(async pokemon => {
      const detailsResponse = await axios.get(pokemon.url);
      const details = detailsResponse.data;

      return {
        id: details.id,
        name: details.name,
        imageUrl: details.sprites.front_default,
        height: details.height,
        weight: details.weight,
        abilities: details.abilities.map(ability => ability.ability.name).join(', ')
      };
    }));

    const html = generateHtml(cards);
    res.send(html);
  } catch (error) {
    console.error('Error al obtener los datos de la API:', error.message);
    res.status(500).json({ error: 'Ocurrió un error al obtener los datos de la API' });
  }
});

function generateHtml(cards) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .header {
          text-align: center;
          margin-top: 20px;
          font-size: 36px;
          color: #444;
        }
        .container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 1200px;
        }
        .card {
          border: 1px solid #ddd;
          background-color: #fff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 15px;
          padding: 20px;
          text-align: center;
          border-radius: 5px;
          transition: transform 0.2s;
          width: 280px;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card img {
          max-width: 100%;
        }
        .card h2 {
          margin-top: 10px;
          font-size: 24px;
          color: #333;
        }
        .card p {
          margin: 8px 0;
          color: #777;
        }
        .card .abilities {
          margin-top: 15px;
          color: #555;
        }
        .icon {
          color: #ff6f61;
          margin-right: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">Pokémones</div>
      <div class="container">
        ${cards.map(generateCard).join('')}
      </div>
    </body>
    </html>
  `;
}

function generateCard(card) {
  return `
    <div class="card">
      <img src="${card.imageUrl}" alt="${card.name}">
      <h2>${card.name}</h2>
      <p><i class="fas fa-ruler-vertical icon"></i><strong>Height:</strong> ${card.height}</p>
      <p><i class="fas fa-weight-hanging icon"></i><strong>Weight:</strong> ${card.weight}</p>
      <div class="abilities">
        <i class="fas fa-book-open icon"></i><strong>Abilities:</strong><br>${card.abilities}
      </div>
    </div>
  `;
}

app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
