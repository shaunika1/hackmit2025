"use client";
import { useState, useEffect } from "react";

export default function Chatbot() {
  const [bpm, setBpm] = useState(null);

  useEffect(() => {
    const fetchBpm = async () => {
      try {
        const res = await fetch("http://<pi-ip>:5000/bpm"); // Replace <pi-ip>
        const data = await res.json();
        setBpm(data.bpm);
      } catch (err) {
        console.error("Error fetching BPM:", err);
      }
    };

    // Fetch every 5 seconds
    fetchBpm();
    const interval = setInterval(fetchBpm, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold">Health Chatbot</h1>
      <p className="mt-4">Your current BPM: {bpm ? bpm : "Loading..."}</p>
      <div className="mt-6 border p-4 rounded-lg w-80">
        {bpm && bpm > 100 ? (
          <p className="text-red-500">⚠️ High heart rate detected!</p>
        ) : bpm && bpm < 60 ? (
          <p className="text-yellow-500">⚠️ Low heart rate detected!</p>
        ) : bpm ? (
          <p className="text-green-500">✅ Normal heart rate.</p>
        ) : (
          <p>Waiting for sensor data...</p>
        )}
      </div>
    </div>
  );
}
