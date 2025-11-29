import SellerSidebar from "../../components/SellerSidebar";
import "../../styles/theme.css";
import "../../styles/glass.css";
import "../../styles/neon-button.css";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// NOTE: This is a placeholder function. In a real application, you would
// fetch the seller's categories here and return true if the list is empty.
const checkCategoriesExist = () => {
    // Logic to check if categories exist (e.g., return true if count is 0)
    return true; 
};


export default function SellerDashboard() {
  const [range, setRange] = useState('monthly'); // 'daily' | 'weekly' | 'monthly'
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [total, setTotal] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [todayIncome, setTodayIncome] = useState(0);
  const [loading, setLoading] = useState(false);

  // Removed: modalOpen, sellerInfo, infoLoaded states

  async function fetchIncome(r = range) {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/orders/income/?range=${r}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const data = res.data || { labels: [], values: [], total: 0, lifetime_total: 0, today: 0 };
      setLabels(data.labels || []);
      setValues(data.values || []);
      setTotal(data.total || 0);
      setLifetimeTotal(data.lifetime_total || 0);
      setTodayIncome(data.today || 0);
    } catch (err) {
      console.error('Failed to fetch income data', err);
      setLabels([]);
      setValues([]);
      setTotal(0);
      setLifetimeTotal(0);
      setTodayIncome(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncome(range);
  }, [range]);

  const chartData = {
    labels: labels.map(l => {
      try { const d = new Date(l); return d.toLocaleDateString(); } catch { return l; }
    }),
    datasets: [
      {
        label: 'Income',
        data: values,
        borderColor: '#4b8fff',
        backgroundColor: 'rgba(75,143,255,0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4
      }
    ],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Removed: openSellerSettingsModal prop */}
      <SellerSidebar />

      <main style={{ marginLeft: 250, padding: "2.5em 2em", width: "100%" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.4em", color:"#92a4ce"}}>Dashboard</h2>
        <div style={{ color: "#b3ccf7", marginBottom: "1.6em" }}>Store performance</div>

        {/* Updated alert: 
          - Now uses the checkCategoriesExist function 
          - Removed modal opening logic from onClick 
        */}
        {checkCategoriesExist() && (
          <div 
            className="neon-alert" 
            onClick={() => console.log('Navigate to category creation page')}
            style={{
                color: '#80ffff', // Bright Cyan/Aqua for the text color
                textShadow: '0 0 5px rgba(37, 224, 224, 0.9), 0 0 10px rgba(128, 255, 255, 0.6)',
                cursor: 'pointer',
                margin: '1rem',
                fontSize: "1.1rem"
            }}
          >
            ⚡ Create categories first to add products!
          </div>
        )}

        <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
          <div className="glass-card" style={{ padding: 18, flex: 1 }}>
            <div style={{ fontSize: 14, color: "#9fb7ff" }}>Today's Income</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
              ${Number(todayIncome).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 18, flex: 1 }}>
            <div style={{ fontSize: 14, color: "#9fb7ff" }}>Lifetime Income</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
              ${Number(lifetimeTotal).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 14, color: "#9fb7ff", marginBottom: 8 }}>Range</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['daily','weekly','monthly'].map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="neon-btn"
                  style={{
                    background: range === r ? '#4b8fff' : undefined,
                    padding: '0.45em 0.8em',
                    fontSize: 13
                  }}
                >
                  {r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 18 }}>
          {loading ? (
            <div style={{ padding: 30, textAlign: 'center' }}>Loading chart...</div>
          ) : (
            <Line data={chartData} />
          )}
        </div>

        {/* Removed: Modal JSX block */}

      </main>
    </div>
  );
}