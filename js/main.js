// Botones
//let seleccionarDireccion = document.getElementById("btnSeleccionarDireccion");
let calcular = document.getElementById("btnCalcular");
let borrarHistorial = document.getElementById("btnBorrarHistorial");
//let btnSeleccionarDestino = document.getElementById("btnSeleccionarDestino");

let btnConfirmarDireccionDestino = document.getElementById("btnConfirmarDireccionDestino");

// Campos de entrada
let direccion = document.getElementById("txtDireccion");
let destino = document.getElementById("txtDestino");
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


// Evento para confirmar dirección y destino
btnConfirmarDireccionDestino.onclick = () => {
    if (direccion.value.trim() === "" || destino.value.trim() === "") {
        resultado.innerHTML = "⚠️ Por favor, ingrese tanto la dirección como el destino.";
        return;
    }

    // Habilitar los campos de medidas
    medidasContainer.disabled = false;
    resultado.innerHTML = "✅ Dirección y destino confirmados. Ahora ingrese las medidas.";
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

    // Buscar las empresas recomendadas
    let empresasRecomendadas = empresasDisponibles.filter(empresa => total <= empresa.limite);

    if (empresasRecomendadas.length === 0) {
        resultado.innerHTML = "⚠️ No hay empresas disponibles para el tamaño del paquete.";
        return;
    }

    // Mostrar las empresas recomendadas en el select
    let selectEmpresa = document.getElementById("seleccionarEmpresa");
    selectEmpresa.innerHTML = "<option value=''>Seleccione una empresa</option>"; // Limpiar opciones anteriores
    empresasRecomendadas.forEach(empresa => {
        let option = document.createElement("option");
        option.value = empresa.nombre;
        option.innerHTML = empresa.nombre;
        selectEmpresa.appendChild(option);
    });

    // Habilitar el select y el botón de confirmar
    document.getElementById("empresasRecomendadas").style.display = "block";
    selectEmpresa.disabled = false;
    document.getElementById("btnConfirmarEnvio").disabled = false;

    // Mostrar mensaje de recomendación
    resultado.innerHTML = "🚀 Se han encontrado empresas recomendadas. Por favor, seleccione una empresa para confirmar el envío.";

};

document.getElementById("seleccionarEmpresa").addEventListener("change", () => {
    let empresaSeleccionada = document.getElementById("seleccionarEmpresa").value;
    let total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);
    
    // Buscar la empresa seleccionada en la lista de empresas disponibles
    let empresaData = empresasDisponibles.find(empresa => empresa.nombre === empresaSeleccionada);

    if (empresaData) {
        let precioEstimado = empresaData.precio;
        resultado.innerHTML = `📦 Precio estimado con <b>${empresaSeleccionada}</b>: $${precioEstimado}`;
    }
})

// Evento de selección de empresa y confirmación de envío
// Evento de confirmación de envío
document.getElementById("btnConfirmarEnvio").onclick = () => {
    let empresaSeleccionada = document.getElementById("seleccionarEmpresa").value;
    let total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);

    if (!empresaSeleccionada) {
        resultado.innerHTML = "⚠️ Por favor, seleccione una empresa para continuar.";
        return;
    }

    // Obtener la dirección y destino
    let direccionSeleccionada = direccion.value.trim();
    let destinoSeleccionado = destino.value.trim();

    if (!direccionSeleccionada || !destinoSeleccionado) {
        resultado.innerHTML = "⚠️ Por favor, ingrese tanto la dirección como el destino antes de confirmar.";
        return;
    }

    // Buscar la empresa seleccionada
    let empresaData = empresasDisponibles.find(empresa => empresa.nombre === empresaSeleccionada);
    let precioEstimado = empresaData ? empresaData.precio : 0;

    // Mostrar la confirmación de envío
    resultado.innerHTML = `✅ Envío confirmado con la empresa: <b>${empresaSeleccionada}</b>. Precio final: $${precioEstimado}. Se procederá con el envío.`;

    // Guardar en el historial
    let historialEnvio = {
        direccion: direccionSeleccionada,
        destino: destinoSeleccionado,
        empresa: empresaSeleccionada,
        precio: precioEstimado,
        fecha: new Date().toLocaleString()
    };

    // Obtener historial de envíos desde el localStorage, si existe
    let historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    historialPrecios.push(historialEnvio);
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));

    // Mostrar el historial actualizado
    verHistorial();

    // Limpiar los campos después de la confirmación
    limpiarCampos();
    document.getElementById("empresasRecomendadas").style.display = "none";  // Ocultar el contenedor de empresas recomendadas
    document.getElementById("seleccionarEmpresa").disabled = true;  // Deshabilitar la selección
    document.getElementById("btnConfirmarEnvio").disabled = true;  // Deshabilitar el botón
};



// Botón de aceptar la confirmación de envío
btnAceptarConfirmacion.onclick = () => {
    // Ocultar la ventana de confirmación de envío
    confirmacionEnvio.style.display = "none";
};


// Función para limpiar los campos después del cálculo
function limpiarCampos() {
    [alto, ancho, largo, peso].forEach(input => input.value = "");
    calcular.disabled = true; // Se vuelve a desactivar hasta nuevo ingreso de datos
    direccion.value = "";
    destino.value = "";
}



function borrarItemHistorial(index) {
    // Eliminar el item del array
    historialPrecios.splice(index, 1);

    // Actualizar el historial en el localStorage
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));

    // Volver a mostrar el historial actualizado
    verHistorial();
}


// Validar que los valores sean numéricos
function validarisNaN() {
    let valores = [alto.value, ancho.value, largo.value, peso.value];
    for (let val of valores) {
        if (isNaN(val) || val.trim() === "" || parseFloat(val) < 0) {
            resultado.innerHTML = "⚠️ Ingrese solo números positivos en los campos de medidas.";
            return false;
        }
    }
    return true;
}

// Mostrar historial de envíos

function verHistorial() {
    let historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];

    if (historialPrecios.length === 0) {
        historialContainer.style.display = "none";
        return;
    }

    historialContainer.style.display = "block";
    historial.innerHTML = "<h2>📦 Historial de Cálculos</h2>";

    historialPrecios.forEach((item, index) => {
        let div = document.createElement("div");
        div.classList.add("historial-item");
        div.innerHTML = `
            📍 <b>Dirección:</b> ${item.direccion} <br>
            🏠 <b>Destino:</b> ${item.destino} <br>
            🚛 <b>Empresa:</b> ${item.empresa} <br>
            📅 <b>Fecha:</b> ${item.fecha} <br>
            💰 <b>Precio:</b> $${item.precio} <br>
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

// Eliminar un item del historial
function borrarItemHistorial(index) {
    let historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    historialPrecios.splice(index, 1);  // Eliminar el item en el índice especificado
    localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));

    // Mostrar el historial actualizado
    verHistorial();
}


// Botón para borrar historial
borrarHistorial.onclick = () => {
    historialPrecios = [];
    localStorage.removeItem("historialPrecios");
    verHistorial();
};