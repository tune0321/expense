from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app)

# MongoDB接続設定
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://mongodb:27017/')
client = MongoClient(MONGODB_URI)
db = client.expense_tracker
expenses_collection = db.expenses

# エラーハンドリング用のカスタム例外
class APIError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__()
        self.message = message
        self.status_code = status_code

@app.errorhandler(APIError)
def handle_api_error(error):
    response = jsonify({'error': error.message})
    response.status_code = error.status_code
    return response

# 支出データの取得
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        # クエリパラメータの取得（オプショナル）
        category = request.args.get('category')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # フィルター条件の構築
        query = {}
        if category:
            query['category'] = category
        if start_date and end_date:
            query['date'] = {'$gte': start_date, '$lte': end_date}

        # データの取得
        expenses = list(expenses_collection.find(query).sort('date', -1))
        
        # ObjectIdをstring型に変換
        for expense in expenses:
            expense['_id'] = str(expense['_id'])
        
        return jsonify(expenses)

    except Exception as e:
        raise APIError(f"支出データの取得に失敗しました: {str(e)}", 500)

# 新規支出の追加
@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        expense_data = request.json

        # 必須フィールドの検証
        required_fields = ['date', 'category', 'amount']
        for field in required_fields:
            if not expense_data.get(field):
                raise APIError(f"{field}は必須項目です")

        # 金額のバリデーション
        try:
            amount = float(expense_data['amount'])
            if amount <= 0:
                raise ValueError
        except ValueError:
            raise APIError("金額は正の数値で入力してください")

        # データの整形
        expense = {
            'date': expense_data['date'],
            'category': expense_data['category'],
            'amount': amount,
            'description': expense_data.get('description', ''),
            'created_at': datetime.utcnow()
        }

        # データベースに保存
        result = expenses_collection.insert_one(expense)
        expense['_id'] = str(result.inserted_id)

        return jsonify(expense), 201

    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(f"支出の追加に失敗しました: {str(e)}", 500)

# 支出の削除
@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    try:
        # ObjectIdの検証
        if not ObjectId.is_valid(expense_id):
            raise APIError("無効なID形式です")

        result = expenses_collection.delete_one({'_id': ObjectId(expense_id)})
        
        if result.deleted_count == 0:
            raise APIError("指定された支出が見つかりません", 404)

        return '', 204

    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(f"支出の削除に失敗しました: {str(e)}", 500)

# 支出の更新
@app.route('/api/expenses/<expense_id>', methods=['PUT'])
def update_expense(expense_id):
    try:
        # ObjectIdの検証
        if not ObjectId.is_valid(expense_id):
            raise APIError("無効なID形式です")

        expense_data = request.json

        # 更新するデータの検証
        if 'amount' in expense_data:
            try:
                amount = float(expense_data['amount'])
                if amount <= 0:
                    raise ValueError
                expense_data['amount'] = amount
            except ValueError:
                raise APIError("金額は正の数値で入力してください")

        # 更新日時の追加
        expense_data['updated_at'] = datetime.utcnow()

        result = expenses_collection.update_one(
            {'_id': ObjectId(expense_id)},
            {'$set': expense_data}
        )

        if result.matched_count == 0:
            raise APIError("指定された支出が見つかりません", 404)

        # 更新後のデータを返す
        updated_expense = expenses_collection.find_one({'_id': ObjectId(expense_id)})
        updated_expense['_id'] = str(updated_expense['_id'])
        
        return jsonify(updated_expense)

    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(f"支出の更新に失敗しました: {str(e)}", 500)

# カテゴリ別の集計
@app.route('/api/expenses/summary/category', methods=['GET'])
def get_category_summary():
    try:
        pipeline = [
            {
                '$group': {
                    '_id': '$category',
                    'total': {'$sum': '$amount'},
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'total': -1}
            }
        ]

        summary = list(expenses_collection.aggregate(pipeline))
        return jsonify(summary)

    except Exception as e:
        raise APIError(f"カテゴリ別集計の取得に失敗しました: {str(e)}", 500)

# ヘルスチェック
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # MongoDBの接続確認
        client.admin.command('ping')
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception:
        raise APIError("データベース接続エラー", 503)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)