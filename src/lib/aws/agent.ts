import { BedrockRuntimeClient, ConverseCommand, ConverseCommandInput } from "@aws-sdk/client-bedrock-runtime";
import { ReverseGeocodeCommand } from "@aws-sdk/client-geo-places";
import { bedrockClient, geoPlacesClient, AWS_CONFIG } from "./config";

const TOOLS = [
  {
    toolSpec: {
      name: "web_search",
      description: "Search the web for local municipal laws, PWD standards, Kerala government SLAs, and department contact info.",
      inputSchema: {
        json: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      }
    }
  },
  {
    toolSpec: {
      name: "reverse_geocode",
      description: "Get pinpoint address components. Use this to distinguish between the specific City/Town and the larger administrative District.",
      inputSchema: {
        json: {
          type: "object",
          properties: {
            lat: { type: "number" },
            lng: { type: "number" }
          },
          required: ["lat", "lng"]
        }
      }
    }
  }
];

const SYSTEM_PROMPT = `
<role>
You are an elite civil grievance auditor operating within a formal municipal framework.
Your objective is to process raw citizen input and generate a highly structured, professional formal compliant.
</role>

<instruction>
1. Analyze the citizen's evidence and extract the core issue 
2. Determine the precise central/state government department responsible (e.g., Public Works Department (PWD), State Electricity Board, Water Authority).
4. Determine the official designation of the officer/officers in the specified department who are responsible for mitigating or solving the issue. 
5. Evaluate the severity of the issue based on public safety and infrastructure impact.
6. Consider the map data from the tool reverse_geocode as the baseline. IF RAW GPS IS PROVIDED, YOU MUST CALL THE reverse_geocode TOOL.
7. IMPORTANT: If the citizen mentions a specific locality name (e.g. "Chenkulam") in their text/audio, PRIORITIZE that over the map's area name. 
8. Look for shop names or signs in the image to refine the landmark.
9. The output must include a precise Landmark, Area, Pincode, City, District, and State.
10. DO NOT combine city, district, and state into one field. Each MUST be a single, clean name (e.g., City: "Kottarakkara", District: "Kollam", State: "Kerala").
11. The success criteria must include details like which type of standard set up by the government or the regulating body must be followed. 
</instruction>

<example>
{
  "investigation_step": "Citizen reported a large water-filled pothole with surrounding pavement cracking on NH 66 (formerly NH 17) at Varappuzha, between North Paravur and Edapally. No GPS provided; location resolved via textual description and web lookup. Varappuzha PIN confirmed as 683517, Ernakulam district. NH 66 falls under NHAI jurisdiction. Severity assessed as HIGH due to visible deep pothole with standing water and advanced pavement fracturing posing active accident risk on a national arterial corridor.",
  "draft": {
    "title": "Formal Complaint: Dangerous Water-Filled Pothole and Pavement Deterioration on NH 66 at Varappuzha — Immediate Rectification Demanded",
    "category": "Infrastructure",
    "severity": "HIGH",
    "target_department": "National Highways Authority of India (NHAI) — Kerala Regional Office, Ernakulam",
    "official_designation": "Project Director, NHAI (Kerala RO) / Executive Engineer, PWD (NH Division), Ernakulam",
    "summary": "This complaint formally brings to the attention of the competent authority the existence of a severe, water-filled pothole accompanied by extensive radial pavement cracking on National Highway 66 (NH 66), located at Varappuzha, along the North Paravur–Edapally corridor in Ernakulam District, Kerala. As evidenced by the photographic documentation submitted herewith, the pothole exhibits full pavement layer penetration, structural sub-base exposure, and accumulated stagnant water rendering its true depth indeterminate to motorists — a condition of acute hazard. The surrounding carriageway surface shows progressive alligator cracking indicative of wide-scale structural failure beyond isolated spot damage. This stretch is a high-density arterial route carrying substantial daily traffic including two-wheelers, heavy goods vehicles, and KSRTC buses. The defect poses a clear and present risk of fatal road traffic accidents, vehicular axle damage, and injury to vulnerable road users. Despite the ongoing NH widening and improvement programme on this corridor, the maintenance obligation under the Motor Vehicles Act and NHAI contractual framework remains fully enforceable. The responsible department is urgently directed to mobilise emergency patch repair within the stipulated SLA, undertake comprehensive structural investigation, and implement permanent resurfacing with appropriate water drainage remediation.",
    "location": {
      "landmark": "NH 66 Carriageway, Near Varappuzha Bridge / Periyar River Crossing",
      "area": "Varappuzha",
      "pincode": "683517",
      "city": "North Paravur",
      "district": "Ernakulam",
      "state": "Kerala"
    },
    "legal_sla_hours": 48,
    "success_criteria": [
      "Emergency cold-mix or hot-mix bituminous patch repair of the reported pothole completed within 48 hours of complaint acknowledgement",
      "Deployment of adequate warning signage and reflective barricades at the site until permanent repair is executed",
      "Comprehensive structural condition survey of the entire Varappuzha–North Paravur NH 66 stretch conducted within 7 days",
      "Permanent full-depth reclamation and resurfacing of all identified failed pavement sections completed within 30 days",
      "Drainage audit performed to identify and rectify the root cause of sub-surface water ingress contributing to pavement failure",
      "Written closure report with geo-tagged photographic evidence of completed repairs submitted to the complainant and District Collector's office"
    ]
  }
}
</example>

<output_format>
You must output ONLY valid JSON. Do not include any conversational filler, markdown formatting blocks (like \`\`\`json), or preamble. Use the exact structure below:
{
  "investigation_step": "Short note on current logic",
  "draft": {
    "title": "Professional title",
    "category": "Infrastructure | Sanitation | Electricity | Water | Public Safety",
    "severity": "LOW | MEDIUM | HIGH | CRITICAL",
    "target_department": "Official Department Name",
    "official_designation": "Specific officer title",
    "summary": "Formal description",
    "location": {
      "landmark": "Specific landmark",
      "area": "Neighborhood/Locality",
      "pincode": "6-digit code",
      "city": "City",
      "district": "District",
      "state": "State"
    },
    "legal_sla_hours": 48,
    "success_criteria": ["Point 1", "Point 2"]
  }
}
</output_format>
`;

