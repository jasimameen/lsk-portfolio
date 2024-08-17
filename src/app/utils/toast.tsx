import { toast, Toaster } from 'react-hot-toast';
import React from 'react';


export const showToast = (content: string, title: string | undefined | null = "", ) => {
  title = title || ""

  if (!title)  return;

  toast.custom(
    (t) => (
      <div
        className={`flex flex-col items-center justify-center p-4 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl text-white max-w-xs text-center transition-transform transform ${
          t.visible ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'
        }`}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className="flex justify-between items-center w-full">
          <span>{title}</span>
          <button
            className="text-white text-sm focus:outline-none"
            onClick={() => toast.dismiss(t.id)}
          >
            &#10005;
          </button>
        </div>
        <p className="mt-2 text-sm">{content}</p>
      </div>
    ),
    {
      position: 'top-right',
      duration: 3000,
    }
  );
};

// Exporting Toaster component to be used in layout.tsx
export const CustomToaster = () => <Toaster />;
