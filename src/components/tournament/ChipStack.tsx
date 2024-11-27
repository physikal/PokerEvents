import { ChipTemplate } from '../../types/tournament';

interface ChipStackProps {
  template: ChipTemplate;
}

export default function ChipStack({ template }: ChipStackProps) {
  return (
    <div className="card bg-gray-900">
      <h2 className="text-xl font-bold mb-4">Chip Distribution - {template.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {template.chips.map((chip) => (
          <div
            key={chip.value}
            className="p-4 rounded-lg bg-gray-800 flex flex-col items-center"
          >
            <div
              className="w-16 h-16 rounded-full mb-2"
              style={{ backgroundColor: chip.color }}
            />
            <div className="text-center">
              <div className="font-bold">${chip.value}</div>
              <div className="text-sm text-gray-400">x{chip.quantity}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}