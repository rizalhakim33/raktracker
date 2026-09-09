import { VED_COLOR } from "../lib/constants.js";
export default function VedBadge({ value, size="sm" }){
  const v = value || "Desirable";
  const color = VED_COLOR[v] || "zinc";
  const cls = {
    Vital: "bg-danger text-white border-danger",
    Essential: "bg-warning text-white border-warning",
    Desirable: "bg-primary-light text-text-secondary border-border",
  }[v] || "bg-primary-light text-text-secondary border-border";
  const sz = size==="sm" ? "caption px-2 py-0.5" : "body-sm px-2.5 py-1";
  return <span className={`inline-flex items-center border rounded-full font-medium ${cls} ${sz}`}>{v}</span>;
}
