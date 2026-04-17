export type StageKey =
  | "warm"
  | "engaged"
  | "contacted"
  | "replied"
  | "interested"
  | "callback"
  | "meeting"
  | "proposal"
  | "nurture"
  | "won";

export const DEFAULT_STAGES: { name: string; key: StageKey; color: string }[] = [
  { name: "Warm", key: "warm", color: "#f5a623" },
  { name: "Engaged", key: "engaged", color: "#e9c46a" },
  { name: "Contacted", key: "contacted", color: "#7cb342" },
  { name: "Replied", key: "replied", color: "#2e8b57" },
  { name: "Interested", key: "interested", color: "#2ca6a4" },
  { name: "Callback Received", key: "callback", color: "#3a86ff" },
  { name: "Meeting Scheduled", key: "meeting", color: "#5e60ce" },
  { name: "Proposal Sent", key: "proposal", color: "#8338ec" },
  { name: "Long Term Nurture", key: "nurture", color: "#d6336c" },
  { name: "Closed Won", key: "won", color: "#8b0000" },
];

export function bandClass(color: string): string {
  const map: Record<string, string> = {
    "#f5a623": "stage-band-warm",
    "#e9c46a": "stage-band-engaged",
    "#7cb342": "stage-band-contacted",
    "#2e8b57": "stage-band-replied",
    "#2ca6a4": "stage-band-interested",
    "#3a86ff": "stage-band-callback",
    "#5e60ce": "stage-band-meeting",
    "#8338ec": "stage-band-proposal",
    "#d6336c": "stage-band-nurture",
    "#8b0000": "stage-band-won",
  };
  return map[color.toLowerCase()] ?? "stage-band-warm";
}
