
'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Camera } from 'lucide-react';

// Next.jsの環境変数はNEXT_PUBLIC_で始まるものを直接参照
const API_URL = 'http://localhost:4000';

const ExpenseTracker = () => {
  // 以下のコードは同じなので省略せず完全に記載
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

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('データの取得に失敗しました');
    }
  };

  const addExpense = async () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) {
      alert('日付、カテゴリ、金額は必須項目です');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        const addedExpense = await response.json();
        setExpenses([...expenses, addedExpense]);
        setNewExpense({
          date: '',
          category: '',
          amount: '',
          description: ''
        });
      } else {
        throw new Error('Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('支出の追加に失敗しました');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense._id !== id));
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('支出の削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded">入力</button>
          <button className="px-4 py-2 bg-gray-200 rounded">検索</button>
          <button className="px-4 py-2 bg-gray-200 rounded">一覧</button>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" className="border p-2 rounded" placeholder="フリーワード" />
          <Camera className="w-6 h-6 text-gray-500" />
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="w-20">日付</span>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="flex-1 p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <span className="w-20">金額</span>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="flex-1 p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <span className="w-20">分類</span>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="flex-1 p-2 border rounded"
            >
              <option value="">選択してください</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <span className="w-20">メモ</span>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="flex-1 p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={addExpense}
          className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600"
        >
          <PlusCircle className="w-5 h-5" />
          追加
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border-b text-left">日付</th>
              <th className="p-2 border-b text-left">分類</th>
              <th className="p-2 border-b text-right">金額</th>
              <th className="p-2 border-b text-left">メモ</th>
              <th className="p-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense._id} className="hover:bg-gray-50">
                <td className="p-2 border-b">{formatDate(expense.date)}</td>
                <td className="p-2 border-b">{expense.category}</td>
                <td className="p-2 border-b text-right">{Number(expense.amount).toLocaleString()}</td>
                <td className="p-2 border-b">{expense.description}</td>
                <td className="p-2 border-b text-center">
                  <button
                    onClick={() => deleteExpense(expense._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold">
              <td className="p-2 border-t" colSpan="2">合計</td>
              <td className="p-2 border-t text-right">{calculateTotal().toLocaleString()}</td>
              <td className="p-2 border-t" colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTracker;
