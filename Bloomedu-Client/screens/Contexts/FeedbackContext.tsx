import React, { createContext, useState, ReactNode } from 'react';

export type Child = {
  id: number;
  name: string;
  surname: string;
  birthDate?: string;
  gender?: string;
  feedbacks?: string[];
};

type FeedbackContextType = {
  childrenList: Child[];
  setChildrenList: React.Dispatch<React.SetStateAction<Child[]>>;
  addFeedback: (childId: number, feedbackText: string) => void;
};

export const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

type FeedbackProviderProps = {
  children: ReactNode;
};

export const FeedbackProvider = ({ children }: FeedbackProviderProps) => {
  const [childrenList, setChildrenList] = useState<Child[]>([
    // İstersen başlangıçta örnek çocukları buraya ekleyebilirsin
    { id: 1, name: 'Gozde', surname: 'Ulu', birthDate: '2003-06-30', gender: 'Female', feedbacks: [] },
    { id: 2, name: 'Umut', surname: 'Cingisiz', birthDate: '2017-03-25', gender: 'Male', feedbacks: [] },
  ]);

  const addFeedback = (childId: number, feedbackText: string) => {
    setChildrenList((prevList) =>
      prevList.map((child) =>
        child.id === childId
          ? {
              ...child,
              feedbacks: child.feedbacks ? [...child.feedbacks, feedbackText] : [feedbackText],
            }
          : child
      )
    );
  };

  return (
    <FeedbackContext.Provider value={{ childrenList, setChildrenList, addFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};
