
// Elementos del DOM
const btnConfirmarDireccionDestino = document.getElementById("btnConfirmarDireccionDestino");
const btnCalcular = document.getElementById("btnCalcular");
const btnConfirmarEnvio = document.getElementById("btnConfirmarEnvio");
const btnBorrarHistorial = document.getElementById("btnBorrarHistorial");

// Campos de entrada
const direccion = document.getElementById("txtDireccion");
const destino = document.getElementById("txtDestino");
const alto = document.getElementById("txtAlto");
const ancho = document.getElementById("txtAncho");
const largo = document.getElementById("txtLargo");
const peso = document.getElementById("txtPeso");

// Contenedores
const medidasContainer = document.getElementById("medidas-container");
const empresasRecomendadas = document.getElementById("empresasRecomendadas");
const resultado = document.getElementById("resultado");
const historial = document.getElementById("historial");
const historialContainer = document.getElementById("historial-container");

// Datos
let empresasDisponibles = [];


// Función para cargar empresas desde JSON
async function cargarEmpresas() {
    try {
        const response = await fetch('./data/empresas.json');
        if (!response.ok) throw new Error("Error al cargar empresas");
        empresasDisponibles = await response.json();
    } catch (error) {
        console.error("Error:", error);
        // Datos de respaldo
        empresasDisponibles = [
            { nombre: "DHL", limite: 20, precio: 12000 },
            { nombre: "FedEx", limite: 40, precio: 22000 }
        ];
        Swal.fire({
            icon: 'warning',
            title: 'Modo offline activado',
            text: 'Usando datos de respaldo'
        });
    }
}

// Validación de medidas
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

// Limpiar formulario
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
    
    // Resetear botón de confirmación
    btnConfirmarDireccionDestino.disabled = false;
    btnConfirmarDireccionDestino.style.opacity = "1";
    btnConfirmarDireccionDestino.textContent = "Confirmar Dirección y Destino";
}

// Mostrar historial
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
            <button class="pagar-item" data-index="${index}">💳 ${item.pagado ? '✅ Pagado' : 'Pagar'}</button>
        `;
        historial.appendChild(div);
    });
}

// Función para manejar pagos
function manejarPago(index) {
    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    const item = historialPrecios[index];
    
    if (!item) return;

    // Datos de prueba
    const datosPrueba = {
        tarjeta: '4242 4242 4242 4242',
        fecha: '12/25',
        cvv: '123',
        nombre: 'TITULAR DE PRUEBA'
    };

    Swal.fire({
        title: 'Procesar Pago',
        html: `
            <div style="text-align: left; margin: 15px 0;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p><b>Destino:</b> ${item.destino}</p>
                    <p><b>Empresa:</b> ${item.empresa}</p>
                    <p><b>Total a pagar:</b> $${item.precio}</p>
                </div>
                
                <div class="formulario-pago">
                    <input value="${datosPrueba.nombre}" class="swal2-input" placeholder="Nombre" id="nombre-tarjeta">
                    <input value="${datosPrueba.tarjeta}" class="swal2-input" placeholder="Tarjeta" id="numero-tarjeta">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <input value="${datosPrueba.fecha}" class="swal2-input" placeholder="MM/AA" id="fecha-tarjeta">
                        <input value="${datosPrueba.cvv}" class="swal2-input" placeholder="CVV" id="cvv-tarjeta" type="password">
                    </div>
                </div>
                
                <div style="margin-top: 15px; font-size: 12px; color: #6c757d;">
                    <p>💡 <b>Datos de prueba:</b> Puedes modificarlos o usar los predefinidos</p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Pago',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                nombre: document.getElementById('nombre-tarjeta').value,
                tarjeta: document.getElementById('numero-tarjeta').value,
                fecha: document.getElementById('fecha-tarjeta').value,
                cvv: document.getElementById('cvv-tarjeta').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Procesando pago...',
                timer: 1500,
                timerProgressBar: true,
                didOpen: () => Swal.showLoading()
            }).then(() => {
                // Marcar como pagado
                item.pagado = true;
                localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));
                verHistorial();
                
                Swal.fire(
                    '¡Pago exitoso!',
                    `$${item.precio} pagados a ${item.empresa}<br><small>ID: TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}</small>`,
                    'success'
                );
            });
        }
    });
}

