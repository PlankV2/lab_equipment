"use client";

import { createContext, useContext, useState } from "react";

const BorrowContext = createContext();

export function BorrowProvider({ children }) {
  const [borrowList, setBorrowList] = useState([]);

  const addToBorrowList = (item) => {
    setBorrowList((prev) => [...prev, item]);
  };

  return (
    <BorrowContext.Provider value={{ borrowList, addToBorrowList }}>
      {children}
    </BorrowContext.Provider>
  );
}

export const useBorrow = () => useContext(BorrowContext);
