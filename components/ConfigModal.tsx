import React from 'react';
import { TimesheetConfig } from '@/types/timesheet';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimesheetConfig;
  onSave: (newConfig: TimesheetConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<TimesheetConfig>(config);

  React.useEffect(() => {
    setFormData(config);
  }, [config]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Edit Template Defaults & Repeated Values</h2>
            <p className="text-xs text-slate-500">Values entered here will populate each row and header in the exact template.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NAME of PROJECT (Header)</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">UNIT / DIVISION</label>
              <input
                type="text"
                name="unitDivision"
                value={formData.unitDivision}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NAME (Employee)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">MII ID</label>
              <input
                type="text"
                name="miiId"
                value={formData.miiId}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SITE</label>
              <input
                type="text"
                name="site"
                value={formData.site}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DEFAULT ROW PROJECT NAME</label>
              <input
                type="text"
                name="rowProjectName"
                value={formData.rowProjectName}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DEFAULT ROW PROJECT ID</label>
              <input
                type="text"
                name="rowProjectId"
                value={formData.rowProjectId}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">APLIKASI TERDAMPAK</label>
              <input
                type="text"
                name="rowApp"
                value={formData.rowApp}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">AIP FITUR</label>
              <input
                type="text"
                name="rowAip"
                value={formData.rowAip}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DIVISI</label>
              <input
                type="text"
                name="rowDivisi"
                value={formData.rowDivisi}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DEPARTEMENT</label>
              <input
                type="text"
                name="rowDept"
                value={formData.rowDept}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SUB DEPARTEMENT</label>
              <input
                type="text"
                name="rowSubDept"
                value={formData.rowSubDept}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="font-bold text-xs text-slate-800 mb-2">Signature Box Names</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">TTD PEGAWAI</label>
                <input
                  type="text"
                  name="sig1"
                  value={formData.sig1}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">DI PERIKSA OLEH</label>
                <input
                  type="text"
                  name="sig2"
                  value={formData.sig2}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">DISETUJUI OLEH</label>
                <input
                  type="text"
                  name="sig3"
                  value={formData.sig3}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
