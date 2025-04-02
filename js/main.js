// =============================================
// === ELEMENTOS DEL DOM (INTERFAZ DE USUARIO) ===
// =============================================

// Botones
const btnConfirmarDireccionDestino = document.getElementById("btnConfirmarDireccionDestino");
const btnCalcular = document.getElementById("btnCalcular");
const btnConfirmarEnvio = document.getElementById("btnConfirmarEnvio");
const btnBorrarHistorial = document.getElementById("btnBorrarHistorial");

// Campos de entrada de texto
const direccion = document.getElementById("txtDireccion");
const destino = document.getElementById("txtDestino");
const alto = document.getElementById("txtAlto");
const ancho = document.getElementById("txtAncho");
const largo = document.getElementById("txtLargo");
const peso = document.getElementById("txtPeso");

// Contenedores y secciones
const medidasContainer = document.getElementById("medidas-container");
const empresasRecomendadas = document.getElementById("empresasRecomendadas");
const resultado = document.getElementById("resultado");
const historial = document.getElementById("historial");
const historialContainer = document.getElementById("historial-container");

// Elementos del modal de pago
const modalPago = document.getElementById("modalPago");
const closeModalPago = document.getElementById("closeModalPago");
const formPago = document.getElementById("formPago");
const mensajePago = document.getElementById("mensajePago");

const empresasDisponibles = [
    { nombre: "DHL", limite: 20, precio: 12000 },
    { nombre: "FedEx", limite: 40, precio: 22000 },
    { nombre: "UPS", limite: 60, precio: 30000 },
    { nombre: "USPS", limite: 80, precio: 38000 },
    { nombre: "Amazon Logistics", limite: 100, precio: 48000 },
    { nombre: "BlueDart", limite: 120, precio: 55000 },
    { nombre: "Estafeta", limite: 150, precio: 65000 },
    { nombre: "Ninja Van", limite: 175, precio: 72000 },
    { nombre: "Crown Worldwide", limite: 200, precio: 80000 },
    { nombre: "TNT Express", limite: 250, precio: 85000 },
    { nombre: "XPO Logistics", limite: 300, precio: 90000 },
    { nombre: "Yamato Transport", limite: 350, precio: 95000 }
];

function validarMedidas() {
    const medidas = [alto, ancho, largo, peso];
    for (const input of medidas) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Medida inválida',
                text: `${input.previousElementSibling.textContent} debe ser un número positivo.`,
            });
            return false;
        }
    }
    return true;
}

/**
 * Limpia todos los campos del formulario después de confirmar un envío.
 */
function limpiarCampos() {
    direccion.value = "";
    destino.value = "";
    alto.value = "";
    ancho.value = "";
    largo.value = "";
    peso.value = "";
    btnCalcular.disabled = true;
    document.getElementById("seleccionarEmpresa").innerHTML = '<option value="">Seleccione una empresa</option>';
    empresasRecomendadas.style.display = "none";
}

/**
 * Muestra el historial de envíos almacenado en localStorage.
 */
function verHistorial() {
    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    historial.innerHTML = "";

    if (historialPrecios.length === 0) {
        historialContainer.style.display = "none";
        return;
    }

    historialContainer.style.display = "block";
    historial.innerHTML = "<h2>📦 Historial de Envíos</h2>";

    historialPrecios.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "historial-item";
        div.innerHTML = `
            <p><b>Dirección:</b> ${item.direccion}</p>
            <p><b>Destino:</b> ${item.destino}</p>
            <p><b>Empresa:</b> ${item.empresa}</p>
            <p><b>Precio:</b> $${item.precio}</p>
            <p><b>Fecha:</b> ${item.fecha}</p>
            <button class="eliminar-item" data-index="${index}">❌ Eliminar</button>
            <button class="pagar-item" data-index="${index}">💳 Pagar</button>
        `;
        historial.appendChild(div);
    });
}

