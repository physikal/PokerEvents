import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { BlindTemplate, ChipTemplate, TournamentTemplate } from '../../types/tournament';

interface CustomTemplateEditorProps {
  onSave: (template: TournamentTemplate) => void;
  onClose: () => void;
  initialTemplate?: TournamentTemplate;
}

export default function CustomTemplateEditor({ onSave, onClose, initialTemplate }: CustomTemplateEditorProps) {
  const [name, setName] = useState(initialTemplate?.name || '');
  const [blindLevels, setBlindLevels] = useState(
    initialTemplate?.blindTemplate.levels || [
      { id: '1', smallBlind: 25, bigBlind: 50, ante: 0, duration: 20 }
    ]
  );
  const [chips, setChips] = useState(
    initialTemplate?.chipTemplate.chips || [
      { value: 25, color: '#DC2626', quantity: 20 }
    ]
  );

  const addBlindLevel = () => {
    const lastLevel = blindLevels[blindLevels.length - 1];
    const newLevel = {
      id: `${blindLevels.length + 1}`,
      smallBlind: lastLevel.smallBlind * 2,
      bigBlind: lastLevel.bigBlind * 2,
      ante: lastLevel.ante * 2 || lastLevel.smallBlind / 2,
      duration: lastLevel.duration
    };
    setBlindLevels([...blindLevels, newLevel]);
  };

  const removeBlindLevel = (index: number) => {
    setBlindLevels(blindLevels.filter((_, i) => i !== index));
  };

  const updateBlindLevel = (index: number, field: string, value: number) => {
    setBlindLevels(
      blindLevels.map((level, i) =>
        i === index ? { ...level, [field]: value } : level
      )
    );
  };

  const addChip = () => {
    const lastChip = chips[chips.length - 1];
    const newChip = {
      value: lastChip.value * 5,
      color: '#000000',
      quantity: Math.max(5, Math.floor(lastChip.quantity / 2))
    };
    setChips([...chips, newChip]);
  };

  const removeChip = (index: number) => {
    setChips(chips.filter((_, i) => i !== index));
  };

  const updateChip = (index: number, field: string, value: string | number) => {
    setChips(
      chips.map((chip, i) =>
        i === index ? { ...chip, [field]: value } : chip
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template: TournamentTemplate = {
      id: initialTemplate?.id || `custom-${Date.now()}`,
      name,
      blindTemplate: {
        id: `blind-${Date.now()}`,
        name: `${name} Blinds`,
        levels: blindLevels
      },
      chipTemplate: {
        id: `chip-${Date.now()}`,
        name: `${name} Chips`,
        chips
      }
    };

    onSave(template);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card w-full max-w-4xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {initialTemplate ? 'Edit Template' : 'Create Custom Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-1">
              Template Name <span className="text-poker-red">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Blind Structure</h3>
              <button
                type="button"
                onClick={addBlindLevel}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus size={16} />
                Add Level
              </button>
            </div>
            <div className="space-y-3">
              {blindLevels.map((level, index) => (
                <div key={level.id} className="grid grid-cols-5 gap-3">
                  <div>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="Small Blind"
                      value={level.smallBlind}
                      onChange={(e) => updateBlindLevel(index, 'smallBlind', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="Big Blind"
                      value={level.bigBlind}
                      onChange={(e) => updateBlindLevel(index, 'bigBlind', Number(e.target.value))}
                      min="2"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="Ante"
                      value={level.ante}
                      onChange={(e) => updateBlindLevel(index, 'ante', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="Duration (min)"
                      value={level.duration}
                      onChange={(e) => updateBlindLevel(index, 'duration', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeBlindLevel(index)}
                        className="btn-secondary p-2 w-full"
                      >
                        <Trash2 size={16} className="mx-auto text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chip Distribution</h3>
              <button
                type="button"
                onClick={addChip}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus size={16} />
                Add Chip
              </button>
            </div>
            <div className="space-y-3">
              {chips.map((chip, index) => (
                <div key={index} className="grid grid-cols-4 gap-3">
                  <div>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="Value"
                      value={chip.value}
                      onChange={(e) => updateChip(index, 'value', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="color"
                      className="input w-full h-[42px]"
                      value={chip.color}
                      onChange={(e) => updateChip(index, 'color', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="Quantity"
                      value={chip.quantity}
                      onChange={(e) => updateChip(index, 'quantity', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeChip(index)}
                        className="btn-secondary p-2 w-full"
                      >
                        <Trash2 size={16} className="mx-auto text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}