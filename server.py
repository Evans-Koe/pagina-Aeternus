from flask import Flask, request, jsonify
import pyodbc
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite peticiones desde tu HTML local

#CONFIGURACIÓN DE CONEXIÓN
db_config = {
    'server': r'DESKTOP-1OVVT26\EVANS72',
    'database': 'AeternusDB',
    'username': 'EvansAdmin',      # cambia si usas otro usuario
    'password': '123321123',       # contraseña de SQL Server
    'driver': '{ODBC Driver 17 for SQL Server}'
}

def conectar_bd():
    try:
        conn = pyodbc.connect(
            f"DRIVER={db_config['driver']};"
            f"SERVER={db_config['server']};"
            f"DATABASE={db_config['database']};"
            f"UID={db_config['username']};"
            f"PWD={db_config['password']};"
            "TrustServerCertificate=yes;"
        )
        return conn
    except Exception as e:
        print("❌ Error de conexión:", e)
        return None

# REGISTRO DE USUARIO
@app.post('/registrar')
def registrar_usuario():
    datos = request.json
    nombre = datos.get('nombre')
    correo = datos.get('correo')
    contrasena = datos.get('contrasena')

    conn = conectar_bd()
    if not conn:
        return "Error de conexión a la base de datos ❌", 500
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)",
                       (nombre, correo, contrasena))
        conn.commit()
        return "Usuario registrado correctamente ✅"
    except Exception as e:
        print("❌ Error al registrar usuario:", e)
        return "Error al registrar usuario ❌", 500
    finally:
        conn.close()

# LOGIN DE USUARIO
@app.post('/login')
def login_usuario():
    datos = request.json
    correo = datos.get('correo')
    contrasena = datos.get('contrasena')

    conn = conectar_bd()
    if not conn:
        return "Error de conexión a la base de datos ❌", 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, nombre, correo FROM usuarios WHERE correo=? AND contrasena=?", (correo, contrasena))
        fila = cursor.fetchone()
        if fila:
            return jsonify({"success": True, "user": {"id": fila[0], "nombre": fila[1], "correo": fila[2]}})
        else:
            return jsonify({"success": False})
    except Exception as e:
        print("❌ Error en login:", e)
        return "Error al iniciar sesión ❌", 500
    finally:
        conn.close()

# GUARDAR PEDIDO
@app.post('/pedido')
def registrar_pedido():
    datos = request.json
    usuario_id = datos.get('usuario_id')
    producto = datos.get('producto')
    cantidad = datos.get('cantidad')

    conn = conectar_bd()
    if not conn:
        return "Error de conexión a la base de datos ❌", 500
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO pedidos (usuario_id, producto, cantidad) VALUES (?, ?, ?)",
                       (usuario_id, producto, cantidad))
        conn.commit()
        return "Pedido guardado correctamente 🛍️"
    except Exception as e:
        print("❌ Error al guardar pedido:", e)
        return "Error al guardar pedido ❌", 500
    finally:
        conn.close()

# INICIAR SERVIDOR
if __name__ == '__main__':
    app.run(port=3000, debug=True)
