import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    const { pdf_base64 } = await req.json();
    if (!pdf_base64) return NextResponse.json({ error: "No PDF" }, { status: 400 });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1500,
        messages: [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf_base64 } },
          { type: "text", text: "Analiza esta factura de electricidad espanola y extrae en JSON puro sin backticks: {\"consumo_mensual_kwh\":numero,\"potencia_contratada_kw\":numero,\"tarifa\":\"indexada o fija o mixta\",\"coste_total_eur\":numero,\"precio_medio_kwh\":numero,\"periodo\":\"texto\",\"comercializadora\":\"nombre\",\"cups\":\"codigo\",\"tipo_tarifa\":\"2.0TD o 3.0TD o 6.1TD\",\"potencia_p1_kw\":numero o null,\"potencia_p2_kw\":numero o null,\"consumo_p1_kwh\":numero o null,\"consumo_p2_kwh\":numero o null,\"consumo_p3_kwh\":numero o null,\"penalizacion_reactiva\":0,\"tiene_fv\":false,\"resumen\":\"2-3 frases\"}. Devuelve SOLO el JSON." }
        ]}]
      })
    });
    const data = await resp.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    const txt = data.content?.map(c => c.text || "").join("") || "";
    const clean = txt.replace(/`json|`/g, "").trim();
    try { return NextResponse.json({ success: true, data: JSON.parse(clean) }); }
    catch { return NextResponse.json({ success: true, raw: clean }); }
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
