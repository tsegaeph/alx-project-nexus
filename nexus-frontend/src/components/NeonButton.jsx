import "../styles/neon-button.css";
export default function NeonButton({ children, ...props }) {
  return <button className="neon-btn" {...props}>{children}</button>
}