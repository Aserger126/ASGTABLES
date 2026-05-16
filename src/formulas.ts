import React from 'react';
import type { Cell } from './types';

export const evaluateFormula = (formula: string, getCellValue: (row: number, col: number) => any): string | number => {
  // Тут удаляем пробелы и переводим в верхний буквы (toUpperCase)
  const cleanFormula = formula.trim().toUpperCase();
  
  if (cleanFormula.startsWith('=')) {
    const expression = cleanFormula.substring(1);
    
    // SUM(A1:A5) - пример
    const sumMatch = expression.match(/^SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/i);
    if (sumMatch) {
      const startCol = colLetterToIndex(sumMatch[1]);
      const startRow = parseInt(sumMatch[2]) - 1;
      const endCol = colLetterToIndex(sumMatch[3]);
      const endRow = parseInt(sumMatch[4]) - 1;
      
      let sum = 0;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const val = getCellValue(row, col);
          if (typeof val === 'number') sum += val;
        }
      }
      return sum;
    }
    
    // AVERAGE(B1:B3) - пример СРЕД АРИФМА
    const avgMatch = expression.match(/^AVERAGE\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)$/i);
    if (avgMatch) {
      const startCol = colLetterToIndex(avgMatch[1]);
      const startRow = parseInt(avgMatch[2]) - 1;
      const endCol = colLetterToIndex(avgMatch[3]);
      const endRow = parseInt(avgMatch[4]) - 1;
      
      let sum = 0;
      let count = 0;
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const val = getCellValue(row, col);
          if (typeof val === 'number') {
            sum += val;
            count++;
          }
        }
      }
      return count > 0 ? sum / count : 0;
    }
    
    // Простые A1+B1, A1*2 и т.д. смотри код 
    const arithmeticMatch = expression.match(/^([A-Z]+\d+)([+\-*/])([A-Z]+\d+|\d+)$/i);
    if (arithmeticMatch) {
      const left = parseReference(arithmeticMatch[1], getCellValue);
      const operator = arithmeticMatch[2];
      const right = parseReference(arithmeticMatch[3], getCellValue);
      
      if (left !== null && right !== null && typeof left === 'number' && typeof right === 'number') {
        switch (operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          default: return '#ERROR!';
        }
      }
    }
  }
  
  return '#ERROR!';
};

// Преобразование буквы колонки в индекс (A=0, B=1)
export const colLetterToIndex = (letter: string): number => {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
};

// Преобразование индекса в букву колонки типа наоборот см выше
export const indexToColLetter = (index: number): string => {
  let letter = '';
  let num = index + 1;
  while (num > 0) {
    num--;
    letter = String.fromCharCode(65 + (num % 26)) + letter;
    num = Math.floor(num / 26);
  }
  return letter;
};

// Парсинг ссылки на ячейку (A1 -> [0,0])
export const parseCellReference = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (match) {
    const col = colLetterToIndex(match[1]);
    const row = parseInt(match[2]) - 1;
    return { row, col };
  }
  return null;
};

// Получение значения из ссылки
const parseReference = (ref: string, getCellValue: (row: number, col: number) => any): any => {
  if (!isNaN(Number(ref))) {
    return Number(ref);
  }
  
  const parsed = parseCellReference(ref);
  if (parsed) {
    return getCellValue(parsed.row, parsed.col);
  }
  return null;
};

// Проверка, является ли значение числом
export const isNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value);
};

// Форматирование значения для отображения
export const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return value.toString();
  return value.toString();
};