import { renderTableReport } from './renderObj.js';

document.getElementById("threatForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const indicator = document.getElementById("indicator").value.trim();
  const output = document.getElementById("output");

  if (!indicator) {
    output.textContent = "Please enter an indicator to check.";
    return;
  }

  output.textContent = "Fetching data... ⏳";

  try {
    // Fetch from your backend or Cloudflare Worker (no API keys in frontend)
    const res = await fetch(`https://threat-iq-worker.alvreydu.workers.dev/?indicator=${encodeURIComponent(indicator)}`,
      { method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
         },
        body: JSON.stringify({ indicator })
       });

    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }

    const data = await res.json();
    const datar = {};
    datar.VirusTotal = data.sources.VirusTotal[0].attributes.last_analysis_stats;
    datar.AbuseIPDB = data.sources.AbuseIPDB;
    datar.AlienVaultOTX = data.sources.AlienVaultOTX;
    renderTableReport(datar, output);
  } catch (err) {
    console.error(err);
    output.textContent = `Failed to fetch data: ${err.message}`;
  }
});