export async function processGrievanceAgent(params: {
  imageBytes?: Uint8Array,
  imageFormat?: "png" | "jpeg" | "webp",
  description: string,
  location?: { lat: number, lng: number }
}) {
  const { imageBytes, imageFormat, description, location } = params;

  let messages: any[] = [{
    role: "user",
    content: [
      ...(imageBytes ? [{ image: { format: imageFormat || "jpeg", source: { bytes: imageBytes } } }] : []),
      { text: `CITIZEN INPUT: "${description}" \nRAW GPS: ${location ? `${location.lat}, ${location.lng}` : "Not provided"}` }
    ]
  }];

  try {
    for (let i = 0; i < 5; i++) {
      const command = new ConverseCommand({
        modelId: AWS_CONFIG.bedrock.modelId,
        messages: messages,
        system: [{ text: SYSTEM_PROMPT }],
        toolConfig: { tools: TOOLS as any }
      });

      const response = await bedrockClient.send(command);
      const outputMessage = response.output?.message;
      if (!outputMessage) throw new Error("No response");
      messages.push(outputMessage);

      console.log(outputMessage)

      if (response.stopReason === "tool_use") {
        const toolResultsContent: any[] = [];
        for (const contentBlock of outputMessage.content || []) {
          if (contentBlock.toolUse) {
            const { name, input, toolUseId } = contentBlock.toolUse;
            let resultData: any;

            if (name === "web_search") resultData = await tavilySearch((input as any).query);
            else if (name === "reverse_geocode") resultData = await reverseGeocode((input as any).lat, (input as any).lng);

            console.log(`[DEBUG] Agent Tool Output (${name}):`, resultData);

            toolResultsContent.push({
              toolResult: { toolUseId, content: [{ json: resultData }], status: "success" }
            });
          }
        }
        if (toolResultsContent.length > 0) {
          messages.push({ role: "user", content: toolResultsContent });
          continue;
        }
      }

      const finalContent = outputMessage.content?.find(c => c.text)?.text;
      if (finalContent) {
        console.log("[DEBUG] Raw AI Final Text:", finalContent);
        const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "No JSON" };
      }
    }
  } catch (error) { throw error; }
}

