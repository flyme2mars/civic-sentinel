import { BedrockRuntimeClient, ConverseCommand, ConverseCommandInput } from "@aws-sdk/client-bedrock-runtime";
import { ReverseGeocodeCommand } from "@aws-sdk/client-geo-places";
import { bedrockClient, geoPlacesClient, AWS_CONFIG } from "./config";
import { benchmark } from "../utils/benchmarking";

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

<routing_rules>
For this specific jurisdiction prototype, you MUST evaluate the issue and route it to one of the following exact local authorities if it matches their domain:
- "PWD (Roads)" — Use for potholes, broken public roads, and general road infrastructure.
- "Kerala Water Authority (KWA)" — Use for potable water pipe leaks, burst mains.
- "KSEB (Electricity) - Section Office" — Use for broken streetlights, hanging wires, electrical poles.
- "Health & Sanitation Dept" — Use for uncleared garbage, waste dumps, dead animals, and public hygiene.
- "National Highways Authority of India (NHAI)" — Use ONLY if the issue is explicitly on a National Highway (e.g., NH 66).

If the issue absolutely does not fit any of these, deduce the most logical state/central department.
</routing_rules>

<instruction>
1. Analyze the citizen's evidence and extract the core issue.
2. Determine the precise central/state government department responsible (e.g., Public Works Department (PWD), State Electricity Board, Water Authority).
3. Determine the official designation of the officer/officers in the specified department who are responsible for mitigating or solving the issue. 
4. Evaluate the severity of the issue based on public safety and infrastructure impact.
5. Consider the map data from the tool reverse_geocode. IF RAW GPS IS PROVIDED, YOU MUST CALL THE reverse_geocode TOOL.
6. ABSOLUTE LOCATION OVERRIDE: The citizen's textual description is the absolute ground truth. If the citizen names a specific town, city, district, or landmark (e.g., "Ranni Kottayam"), you MUST completely override the reverse_geocode map data and use the citizen's exact input for the City and District fields.
7. Look for shop names or signs in the image to refine the landmark.
8. The output must include a precise Landmark, Area, Pincode, City, District, and State.
9. DO NOT combine city, district, and state into one field. Each MUST be a single, clean name (e.g., City: "Kottarakkara", District: "Kollam", State: "Kerala").
10. The success criteria must include details like which type of standard set up by the government or the regulating body must be followed. 
11. Generate a concise, highly professional title for the issue. DO NOT start the title with "Formal Complaint:", "Complaint regarding", or any similar prefix. Start directly with the core issue.
12. Determine a realistic, dynamic Service Level Agreement (SLA) in hours based on the severity. You must use these ranges: CRITICAL (life-threatening/major hazard) = 24 to 48 hours; HIGH (major disruption) = 72 to 168 hours; MEDIUM/LOW (routine maintenance) = 336 to 720 hours.
</instruction>

<example>
{
  "investigation_step": "Citizen reported a large water-filled pothole on NH 66. Severity assessed as CRITICAL due to active accident risk on a national arterial corridor. Setting a strict 48-hour SLA based on the CRITICAL rating.",
  "draft": {
    "title": "Dangerous Water-Filled Pothole and Pavement Deterioration on NH 66 at Varappuzha",
    "category": "Infrastructure",
    "severity": "CRITICAL",
    "target_department": "National Highways Authority of India (NHAI)",
    "official_designation": "Project Director, NHAI (Kerala RO) / Executive Engineer",
    "summary": "This complaint formally brings to the attention of the competent authority the existence of a severe, water-filled pothole accompanied by extensive radial pavement cracking on National Highway 66 (NH 66), located at Varappuzha. The pothole exhibits full pavement layer penetration, structural sub-base exposure, and accumulated stagnant water rendering its true depth indeterminate to motorists — a condition of acute hazard. The responsible department is urgently directed to mobilise emergency patch repair within the stipulated SLA, undertake comprehensive structural investigation, and implement permanent resurfacing with appropriate water drainage remediation.",
    "location": {
      "landmark": "NH 66 Carriageway, Near Varappuzha Bridge",
      "area": "Varappuzha",
      "pincode": "683517",
      "city": "North Paravur",
      "district": "Ernakulam",
      "state": "Kerala"
    },
    "legal_sla_hours": 48,
    "success_criteria": [
      "Emergency cold-mix or hot-mix bituminous patch repair of the reported pothole completed within 48 hours",
      "Deployment of adequate warning signage and reflective barricades at the site until permanent repair is executed",
      "Comprehensive structural condition survey of the NH 66 stretch conducted within 7 days",
      "Written closure report with geo-tagged photographic evidence of completed repairs submitted to the complainant"
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
    "legal_sla_hours": <integer representing calculated hours>,
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
  const startTime = benchmark.start();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

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
      
      // Benchmarking usage
      if (response.usage) {
        totalInputTokens += response.usage.inputTokens || 0;
        totalOutputTokens += response.usage.outputTokens || 0;
      }

      const outputMessage = response.output?.message;
      if (!outputMessage) throw new Error("No response");
      messages.push(outputMessage);

      console.log("[DEBUG] Agent message content:", outputMessage.content);

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

      // If we reached here, it's NOT a tool use stop, or tool use failed to provide content
      const finalContent = outputMessage.content?.find(c => c.text)?.text;
      if (finalContent) {
        console.log("[DEBUG] Raw AI Final Text:", finalContent);
        const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          benchmark.end("Bedrock Agent Drafting", startTime, {
            input: totalInputTokens,
            output: totalOutputTokens
          });
          return result;
        }
      }
      
      // If we are at the end of the loop and haven't found JSON, return what we have
      if (i === 4) {
        benchmark.end("Bedrock Agent Drafting (FAILED)", startTime, {
          input: totalInputTokens,
          output: totalOutputTokens
        });
        return { error: "Agent reached maximum steps without generating a formal draft.", raw: finalContent };
      }
    }
  } catch (error) { 
    benchmark.end("Bedrock Agent Drafting (ERROR)", startTime);
    throw error; 
  }
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
