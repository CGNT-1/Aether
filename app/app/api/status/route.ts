export async function GET() {
  try {
    const res = await fetch("http://68.183.206.103:8000/status", {
      next: { revalidate: 30 }
    });
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
