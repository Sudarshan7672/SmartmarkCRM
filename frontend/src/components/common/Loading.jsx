export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      {/* <p className="mt-4 text-gray-700">Loading...</p> */}
    </div>
  );
}