async function tavilySearch(query: string) {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 3
      })
    });

    const data = await response.json();

    if (!data.results) throw new Error("No results from Tavily");

    // Return the direct answer if available, otherwise join snippets
    const content = data.answer || data.results.map((r: any) => `${r.title}: ${r.content}`).join("\n\n");

    return { results: content };
  } catch (e) {
    console.error("[Tavily Search] Error:", e);
    return { results: "Standard SLA: 15 working days. (Search failed)" };
  }
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const command = new ReverseGeocodeCommand({
      QueryPosition: [lng, lat], // Amazon Location uses [lng, lat]
      MaxResults: 1
    });

    const response = await geoPlacesClient.send(command);
    const place = response.ResultItems?.[0]?.Address;

    if (!place) throw new Error("No results");

    // Robust collection of all unique address components
    const allParts: string[] = [];
    const collect = (val: any) => {
      let str = "";
      if (typeof val === 'string') str = val;
      else if (val && typeof val === 'object' && 'Name' in val) str = String(val.Name);
      else if (val && typeof val === 'object' && 'Code' in val) str = String(val.Code);
      else if (val) str = String(val);

      if (!str || str === "undefined" || str === "[object Object]") return;

      str.split(',').forEach(p => {
        const trimmed = p.trim();
        if (trimmed && !allParts.includes(trimmed)) allParts.push(trimmed);
      });
    };

    // Priority order: Locality -> District -> SubRegion -> Region
    collect(place.Locality);
    collect(place.District);
    collect(place.SubRegion);
    collect(place.Region);

    // Heuristic for India mapping: [Locality/Town, District, State]
    // Analyzing typical Amazon Location patterns for Bharat
    let city = "";
    let district = "";
    let state = "";

    // 1. Identify District (usually in SubRegion or sometimes in Locality)
    const subRegionStr = typeof place.SubRegion === 'string' ? place.SubRegion : place.SubRegion?.Name || "";
    const localityStr = place.Locality || "";
    const districtStr = typeof place.District === 'string' ? place.District : "";

    // In Kerala/India, the larger name (Ernakulam, Kollam, etc) is the District.
    // If Locality and SubRegion both exist and are the same, that's usually the District.
    if (localityStr && subRegionStr && localityStr === subRegionStr) {
      district = localityStr;
      city = districtStr; // The "District" field in Amazon Location often actually contains the Town name
    } else {
      city = localityStr || districtStr || (allParts.length >= 1 ? allParts[0] : "");
      district = subRegionStr || (allParts.length >= 2 ? allParts[1] : "");
    }

    state = place.Region?.Name || place.Region?.Code || (allParts.length >= 3 ? allParts[2] : "");

    // Final scrub: ensure no commas remain in individual fields
    const scrub = (s: string) => String(s || "").split(',')[0].trim();

    const result = {
      landmark: place.Label || "",
      area: districtStr || localityStr || "",
      pincode: place.PostalCode || "",
      city: scrub(city),
      district: scrub(district),
      state: scrub(state)
    };

    console.log("[DEBUG] Raw Geocode Mapping:", {
      original: {
        Locality: place?.Locality,
        SubRegion: place?.SubRegion,
        District: place?.District,
        Region: place?.Region?.Name
      },
      fused: result
    });

    return result;
  } catch (e) {
    console.error("[AWS Geo-Places] Error:", e);
    return { error: "Professional map service unavailable", lat, lng };
  }
}
