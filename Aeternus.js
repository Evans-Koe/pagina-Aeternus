// --- MODALES DE LOGIN / REGISTRO ---
const loginModal = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
let usuarioActual = null;

function mostrarRegistro() {
  loginModal.style.display = 'none';
  registroModal.style.display = 'flex';
}
function mostrarLogin() {
  registroModal.style.display = 'none';
  loginModal.style.display = 'flex';
}

// REGISTRAR USUARIO
async function registrarUsuario() {
  const nombre = registroModal.querySelector('input[placeholder="Nombre completo"]').value;
  const correo = registroModal.querySelector('input[placeholder="Correo electrónico"]').value;
  const contrasena = registroModal.querySelector('input[placeholder="Contraseña"]').value;

  const res = await fetch('http://localhost:3000/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, contrasena })
  });
  alert(await res.text());
  registroModal.style.display = 'none';
  loginModal.style.display = 'flex';
}

// INICIAR SESIÓN
async function iniciarSesion() {
  const correo = loginModal.querySelector('input[placeholder="Usuario o correo"]').value;
  const contrasena = loginModal.querySelector('input[placeholder="Contraseña"]').value;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  });
  const data = await res.json();

  if (data.success) {
    usuarioActual = data.user;
    alert(`Bienvenido, ${usuarioActual.nombre} 👋`);
    loginModal.style.display = 'none';
  } else {
    alert('Correo o contraseña incorrectos ❌');
  }
}

// --- MODAL DE PRODUCTO ---
const modal = document.getElementById('modal');
const modalNombre = document.getElementById('modalNombre');
const modalPrecio = document.getElementById('modalPrecio');
const modalMaterial = document.getElementById('modalMaterial');
const modalImg = document.getElementById('modalImg');

function abrirModal(nombre, precio, material, imagen) {
  modalNombre.textContent = nombre;
  modalPrecio.textContent = precio;
  modalMaterial.textContent = material;
  modalImg.src = imagen;
  modal.classList.add('open');
}
function cerrarModal() {
  modal.classList.remove('open');
}

// --- CARRITO (versión final unificada) ---
let carrito = [];

// Agregar producto al carrito
function agregarAlCarrito() {
  const producto = modalNombre.textContent;
  const precio = modalPrecio.textContent;
  const cantidad = 1;

  carrito.push({ producto, precio, cantidad });
  alert(`${producto} agregado al carrito 🛒`);
  actualizarContador();
  cerrarModal();
}

// Mostrar carrito
function abrirCarrito() {
  const modal = document.getElementById('modalCarrito');
  const lista = document.getElementById('listaCarrito');
  modal.classList.add('open');

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío 🛍️</p>";
  } else {
    lista.innerHTML = carrito.map((p, i) => `
      <div style="text-align:left; margin:10px 0;">
        ${i + 1}. <strong>${p.producto}</strong> - ${p.precio} (x${p.cantidad})
      </div>
    `).join('');
  }
}

// ❌ Cerrar carrito
function cerrarCarrito() {
  document.getElementById('modalCarrito').classList.remove('open');
}

// Actualizar contador
function actualizarContador() {
  document.getElementById('contadorCarrito').textContent = carrito.length;
}

// Enviar pedido al backend
async function realizarPedido() {
  if (!usuarioActual) return alert('Debes iniciar sesión primero 🔐');
  if (carrito.length === 0) return alert('Tu carrito está vacío');

  for (const item of carrito) {
    await fetch('http://localhost:3000/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioActual.id,
        producto: item.producto,
        cantidad: item.cantidad
      })
    });
  }

  alert('✅ Pedido realizado con éxito');
  carrito = [];
  actualizarContador();
  cerrarCarrito();
}
