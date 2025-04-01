// Botones
let seleccionarDireccion = document.getElementById("btnSeleccionarDireccion");
let calcular = document.getElementById("btnCalcular");
let borrarHistorial = document.getElementById("btnBorrarHistorial");

// Campos de entrada
let direccion = document.getElementById("txtDireccion");
let alto = document.getElementById("txtAlto");
let ancho = document.getElementById("txtAncho");
let largo = document.getElementById("txtLargo");
let peso = document.getElementById("txtPeso");

// Contenedor de medidas
let medidasContainer = document.getElementById("medidas-container");

// Empresa recomendada
let empresaEnvio = document.getElementById("empresaEnvio");

// H1 de resultado
let resultado = document.getElementById("resultado");

// Div del historial
let historial = document.getElementById("historial");
let historialContainer = document.getElementById("historial-container");

// Historial en localStorage
let historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];

verHistorial();

// Empresas de envío disponibles
const empresasDisponibles = [
    { nombre: "DHL", limite: 30, precio: 10000 },
    { nombre: "FedEx", limite: 50, precio: 20000 },
    { nombre: "UPS", limite: 70, precio: 30000 },
    { nombre: "USPS", limite: 90, precio: 40000 },
    { nombre: "Amazon Logistics", limite: 110, precio: 50000 },
    { nombre: "BlueDart", limite: 150, precio: 60000 },
    { nombre: "Estafeta", limite: 200, precio: 70000 }
];

// Evento para seleccionar dirección
seleccionarDireccion.onclick = () => {
    if (direccion.value.trim() === "") {
        resultado.innerHTML = "⚠️ Por favor, ingrese una dirección.";
        return;
    }

    // Habilitar los campos de medidas
    medidasContainer.disabled = false;
    resultado.innerHTML = "✅ Dirección seleccionada. Ahora ingrese las medidas.";
};

// Evento para habilitar el botón de calcular cuando se ingresan todas las medidas
[alto, ancho, largo, peso].forEach(input => {
    input.addEventListener("input", () => {
        if (alto.value && ancho.value && largo.value && peso.value) {
            calcular.disabled = false;
        } else {
            calcular.disabled = true;
        }
    });
});

// Evento para calcular el envío
calcular.onclick = () => {
    if (!validarisNaN()) {
        return;
    }

    let total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);

    // Buscar la empresa de envío más adecuada
    let empresaSeleccionada = empresasDisponibles.find(empresa => total <= empresa.limite);
    let empresa = empresaSeleccionada ? empresaSeleccionada.nombre : "Transportista Especial";
    let precio = empresaSeleccionada ? empresaSeleccionada.precio : 80000;

    // Mostrar empresa recomendada
    empresaEnvio.innerHTML = `<option value="${empresa}">${empresa}</option>`;
    empresaEnvio.disabled = false;

    // Guardar en el historial
    historialPrecios.push({ empresa, precio, direccion: direccion.value.trim() });
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));

    resultado.innerHTML = `🚀 Se recomienda: <b>${empresa}</b>. <br>💰 Precio estimado: <b>$${precio}</b>`;

    verHistorial();
    limpiarCampos();
};

// Función para limpiar los campos después del cálculo
function limpiarCampos() {
    [alto, ancho, largo, peso].forEach(input => input.value = "");
    calcular.disabled = true; // Se vuelve a desactivar hasta nuevo ingreso de datos
}

// Mostrar historial de envíos
function verHistorial() {
    if (historialPrecios.length === 0) {
        historialContainer.style.display = "none";
        return;
    }

    historialContainer.style.display = "block";
    historial.innerHTML = "<h2>📦 Historial de cálculos</h2>";

    historialPrecios.forEach((item, index) => {
        let div = document.createElement("div");
        div.classList.add("historial-item");
        div.innerHTML = `
            📍 <b>Dirección:</b> ${item.direccion} <br>
            🚛 <b>Empresa:</b> ${item.empresa} <br>
            💰 <b>Precio:</b> $${item.precio} 
            <button class="eliminar-item" data-index="${index}">❌ Eliminar</button>
        `;

        historial.appendChild(div);
    });

    // Agregar evento a cada botón de eliminar
    document.querySelectorAll(".eliminar-item").forEach(boton => {
        boton.addEventListener("click", (e) => {
            let index = e.target.getAttribute("data-index");
            borrarItemHistorial(index);
        });
    });
}

// Validar que los valores sean numéricos
function validarisNaN() {
    let valores = [alto.value, ancho.value, largo.value, peso.value];
    for (let val of valores) {
        if (isNaN(val) || val.trim() === "") {
            resultado.innerHTML = "⚠️ Ingrese solo números en los campos de medidas.";
            return false;
        }
    }
    return true;
}

// Botón para borrar historial
borrarHistorial.onclick = () => {
    historialPrecios = [];
    localStorage.removeItem("historialPrecios");
    verHistorial();
};
