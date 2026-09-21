import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Removed: export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await dbConnect();

  const stream = new ReadableStream({
    async start(controller) {
      const changeStream = User.watch([
        { $match: { operationType: "insert" } },
      ]);

      changeStream.on("change", (change: any) => {
        const newUser = change.fullDocument;
        const payload = JSON.stringify({
          email: newUser.email,
          role: newUser.role,
        });

        controller.enqueue(new TextEncoder().encode(`data: ${payload}\n\n`));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        changeStream.close();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
