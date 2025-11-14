from flask import Flask, request, jsonify
import psycopg2
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from config_email import EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

app = Flask(__name__)
CORS(app)

# CONFIGURACIÓN DE CONEXIÓN
db_config = {
    'host': 'localhost',
    'port': '5432',
    'database': 'AeternusDB',
    'user': 'postgres',
    'password': '123321123mm'
}

def conectar_bd():
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password']
        )
        return conn
    except Exception as e:
        print("❌ Error de conexión:", e)
        return None

def enviar_correo(destinatario, asunto, mensaje):
    try:
        msg = MIMEText(mensaje, "plain", "utf-8")
        msg["From"] = EMAIL_USER
        msg["To"] = destinatario
        msg["Subject"] = asunto

        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()
        print("✅ Correo enviado correctamente")
    except Exception as e:
        print("❌ Error al enviar correo:", e)

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
        cursor.execute(
            "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (%s, %s, %s)",
            (nombre, correo, contrasena)
        )
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
    correo = (datos.get('correo') or '').strip()
    contrasena = (datos.get('contrasena') or '').strip()

    conn = conectar_bd()
    if not conn:
        return "Error de conexión a la base de datos ❌", 500
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, nombre, correo FROM usuarios WHERE correo=%s AND contrasena=%s",
            (correo, contrasena)
        )
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

# GUARDAR PEDIDO Y ENVIAR CORREO
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
        cursor.execute(
            "INSERT INTO pedidos (usuario_id, producto, cantidad) VALUES (%s, %s, %s)",
            (usuario_id, producto, cantidad)
        )
        conn.commit()

        # Enviar correo
        mensaje = f"Nuevo pedido:\n\nUsuario ID: {usuario_id}\nProducto: {producto}\nCantidad: {cantidad}"
        enviar_correo("tucorreo@gmail.com", "Nuevo Pedido Recibido", mensaje)

        return jsonify({"success": True, "message": "Pedido guardado y correo enviado ✅"})
    except Exception as e:
        print("❌ Error al guardar pedido:", e)
        return "Error al guardar pedido ❌", 500
    finally:
        conn.close()

# PEDIDO PERSONALIZADO
@app.post('/pedido-personalizado')
def pedido_personalizado():
    datos = request.json

    # Asignar valores por defecto si el usuario no envía alguno
    tipo = datos.get('tipo', 'No especificado')
    color = datos.get('color', 'No especificado')
    decoraciones = datos.get('decoraciones', 'Ninguna')
    comentarios = datos.get('comentarios', 'Sin comentarios')

    # Construir mensaje de manera segura
    mensaje = f"""
🧵 NUEVO PEDIDO PERSONALIZADO 🧵

Tipo de pulsera: {tipo}
Color: {color}
Decoraciones: {decoraciones}
Comentarios: {comentarios}
"""

    try:
        # Enviar correo
        remitente = "evanssierra72@gmail.com"  # tu correo
        destinatario = "evanssierra72@gmail.com"  # correo receptor
        password = "vips rwik cune oskc"  # clave de aplicación

        msg = MIMEText(mensaje, "plain", "utf-8")
        msg['Subject'] = "Nuevo pedido personalizado - Aeternus"
        msg['From'] = remitente
        msg['To'] = destinatario

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(remitente, password)
        server.send_message(msg)
        server.quit()

        return "✅ Pedido personalizado enviado correctamente"
    except Exception as e:
        print("❌ Error al enviar correo:", e)
        return "Error al enviar el pedido ❌", 500


# INICIAR SERVIDOR
if __name__ == '__main__':
    app.run(port=3000, debug=True)
