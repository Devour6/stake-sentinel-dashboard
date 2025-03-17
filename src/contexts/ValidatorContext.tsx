
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ValidatorI } from '@/services/api/interfaces';

interface ValidatorContextType {
  validators: ValidatorI[] | null;
  setValidators: (validators: ValidatorI[] | null) => void;
}

export const ValidatorContext = createContext<ValidatorContextType | null>(null);

export const ValidatorProvider = ({ children }: { children: ReactNode }) => {
  const [validators, setValidators] = useState<ValidatorI[] | null>(null);

  return (
    <ValidatorContext.Provider value={{ validators, setValidators }}>
      {children}
    </ValidatorContext.Provider>
  );
};

export const useValidators = () => {
  const context = useContext(ValidatorContext);
  
  if (!context) {
    throw new Error('useValidators must be used within a ValidatorProvider');
  }
  
  return context;
};
