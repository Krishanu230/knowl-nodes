import React, { ReactElement } from 'react';

interface IProps {
  onClick: () => void;
  icon: ReactElement;
  text: string;
}

export default function ActionButton(props: IProps) {
  const { onClick, icon, text } = props;
  return (
    <button
      onClick={onClick}
      className="flex justify-center items-center gap-x-2 py-1 px-4 rounded-lg border bg-white shadow-md hover:bg-gray-100"
    >
      {icon}
      <div className="text-xs text-gray-600">{text}</div>
    </button>
  );
}
