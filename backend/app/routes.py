from flask import Blueprint, request, jsonify
from . import db
from .models import Task

tasks_bp = Blueprint('tasks', __name__)


# GET /tasks — return all tasks
@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])


# POST /tasks — create a new task
@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400
    task = Task(title=title)
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


# PUT /tasks/<id> — update a task
@tasks_bp.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.get_json() or {}
    if 'title' in data:
        task.title = (data['title'] or '').strip()
    if 'completed' in data:
        task.completed = bool(data['completed'])
    db.session.commit()
    return jsonify(task.to_dict())


# DELETE /tasks/<id> — delete a task
@tasks_bp.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return '', 204