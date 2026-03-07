export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/CGNT-1/Aether/main/public/status.json",
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
