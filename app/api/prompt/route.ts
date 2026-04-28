import { PROMPT_DUENDE } from "@/lib/prompt-duende";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(PROMPT_DUENDE, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
