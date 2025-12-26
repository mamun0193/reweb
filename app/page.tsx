import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-6">

      <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
        Measure Your Website’s Environmental Impact
      </h1>

      <p className="text-lg text-gray-700 max-w-xl mb-8">
        Discover how much energy your website consumes and how much carbon it emits.
        Build a faster, cleaner, and greener web.
      </p>

      <Link
        href="/Home"
        className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-green-700 transition"
      >
        Analyze Your Website Now
      </Link>

      <p className="mt-6 text-sm text-gray-500">
        No sign-up required • Instant results • Eco-friendly 🌱
      </p>
    </main>
  );
}
