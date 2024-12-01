from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId

class Database:
    def __init__(self):
        # MongoDB接続設定 (実際の展開時は環境変数から読み込むことを推奨)
        self.client = MongoClient('mongodb://mongodb:27017/')
        self.db = self.client.expense_tracker
        self.expenses = self.db.expenses

    def add_expense(self, expense_data):
        expense = {
            'date': expense_data['date'],
            'category': expense_data['category'],
            'amount': float(expense_data['amount']),
            'description': expense_data['description'],
            'created_at': datetime.utcnow()
        }
        result = self.expenses.insert_one(expense)
        expense['_id'] = str(result.inserted_id)
        return expense

    def get_expenses(self):
        expenses = list(self.expenses.find())
        # ObjectIdをstring型に変換
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
        return expenses

    def delete_expense(self, expense_id):
        result = self.expenses.delete_one({'_id': ObjectId(expense_id)})
        return result.deleted_count > 0

    def get_total(self):
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'total': {'$sum': '$amount'}
                }
            }
        ]
        result = list(self.expenses.aggregate(pipeline))
        return result[0]['total'] if result else 0

# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Database

app = Flask(__name__)
CORS(app)
db = Database()

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = db.get_expenses()
    return jsonify(expenses)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    expense_data = request.json
    expense = db.add_expense(expense_data)
    return jsonify(expense), 201

@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    success = db.delete_expense(expense_id)
    if success:
        return '', 204
    return jsonify({'error': 'Expense not found'}), 404

@app.route('/api/expenses/total', methods=['GET'])
def get_total():
    total = db.get_total()
    return jsonify({'total': total})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)