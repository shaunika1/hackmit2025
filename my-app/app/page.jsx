import Chatbot from "@/components/chatbot";

export default function Page() {
  // Later this BPM will come from your Raspberry Pi backend
  const bpm = 110;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">BPM Wellness Monitor</h1>
      <p className="mb-6">
        Current BPM: <span className="font-semibold">{bpm}</span>
      </p>
      <Chatbot bpm={bpm} />
    </main>
  );
}
