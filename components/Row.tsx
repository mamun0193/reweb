const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between border-b border-gray-700 py-1">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
export default Row;