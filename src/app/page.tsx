'use client'

export default function Home() {

  async function startTraining(shouldSkipTraining: boolean) {
    const result = await (await fetch('/api/training', { method: "POST", body: JSON.stringify({ shouldSkipTraining }) })).json();
    console.log(result);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={() => startTraining(false)}>Test train</button>
      <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={() => startTraining(true)}>Test bucket</button>
    </main>
  )
}
