import { Niveau } from "../db";
export const getNextGradeId = (
  niveaux: Niveau[], 
  currentType: number|string, 
  currentGrade: number 
): number| string | null => {
  const nextLevel = niveaux.find(
    (n) => n.type === currentType && n.grade === currentGrade + 1
  );

  return nextLevel ? nextLevel.id : null;
};

export const getByIdNiveau = (
  niveaux: Niveau[], 
  idJerena: string | number
): Niveau | null => {
  const valiny = niveaux.find((n) => n.id === idJerena);
  
  
  return valiny || null;
};
