import React from 'react';

interface SealerProps {
  items: string[];
}

export const List: React.FC<SealerProps> = ({ items }: SealerProps) => (
  <div>
    {items.length > 0 && (
      <ul>
        {items.map((item: string) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);
