import axios from "../api/axios";
import { useState, useEffect } from "react";

export function useGet(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let isMounted = true;
    setLoading(true); setError("");
    axios.get(url).then(r => {
      if (isMounted) setData(r.data);
    }).catch(e => {
      if (isMounted) setError(e.response?.data || "Error"); 
    }).finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; }
  }, deps);
  return { data, loading, error };
}