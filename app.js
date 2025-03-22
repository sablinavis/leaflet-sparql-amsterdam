// map
const map = L.map('map').setView([52.3676, 4.9041], 13); // radius Amsterdam


// OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


// SPARQL endpoint en query
const endpointUrl = 'https://api.linkeddata.cultureelerfgoed.nl/datasets/sablina-vis/Amsterdamse-Eerbetoon-in-Steen-en-Straat/sparql';
const sparqlQuery = `
prefix dcterms: <http://purl.org/dc/terms/>
prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
prefix schema: <https://schema.org/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>

select ?title ?description ?lat ?long
where {
  ?item schema:name ?title ;
        schema:honorificFor/schema:name ?description ;
        schema:latitude ?lat ;
        schema:longitude ?long .
}
`;

const fullUrl = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery);
const headers = { 'Accept': 'application/sparql-results+json' };

fetch(fullUrl, { headers })
  .then(response => response.json())
  .then(data => {
    const results = data.results.bindings;
    results.forEach(item => {
      const title = item.title.value;
      const description = item.description.value;
      const lat = parseFloat(item.lat.value);
      const long = parseFloat(item.long.value);

      // Add marker to the map
      const marker = L.marker([lat, long]).addTo(map);
      marker.bindPopup(`
        <div>
          <h3>${title}</h3>
          <p>${description}</p>
          <button onclick="collectPoint('${title}', '${description}')">Collect</button>
        </div>
      `);
    });
  })
  .catch(error => console.error('Error fetching data:', error));

function collectPoint(title, description) {
    const collectionContainer = document.getElementById('collection');

    // duplicaten vermijden
    const existingItems = collectionContainer.querySelectorAll('.street-tile');
    for (let item of existingItems) {
        if (item.querySelector('h4').textContent === title) {
            alert(`"${title}" is al verzameld.`);
            return; // Exit if a duplicate is found
        }
    }

    // kaart voor verzamelde straat
    const card = document.createElement('div');
    card.classList.add('street-tile');
    card.innerHTML = `
      <h4>${title}</h4>
      <p>${description}</p>
    `;

    // toevoegen kaart aan lijst
    collectionContainer.appendChild(card);

    console.log(`Collected street: ${title}`);
}

// test log
function testConsole() {
  console.log('This is a test log');
}
testConsole();
