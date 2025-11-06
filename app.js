let productos = [];
let carrito = [];
const telefonoChocolateria = "525519259552"; // <-- tu número de WhatsApp con clave de país (sin + ni espacios)

// Cargar productos
fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    renderizarProductos(productos);
    generarCategorias();
  })
  .catch(err => console.error("Error al cargar productos:", err));

// Renderizar productos
function renderizarProductos(lista) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  lista.forEach(prod => {
    const item = document.createElement("div");
    item.classList.add("producto");

    item.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p class="categoria">${prod.categoria}</p>
      <p class="precio">$${prod.precio} MXN</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedor.appendChild(item);
  });
}

// Categorías dinámicas
function generarCategorias() {
  const contenedor = document.getElementById("categorias");
  contenedor.innerHTML = "";

  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];

  categorias.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => filtrarCategoria(cat);
    contenedor.appendChild(btn);
  });
}

// Agregar al carrito
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existente = carrito.find(i => i.id === id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  renderizarCarrito();
}

// Renderizar carrito
function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const totalEl = document.getElementById("total");
  contenedor.innerHTML = "";

  let total = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    const div = document.createElement("div");
    div.classList.add("carrito-item");
    div.innerHTML = `
      <span>${item.nombre} x${item.cantidad}</span>
      <span>$${item.precio * item.cantidad}</span>
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    contenedor.appendChild(div);
  });

  totalEl.textContent = `Total: $${total} MXN`;
}

// Eliminar producto
function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  renderizarCarrito();
}

// Vaciar carrito
function vaciarCarrito() {
  carrito = [];
  renderizarCarrito();
}

// Filtros
function filtrarCategoria(cat) {
  if (cat === "Todos") {
    renderizarProductos(productos);
  } else {
    const filtrados = productos.filter(p => p.categoria === cat);
    renderizarProductos(filtrados);
  }
}

// Búsqueda
function buscarProductos() {
  const texto = document.getElementById("buscador").value.toLowerCase();
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
  renderizarProductos(filtrados);
}

// Envío por WhatsApp con confirmación y datos del cliente
async function enviarPedido() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío 🍫");
    return;
  }

  const confirmar = confirm("¿Deseas confirmar tu pedido?");
  if (!confirmar) return;

  const telefonoCliente = prompt("Por favor, ingresa tu número de teléfono:");
  if (!telefonoCliente || telefonoCliente.trim() === "") {
    alert("Debes ingresar un número válido.");
  return
  }
  
  const nombreCliente = prompt("Por favor, ingresa tu Nombre Completo:")
  if (!nombreCliente || nombreCliente.trim() === "") {
    alert("Debes ingresar un Nombre completo.");
    return;
  }
	
  const metodoPago = prompt("Selecciona tu método de pago:\n1. Efectivo\n2. Transferencia\n3. Tarjeta");
  let metodoTexto = "No especificado";
  if (metodoPago === "1") metodoTexto = "Efectivo";
  if (metodoPago === "2") metodoTexto = "Transferencia";
  if (metodoPago === "3") metodoTexto = "Tarjeta";

  let mensaje = "🍫 *Nuevo Pedido - Chocolatería Artesanal* 🍫%0A";
  carrito.forEach(item => {
    mensaje += `- ${item.nombre} x${item.cantidad} = $${item.precio * item.cantidad}%0A`;
  });

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  mensaje += `%0A*Total:* $${total} MXN por 100 grs.`;
  mensaje += `%0A*Teléfono del cliente:* ${telefonoCliente}`;
  mensaje += `%0A*Nombre del cliente:* ${nombreCliente}`;
  mensaje += `%0A*Método de pago:* ${metodoTexto}`;

  const url = `https://wa.me/${telefonoChocolateria}?text=${mensaje}`;
  window.open(url, "_blank");
}
