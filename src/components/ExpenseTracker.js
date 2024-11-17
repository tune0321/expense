'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    date: '',
    category: '',
    amount: '',
    description: ''
  });

  const categories = [
    '食費',
    '交通費',
    '住居費',
    '光熱費',
    '通信費',
    '娯楽費',
    'その他'
  ];

  // データの取得
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // 支出の追加
  const addExpense = async () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) return;
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });
      
      if (response.ok) {
        await fetchExpenses();
        setNewExpense({
          date: '',
          category: '',
          amount: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  // 支出の削除
  const deleteExpense = async (id) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // 合計金額の計算
  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6">家計簿管理</h1>
      
      {/* 入力フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="date"
          value={newExpense.date}
          onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
        />
        <select
          value={newExpense.category}
          onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
        >
          <option value="">カテゴリを選択</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="金額"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="説明"
          value={newExpense.description}
          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
        />
      </div>
      
      {/* 追加ボタン */}
      <button
        onClick={addExpense}
        className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors mb-6"
      >
        <PlusCircle className="w-5 h-5" />
        追加
      </button>

      {/* 支出リスト */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">支出一覧</h2>
        {expenses.map(expense => (
          <div key={expense.id} 
               className="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div className="flex-1 grid grid-cols-4 gap-4">
              <span>{expense.date}</span>
              <span className="font-medium">{expense.category}</span>
              <span className="text-right">{Number(expense.amount).toLocaleString()}円</span>
              <span className="text-gray-600">{expense.description}</span>
            </div>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="ml-4 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* 合計金額 */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-xl font-bold text-right">
          合計: {calculateTotal().toLocaleString()}円
        </p>
      </div>
    </div>
  );
};

export default ExpenseTracker;
