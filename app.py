import sqlite3
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ---------- DATABASE ----------
def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    # STUDENTS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        roll_number TEXT,
        gender TEXT,
        class_name TEXT,
        class_code TEXT,
        email TEXT
    )
    """)

    # PERFORMANCE (FIXED – teacher_email ADDED)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_number TEXT,
        class_name TEXT,
        class_code TEXT,
        date TEXT,
        behavioural TEXT,
        assessment_marks TEXT,
        attendance TEXT,
        overall_notes TEXT,
        image TEXT,
        teacher_email TEXT
    )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized correctly")


init_db()


# ---------- FRONTEND ----------
@app.route("/")
def home():
    return send_from_directory(".", "role.html")


@app.route("/<path:path>")
def serve_files(path):
    return send_from_directory(".", path)


# ---------- APIs ----------
@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.get_json()

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO students
        (name, roll_number, gender, class_name, class_code, email)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data["name"],
        data["roll_number"],
        data["gender"],
        data["class_name"],
        data["class_code"],
        data["email"]
    ))

    conn.commit()
    conn.close()
    return jsonify({"status": "success"})


@app.route("/get_students")
def get_students():
    class_name = request.args.get("class_name")
    class_code = request.args.get("class_code")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM students
        WHERE class_name=? AND class_code=?
    """, (class_name, class_code))

    students = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify(students)


@app.route("/add_performance", methods=["POST"])
def add_performance():
    files = request.files.getlist("images")
    images = []

    for f in files:
        if f.filename:
            name = secure_filename(f.filename)
            f.save(os.path.join(UPLOAD_FOLDER, name))
            images.append(name)

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO performance
        (roll_number, class_name, class_code, date,
         behavioural, assessment_marks, attendance,
         overall_notes, image, teacher_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        request.form["roll_number"],
        request.form["class_name"],
        request.form["class_code"],
        request.form["date"],
        request.form.get("behavioural"),
        request.form.get("assessment_marks"),
        request.form["attendance"],
        request.form.get("overall_notes"),
        ",".join(images),
        request.form["teacher_email"]
    ))

    conn.commit()
    conn.close()
    return jsonify({"status": "success"})


@app.route("/get_performance")
def get_performance():
    class_name = request.args.get("class_name")
    class_code = request.args.get("class_code")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM performance
        WHERE class_name=? AND class_code=?
        ORDER BY date DESC
    """, (class_name, class_code))

    data = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify(data)


if __name__ == "__main__":
    print("🚀 Server running at http://127.0.0.1:5000")
    app.run(debug=True)
