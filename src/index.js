import "./styles.css";

const positiveMigration = new Map();
const negativeMigration = new Map();

const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const res = await fetch(url);
  const data = await res.json();

  const PMUrl =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const PMRes = await fetch(PMUrl);
  const PMData = await PMRes.json();
  let pMigration = [];

  const NMUrl =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const NMRes = await fetch(NMUrl);
  const NMData = await NMRes.json();
  let nMigration = [];

  pMigration = PMData.dataset.value;
  pMigration.shift();

  nMigration = NMData.dataset.value;
  nMigration.shift();

  let index = 0;
  for (let municipality in PMData.dataset.dimension.Tuloalue.category.index) {
    if (municipality === "SSS") continue;
    municipality = municipality.slice(2);
    positiveMigration.set(municipality, pMigration[index]);
    negativeMigration.set(municipality, nMigration[index]);
    index++;
  }

  initMap(data);
};

const initMap = (data) => {
  let map = L.map("map", {
    minZoom: -3
  });

  let geoJson = L.geoJSON(data, {
    weight: 2,
    onEachFeature: getFeature
  }).addTo(map);

  let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  map.fitBounds(geoJson.getBounds());
};

const getFeature = async (feature, layer) => {
  const name = feature.properties.name;
  const municipality = feature.properties.kunta;

  layer.bindTooltip(name);

  let negMigration = negativeMigration.get(municipality);
  let posMigration = positiveMigration.get(municipality);
  layer.bindPopup(
    `<p>Migration to ${name}: ${posMigration}</p>
    <p>Migration from ${name}: ${negMigration}</p>`
  );
};

fetchData();