function realizarPago() {
    const index = document.getElementById("montoPago").dataset.index;
    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    
    if (!historialPrecios[index]) {
        Swal.fire("Error", "No se encontró el envío seleccionado", "error");
        return;
    }

    const item = historialPrecios[index];
    
    Swal.fire({
        title: `¿Confirmar pago de $${item.precio}?`,
        text: `Empresa: ${item.empresa}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, pagar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Aquí iría la lógica real de pago (simulada)
            Swal.fire(
                '¡Pago exitoso!',
                `Se procesó el pago de $${item.precio} a ${item.empresa}`,
                'success'
            );
            
            // Cerrar modal
            modalPago.style.display = "none";
            
            // Actualizar interfaz si es necesario
            document.querySelector(`.pagar-item[data-index="${index}"]`).textContent = "✅ Pagado";
            document.querySelector(`.pagar-item[data-index="${index}"]`).disabled = true;
        }
    });
}

formPago.addEventListener("submit", function(e) {
    e.preventDefault();
    realizarPago();
});

btnConfirmarDireccionDestino.addEventListener("click", () => {
    if (!direccion.value.trim() || !destino.value.trim()) {
        Swal.fire({
            icon: 'error',
            title: 'Campos vacíos',
            text: 'Por favor ingrese dirección y destino.',
        });
        return;
    }

    // Habilitar campos de medidas
    const medidasInputs = medidasContainer.querySelectorAll("input");
    medidasInputs.forEach(input => input.disabled = false);

    Swal.fire({
        icon: 'success',
        title: '¡Dirección confirmada!',
        text: 'Ahora ingrese las medidas del paquete.',
    });
});

[alto, ancho, largo, peso].forEach(input => {
    input.addEventListener("input", () => {
        btnCalcular.disabled = !(alto.value && ancho.value && largo.value && peso.value);
    });
});


btnCalcular.addEventListener("click", function() {
    if (!validarMedidas()) return;

    const total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);
    
    const empresasFiltradas = empresasDisponibles.filter(empresa => total <= empresa.limite);

    if (empresasFiltradas.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No hay empresas disponibles',
            text: 'El paquete excede los límites de todas las empresas.',
        });
        return;
    }

    const selectEmpresa = document.getElementById("seleccionarEmpresa");
    selectEmpresa.innerHTML = '<option value="">Seleccione una empresa</option>';
    
    empresasFiltradas.forEach(empresa => {
        const option = document.createElement("option");
        option.value = empresa.nombre;
        option.textContent = `${empresa.nombre} ($${empresa.precio})`;
        selectEmpresa.appendChild(option);
    });

    document.getElementById("empresasRecomendadas").style.display = "block";
    selectEmpresa.disabled = false;
    btnConfirmarEnvio.disabled = false;


    Swal.fire({
        icon: 'success',
        title: '¡Empresas encontradas!',
        html: `Se encontraron <b>${empresasFiltradas.length}</b> opciones.`,
    });
});

btnConfirmarEnvio.addEventListener("click", () => {
    const empresaSeleccionada = document.getElementById("seleccionarEmpresa").value;
    if (!empresaSeleccionada) {
        Swal.fire({
            icon: 'error',
            title: 'Empresa no seleccionada',
            text: 'Por favor elija una empresa de envío.',
        });
        return;
    }

    const empresaData = empresasDisponibles.find(empresa => empresa.nombre === empresaSeleccionada);
    const precioEstimado = empresaData.precio;

    const historialEnvio = {
        direccion: direccion.value.trim(),
        destino: destino.value.trim(),
        empresa: empresaSeleccionada,
        precio: precioEstimado,
        fecha: new Date().toLocaleString()
    };

    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    historialPrecios.push(historialEnvio);
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));

    Swal.fire({
        icon: 'success',
        title: '¡Envío confirmado!',
        html: `Empresa: <b>${empresaSeleccionada}</b><br>Precio: <b>$${precioEstimado}</b>`,
    });

    // Limpiar formulario
    limpiarCampos();
    verHistorial();
});


btnBorrarHistorial.addEventListener("click", () => {
    Swal.fire({
        title: '¿Borrar todo el historial?',
        text: '¡Esta acción no se puede deshacer!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("historialPrecios");
            verHistorial();
            Swal.fire('¡Borrado!', 'El historial ha sido eliminado.', 'success');
        }
    });
});

historial.addEventListener("click", (e) => {
    if (e.target.classList.contains("eliminar-item")) {
        const index = e.target.getAttribute("data-index");
        borrarItemHistorial(index);
    }
    if (e.target.classList.contains("pagar-item")) {
        const index = e.target.getAttribute("data-index");
        abrirModalPago(index);
    }
});


function borrarItemHistorial(index) {
    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios"));
    historialPrecios.splice(index, 1);
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));
    verHistorial();
}

function abrirModalPago(index) {
    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    const item = historialPrecios[index];
    
    // Guardar el índice del ítem que se está pagando
    document.getElementById("montoPago").dataset.index = index;
    document.getElementById("montoPago").value = item.precio;
    
    // Remover clase 'active' de todos los botones primero
    document.querySelectorAll(".pagar-item").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Marcar el botón clickeado como activo
    event.target.classList.add("active");
    
    modalPago.style.display = "block";
}


closeModalPago.addEventListener("click", () => {
    modalPago.style.display = "none";
});

formPago.addEventListener("submit", (e) => {
    e.preventDefault();
    const itemIndex = document.querySelector(".pagar-item.active")?.dataset.index;
    if (itemIndex === undefined) return;

    const item = JSON.parse(localStorage.getItem("historialPrecios"))[itemIndex];
    
    Swal.fire({
        icon: 'success',
        title: '¡Pago exitoso!',
        html: `Se ha procesado el pago de <b>$${item.precio}</b> a <b>${item.empresa}</b>.`,
    }).then(() => {
        modalPago.style.display = "none";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    verHistorial();
});