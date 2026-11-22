from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

todos = [
    {'id': 1, 'task': 'Set up Dockerfile and containerize app', 'done': True},
    {'id': 2, 'task': 'Configure Nginx reverse proxy', 'done': True},
    {'id': 3, 'task': 'Deploy multi-container pods on Kubernetes', 'done': False}
]

@app.route('/')
def index():
    return render_template('index.html', todos=todos)

@app.route('/add', methods=['POST'])
def add_task():
    task_text = request.form.get('task')
    if task_text:
        new_id = len(todos) + 1
        todos.append({'id': new_id, 'task': task_text, 'done': False})
    return redirect(url_for('index'))

@app.route('/complete/<int:task_id>')
def complete_task(task_id):
    for t in todos:
        if t['id'] == task_id:
            t['done'] = not t['done']
            break
    return redirect(url_for('index'))

@app.route('/delete/<int:task_id>')
def delete_task(task_id):
    global todos
    todos = [t for t in todos if t['id'] != task_id]
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
