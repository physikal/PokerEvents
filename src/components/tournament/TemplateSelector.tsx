import { useState } from 'react';
import { TournamentTemplate } from '../../types/tournament';
import { Settings, Plus, Pencil, Trash2 } from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';
import CustomTemplateEditor from './CustomTemplateEditor';

interface TemplateSelectorProps {
  onSelect: (template: TournamentTemplate) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { templates, customTemplates, saveTemplate, deleteTemplate, loading } = useTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TournamentTemplate | undefined>();

  const handleEdit = (template: TournamentTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleSave = async (template: TournamentTemplate) => {
    try {
      await saveTemplate(template);
      setShowEditor(false);
      setEditingTemplate(undefined);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
      } catch {
        // Error is handled by the hook
      }
    }
  };

  if (loading) {
    return (
      <button className="btn-secondary p-2 rounded-full opacity-50" disabled>
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary p-2 rounded-full"
        title="Tournament Templates"
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-72 card z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tournament Templates</h3>
            <button
              onClick={() => {
                setEditingTemplate(undefined);
                setShowEditor(true);
              }}
              className="text-poker-red hover:text-red-400"
              title="Create Custom Template"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {templates.map((template) => {
              const isCustom = customTemplates.some(t => t.id === template.id);
              return (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <button
                    onClick={() => {
                      onSelect(template);
                      setIsOpen(false);
                    }}
                    className="text-left flex-1"
                  >
                    {template.name}
                  </button>
                  {isCustom && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-gray-400 hover:text-white"
                        title="Edit Template"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showEditor && (
        <CustomTemplateEditor
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(undefined);
          }}
          initialTemplate={editingTemplate}
        />
      )}
    </div>
  );
}