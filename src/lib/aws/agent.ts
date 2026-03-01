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
      description: "Get pinpoint address including sub-locality, area, and city from GPS coordinates using professional maps.",
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
3. Evaluate the severity of the issue based on public safety and infrastructure impact.
4. Consider the map data from the tool reverse_geocode as the baseline. IF RAW GPS IS PROVIDED, YOU MUST CALL THE reverse_geocode TOOL.
5. IMPORTANT: If the citizen mentions a specific locality name (e.g. "Chenkulam") in their text/audio, PRIORITIZE that over the map's area name. 
6. Look for shop names or signs in the image to refine the landmark.
7. The output must include a precise Landmark, Area, Pincode, City, District, and State.
8. DO NOT combine city, district, and state into one field. Each MUST be a single, clean name (e.g., City: "Kottarakkara", District: "Kollam", State: "Kerala").
</instruction>

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
    let city: string = place.Locality || (allParts.length >= 1 ? allParts[0] : "");
    let district: string = (allParts.length >= 2 ? allParts[1] : (typeof place.SubRegion === 'string' ? place.SubRegion : ""));
    let state: string = (allParts.length >= 3 ? allParts[2] : (place.Region?.Name || ""));

    // Final scrub: ensure no commas remain in individual fields
    const scrub = (s: string) => s.split(',')[0].trim();

    const area = (typeof place.District === 'string' ? place.District : "") ||
      (typeof place.SubRegion === 'string' ? place.SubRegion : "") ||
      (allParts.length > 0 ? allParts[0] : "");

    return {
      landmark: place.Label || "",
      area: area,
      pincode: place.PostalCode || "",
      city: scrub(city),
      district: scrub(district),
      state: scrub(state)
    };
  } catch (e) {
    console.error("[AWS Geo-Places] Error:", e);
    return { error: "Professional map service unavailable", lat, lng };
  }
}
