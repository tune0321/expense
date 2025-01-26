'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Camera, Search, List } from 'lucide-react';

const API_URL = 'http://localhost:4000';

const ExpenseTracker = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    date: '',
    category: '',
    amount: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ほ食費',
    '交通費',
    '娯楽費',
    '通信費',
    '医療費',
    '教育費',
    'その他'
  ];

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/expenses`);
      const data = await response.json();
      setExpenses(data);
      setFilteredExpenses(data);
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
        setFilteredExpenses([...expenses, addedExpense]);
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
      alert('経費の追加に失敗しました');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedExpenses = expenses.filter(expense => expense._id !== id);
        setExpenses(updatedExpenses);
        setFilteredExpenses(updatedExpenses);
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('経費の削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const filtered = expenses.filter(expense => 
      expense.category.includes(searchTerm) || 
      expense.description.includes(searchTerm)
    );
    setFilteredExpenses(filtered);
  }, [searchTerm, expenses]);

  const calculateTotal = () => {
    return filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'add':
        return renderAddExpenseForm();
      case 'search':
        return renderSearchSection();
      case 'list':
      default:
        return renderExpenseList();
    }
  };

  const renderAddExpenseForm = () => (
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
          <span className="w-20">カテゴリ</span>
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
  );

  const renderSearchSection = () => (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <input 
          type="text" 
          placeholder="カテゴリまたはメモを検索" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded mr-2"
        />
        <Search className="w-6 h-6 text-gray-500" />
      </div>
      {renderExpenseList()}
    </div>
  );

  const renderExpenseList = () => (
    <div className="border rounded overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border-b text-left">日付</th>
            <th className="p-2 border-b text-left">カテゴリ</th>
            <th className="p-2 border-b text-right">金額</th>
            <th className="p-2 border-b text-left">メモ</th>
            <th className="p-2 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map(expense => (
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
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded ${activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <List className="w-5 h-5 inline-block mr-1" />
            一覧
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded ${activeTab === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Search className="w-5 h-5 inline-block mr-1" />
            検索
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <PlusCircle className="w-5 h-5 inline-block mr-1" />
            追加
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default ExpenseTracker;
