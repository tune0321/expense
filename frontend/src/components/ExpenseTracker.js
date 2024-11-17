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

  // 主な修正点: APIエンドポイントがないため、ローカルでデータを管理するように変更
  const addExpense = () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) {
      alert('日付、カテゴリ、金額は必須項目です');
      return;
    }
    
    const expenseToAdd = {
      id: Date.now(), // ユニークなIDを生成
      ...newExpense,
      amount: Number(newExpense.amount) // 文字列を数値に変換
    };

    setExpenses([...expenses, expenseToAdd]);
    
    // フォームをリセット
    setNewExpense({
      date: '',
      category: '',
      amount: '',
      description: ''
    });
  };

  // 支出の削除
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // 合計金額の計算
  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // データが変更されたらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

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
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">支出データがありません</p>
        ) : (
          expenses.map(expense => (
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
          ))
        )}
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
