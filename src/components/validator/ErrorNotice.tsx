
import React from 'react';

interface ErrorNoticeProps {
  error: string;
}

export const ErrorNotice = ({ error }: ErrorNoticeProps) => {
  return (
    <div className="my-4 p-5 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
      <h3 className="text-xl font-semibold text-red-500 mb-2">Error</h3>
      <p className="text-muted-foreground">{error}</p>
    </div>
  );
};