// Eliminar item del historial
function borrarItemHistorial(index) {
    Swal.fire({
        title: '¿Eliminar este envío?',
        text: "¡Esta acción no se puede deshacer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
        if (result.isConfirmed) {
            const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
            historialPrecios.splice(index, 1);
            localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));
            verHistorial();
            Swal.fire('¡Eliminado!', 'El envío fue removido.', 'success');
        }
    });
}


// Confirmar dirección y destino
btnConfirmarDireccionDestino.addEventListener("click", function() {
    if (direccion.value.trim() === "" || destino.value.trim() === "") {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'Debes ingresar dirección y destino',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    // Habilitar sección de medidas
    const medidasElements = medidasContainer.querySelectorAll("input, button");
    medidasElements.forEach(el => el.disabled = false);
    medidasContainer.disabled = false;

    // Deshabilitar este botón
    this.disabled = true;
    this.style.opacity = "0.7";
    this.textContent = "✓ Confirmado";

    Swal.fire({
        icon: 'success',
        title: '¡Ubicaciones confirmadas!',
        html: `
            <div style="text-align: left;">
                <p><b>Origen:</b> ${direccion.value.trim()}</p>
                <p><b>Destino:</b> ${destino.value.trim()}</p>
            </div>
        `,
        confirmButtonColor: '#4CAF50'
    });
});

// Calcular envío
btnCalcular.addEventListener("click", function() {
    if (!validarMedidas()) return;

    const total = parseFloat(alto.value) + parseFloat(ancho.value) + parseFloat(largo.value) + parseFloat(peso.value);
    const empresasFiltradas = empresasDisponibles.filter(empresa => total <= empresa.limite);

    if (empresasFiltradas.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No hay empresas disponibles',
            text: 'El paquete excede los límites de transporte',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const selectEmpresa = document.getElementById("seleccionarEmpresa");
    selectEmpresa.innerHTML = '<option value="">Seleccione una empresa</option>';
    
    empresasFiltradas.forEach(empresa => {
        const option = document.createElement("option");
        option.value = empresa.nombre;
        option.textContent = `${empresa.nombre} - $${empresa.precio}`;
        selectEmpresa.appendChild(option);
    });

    empresasRecomendadas.style.display = "block";
    selectEmpresa.disabled = false;
    btnConfirmarEnvio.disabled = false;

    Swal.fire({
        icon: 'success',
        title: `¡${empresasFiltradas.length} empresas disponibles!`,
        text: 'Selecciona una para continuar',
        confirmButtonColor: '#4CAF50'
    });
});


btnConfirmarEnvio.addEventListener("click", function() {
    const empresaSeleccionada = document.getElementById("seleccionarEmpresa").value;
    if (!empresaSeleccionada) {
        Swal.fire({
            icon: 'error',
            title: 'Empresa no seleccionada',
            text: 'Debes elegir una empresa de transporte',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const empresa = empresasDisponibles.find(e => e.nombre === empresaSeleccionada);
    const nuevoEnvio = {
        direccion: direccion.value.trim(),
        destino: destino.value.trim(),
        empresa: empresaSeleccionada,
        precio: empresa.precio,
        fecha: new Date().toLocaleString(),
        pagado: false
    };

    const historial = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    historial.push(nuevoEnvio);
    localStorage.setItem("historialPrecios", JSON.stringify(historial));

    Swal.fire({
        icon: 'success',
        title: '¡Envío registrado!',
        html: `
            <div style="text-align: left;">
                <p><b>Empresa:</b> ${empresaSeleccionada}</p>
                <p><b>Precio:</b> $${empresa.precio}</p>
            </div>
        `,
        confirmButtonColor: '#4CAF50'
    });

    limpiarCampos();
    verHistorial();
});


btnBorrarHistorial.addEventListener("click", function() {
    Swal.fire({
        title: '¿Borrar todo el historial?',
        text: "¡Perderás todos los envíos registrados!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar todo'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("historialPrecios");
            verHistorial();
            Swal.fire('¡Historial borrado!', '', 'success');
        }
    });
});


historial.addEventListener("click", function(e) {
    if (e.target.classList.contains("eliminar-item")) {
        borrarItemHistorial(e.target.dataset.index);
    }
    if (e.target.classList.contains("pagar-item") && !e.target.textContent.includes("Pagado")) {
        manejarPago(e.target.dataset.index);
    }
});


[alto, ancho, largo, peso].forEach(input => {
    input.addEventListener("input", function() {
        btnCalcular.disabled = !(alto.value && ancho.value && largo.value && peso.value);
    });
});


document.addEventListener("DOMContentLoaded", function() {
    cargarEmpresas();
    verHistorial();
});