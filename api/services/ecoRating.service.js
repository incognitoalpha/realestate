import axios from "axios";


const calculateAQIScore = async (lat, lon) => {
  try {
    const res = await axios.get(
      "https://api.openaq.org/v2/latest",
      {
        params: {
          coordinates: `${lat},${lon}`,
          radius: 10000,
          limit: 1,
        },
      }
    );

    const measurements = res.data?.results?.[0]?.measurements || [];
    const pm25 = measurements.find(m => m.parameter === "pm25")?.value;

    if (pm25 == null) return 50; // fallback

    // PM2.5 → normalized score
    if (pm25 <= 12) return 90;
    if (pm25 <= 35) return 70;
    if (pm25 <= 55) return 50;
    return 30;
  } catch (err) {
    console.error("OpenAQ error:", err.message);
    return 50;
  }
};


const calculateGreenScore = async (lat, lon) => {
  try {
    const query = `
      [out:json];
      (
        node["leisure"="park"](around:1500,${lat},${lon});
        way["leisure"="park"](around:1500,${lat},${lon});
        node["landuse"="forest"](around:1500,${lat},${lon});
        way["landuse"="forest"](around:1500,${lat},${lon});
      );
      out body;
    `;

    const res = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { headers: { "Content-Type": "text/plain" } }
    );

    const count = res.data?.elements?.length || 0;

    if (count >= 6) return 90;
    if (count >= 3) return 75;
    if (count >= 1) return 60;
    return 40;
  } catch (err) {
    console.error("OSM Overpass error:", err.message);
    return 50;
  }
};


const calculateSolarScore = async (lat, lon) => {
  try {
    const res = await axios.get(
      "https://power.larc.nasa.gov/api/temporal/climatology/solar",
      {
        params: {
          latitude: lat,
          longitude: lon,
          format: "JSON",
        },
      }
    );

    const monthly =
      res.data?.properties?.parameter?.ALLSKY_SFC_SW_DWN;

    if (!monthly) return 50;

    const values = Object.values(monthly);
    const avg =
      values.reduce((sum, v) => sum + v, 0) / values.length;

    // Normalize (typical range ~3–7 kWh/m²/day)
    const score = Math.round((avg / 7) * 100);
    return Math.min(Math.max(score, 30), 95);
  } catch (err) {
    console.error("NASA POWER error:", err.message);
    return 50;
  }
};


export const calculateEcoRating = async ({
  latitude,
  longitude,
}) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  const [greenScore, aqiScore, solarScore] = await Promise.all([
    calculateGreenScore(lat, lon),
    calculateAQIScore(lat, lon),
    calculateSolarScore(lat, lon),
  ]);

  const ecoScore = Math.round(
    0.4 * greenScore +
    0.4 * aqiScore +
    0.2 * solarScore
  );

  return {
    ecoScore,
    greenScore,
    aqiScore,
    solarScore,
  };
};
