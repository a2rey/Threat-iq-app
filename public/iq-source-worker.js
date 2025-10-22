const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: `${request.method} Method Not Allowed` }), { status: 405, headers: corsHeaders });
    }
    const url = new URL(request.url);
    
    const indicator = url.searchParams.get('indicator');
    if (!indicator) {
      return new Response(JSON.stringify({ error: 'Missing indicator parameter' }), { status: 400, headers: corsHeaders });
    }
    console.log(env.VT_API_KEY);
    try {
      const [vtData, abuseData, otxData] = await Promise.all([
        fetchVirusTotal(indicator, env.VIRUSTOTAL_API_KEY),
        fetchAbuseIPDB(indicator, env.ABUSEIPBD_KEY),
        fetchOTXData(indicator, env.OTX_API_KEY)]);
        const response = {
          indicator,
          sources: {
            VirusTotal: vtData,
            AbuseIPDB: abuseData,
            AlienVaultOTX: otxData,
          },
        };
        return new Response(JSON.stringify(response), { status: 200, headers: corsHeaders });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500, headers: corsHeaders });
    }
  return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

// VirusTotal
async function fetchVirusTotal(indicator, apiKey) {
  const vtUrl = `https://www.virustotal.com/api/v3/search?query=${encodeURIComponent(indicator)}`;
  const resp = await fetch(vtUrl, { headers: { "x-apikey": apiKey } });
  if (!resp.ok) return { error: `VirusTotal: ${resp.status}` };
  const data = await resp.json();
  return data.data || data;
}

// AbuseIPDB
async function fetchAbuseIPDB(indicator, apiKey) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(indicator)) return { note: "Not an IP address" };
  const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${indicator}&maxAgeInDays=90`;
  const resp = await fetch(url, {
    headers: { Key: apiKey, Accept: "application/json" },
  });
  if (!resp.ok) return { error: `AbuseIPDB: ${resp.status}` };
  return await resp.json();
}

// AlienVault OTX
async function fetchOTXData(indicator, apiKey) {
  const url = `https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(indicator)}/general`;
  const resp = await fetch(url, { headers: { "X-OTX-API-KEY": apiKey } });
  if (!resp.ok) return { error: `OTX: ${resp.status}` };
  return await resp.json();
}
