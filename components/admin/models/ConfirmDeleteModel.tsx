"use client";

interface ConfirmDeleteProps {
  userEmail: string;
  onCancel: () => void;
  onConfirm: () => void;
}
const ConfirmDeleteModel = ({
  userEmail,
  onCancel,
  onConfirm,
}: ConfirmDeleteProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-slate-800 p-6 h-[50vh] rounded-xl border border-slate-700 w-full max-w-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-white text-xl font-bold p-2 mb-15">
          Confirm Delete
        </h1>

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          ✕
        </button>

        <div className="flex flex-2 flex-col border border-slate-700/5 bg-slate-900/50 rounded-lg pb-10">
          <div className="font-mono text-slate-300 pt-15 p-5">
            {`Are you sure you want to delete user `}
            <span className="font-mono text-slate-50">{userEmail}</span>
          </div>
        </div>

        <div className="flex flex-2 gap-5 pt-15">
          <button
            onClick={onCancel}
            className="w-full py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-2 bg-red-600 text-white border border-red-800 hover:bg-red-800 hover:text-red-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModel;
