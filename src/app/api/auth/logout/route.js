export async function POST() {
  const response = new Response(JSON.stringify({ success: true }), { status: 200 });
  response.headers.set(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; SameSite=Strict; Secure; Max-Age=0"
  );
  return response;
}
