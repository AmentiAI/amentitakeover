import { Topbar } from "@/components/topbar";
import { AgentsWorkspace } from "./workspace";

export const dynamic = "force-dynamic";

export default function AiAgentsPage() {
  return (
    <>
      <Topbar title="AI Agents" />
      <AgentsWorkspace hasKey={Boolean(process.env.OPENAI_API_KEY?.trim())} />
    </>
  );
}
