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
  // Redirigir al inicio de la página
  window.location.href = "#";
} else {
  alert('Correo o contraseña incorrectos ❌');
}
}

// --- MODAL DE PRODUCTO ---
const modal = document.getElementById('modal');
const modalNombre = document.getElementById('modalNombre');
const modalPrecio = document.getElementById('modalPrecio');
const modalImg = document.getElementById('modalImg');

function abrirModal(nombre, precio, imagen) {
  modalNombre.textContent = nombre;
  modalPrecio.textContent = precio;
  modalImg.src = imagen;
  modal.classList.add('open');
}

function cerrarModal() {
  modal.classList.remove('open');
}

// --- CARRITO (versión final unificada) ---
let carrito = [];

function agregarAlCarrito() {
  const producto = modalNombre.textContent;
  const cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
  const precio = modalPrecio.textContent;
  const imagen = modalImg.src;

  carrito.push({ producto, cantidad, precio, imagen });
  alert(`${producto} (x${cantidad}) agregado al carrito 🛒`);
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
      <div class="item-carrito">
        <img src="${p.imagen}" alt="${p.producto}">
        <div class="info-item">
          <strong>${p.producto}</strong><br>
          <span>Cantidad: ${p.cantidad}</span>
        </div>
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

// --- ENVIAR PEDIDO PERSONALIZADO ---
async function enviarPedidoPersonalizado(e) {
  e.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const color = document.getElementById('color').value;
  const tamano = document.getElementById('tamano').value;
  const comentarios = document.getElementById('comentarios').value;

  const pedido = { tipo, color, tamano, comentarios };

  const res = await fetch('http://localhost:3000/pedido-personalizado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido)
  });

  const data = await res.text();
  alert(data);

  document.getElementById('formPersonalizado').reset();
}

// Aeternus.js
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Aeternus.js
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visible");
    } else {
      entrada.target.classList.remove("visible"); // se quita al salir
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".fade-in").forEach((el) => observador.observe(el));

// ---------- CARRUSEL AUTOMÁTICO ----------
let indiceSlide = 0;
const slides = document.querySelectorAll('.carrusel .slide');

function cambiarSlide() {
  slides[indiceSlide].classList.remove('activo');
  indiceSlide = (indiceSlide + 1) % slides.length;
  slides[indiceSlide].classList.add('activo');
}

setInterval(cambiarSlide, 4000); // cambia cada 4 segundos
