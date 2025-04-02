
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


window.formatearNumeroTarjeta = function(input) {
    // Eliminar todos los espacios existentes
    let value = input.value.replace(/\s/g, '');
    
    // Agregar un espacio cada 4 dígitos
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Actualizar el valor del input (máximo 19 caracteres: 16 dígitos + 3 espacios)
    input.value = value.substring(0, 19);
}

window.formatearFechaTarjeta = function(input) {
    // Eliminar todo excepto dígitos
    let value = input.value.replace(/\D/g, '');
    
    // Insertar "/" después de los primeros 2 dígitos
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    // Actualizar el valor del input (máximo 5 caracteres: MM/AA)
    input.value = value.substring(0, 5);
}


function manejarPago(index) {
    const historialPrecios = JSON.parse(localStorage.getItem("historialPrecios")) || [];
    const item = historialPrecios[index];
    
    if (!item) return;

    // Función para validar un campo específico
    function validarCampo(campo, tipo) {
        const valor = campo.value;
        let valido = false;
        
        switch(tipo) {
            case 'nombre':
                valido = /^[A-Za-z ]{3,}$/.test(valor);
                break;
            case 'numero':
                const num = valor.replace(/\s/g, '');
                valido = /^\d{16}$/.test(num);
                break;
            case 'fecha':
                valido = /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(valor);
                break;
            case 'cvv':
                valido = /^\d{3}$/.test(valor);
                break;
        }
        
        // Aplicar clases CSS
        if (valor === '') {
            campo.classList.remove('valido', 'invalido');
        } else {
            campo.classList.toggle('valido', valido);
            campo.classList.toggle('invalido', !valido);
        }
        
        return valido;
    }

    // Función para validar todos los campos
    function validarCampos() {
        const nombreValido = validarCampo(document.getElementById('nombre-tarjeta'), 'nombre');
        const numeroValido = validarCampo(document.getElementById('numero-tarjeta'), 'numero');
        const fechaValida = validarCampo(document.getElementById('fecha-tarjeta'), 'fecha');
        const cvvValido = validarCampo(document.getElementById('cvv-tarjeta'), 'cvv');
        
        return nombreValido && numeroValido && fechaValida && cvvValido;
    }

    // Función para actualizar el estado del botón
    function actualizarBotonPagar() {
        const botonPagar = document.querySelector('.swal2-confirm');
        if (validarCampos()) {
            botonPagar.disabled = false;
            botonPagar.classList.remove('boton-deshabilitado');
        } else {
            botonPagar.disabled = true;
            botonPagar.classList.add('boton-deshabilitado');
        }
    }

    const swalInstance = Swal.fire({
        title: 'Procesar Pago',
        html: `
            <div class="contenedor-pago">
                <div class="resumen-envio">
                    <p><b>Destino:</b> ${item.destino}</p>
                    <p><b>Empresa:</b> ${item.empresa}</p>
                    <p><b>Total:</b> $${item.precio}</p>
                </div>
                
                <div class="formulario-pago">
                    <input 
                        id="nombre-tarjeta"
                        class="campo-pago" 
                        placeholder="Nombre del titular"
                        required
                        oninput="validarCampo(this, 'nombre'); actualizarBotonPagar()"
                    >
                    <input 
                        id="numero-tarjeta"
                        class="campo-pago" 
                        placeholder="Número de tarjeta"
                        maxlength="19"
                        required
                        oninput="formatearNumeroTarjeta(this); validarCampo(this, 'numero'); actualizarBotonPagar()"
                    >
                    <div class="contenedor-fila">
                        <input 
                            id="fecha-tarjeta"
                            class="campo-pago" 
                            placeholder="MM/AA"
                            maxlength="5"
                            required
                            oninput="formatearFechaTarjeta(this); validarCampo(this, 'fecha'); actualizarBotonPagar()"
                        >
                        <input 
                            id="cvv-tarjeta"
                            class="campo-pago" 
                            placeholder="CVV"
                            type="password"
                            maxlength="3"
                            required
                            oninput="validarCampo(this, 'cvv'); actualizarBotonPagar()"
                        >
                    </div>
                </div>
                
                <div class="nota-demo">
                    <p><b>💡</b> Datos de prueba: <b>4242 4242 4242 4242</b>, <b>12/25</b>, <b>123</b></p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Pagar $' + item.precio,
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        allowOutsideClick: false,
        didOpen: () => {
            // Inicializar el botón como deshabilitado
            const botonPagar = document.querySelector('.swal2-confirm');
            botonPagar.disabled = true;
            botonPagar.classList.add('boton-deshabilitado');
            
            // Auto-completar datos de prueba para desarrollo
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                document.getElementById('nombre-tarjeta').value = 'TITULAR PRUEBA';
                document.getElementById('numero-tarjeta').value = '4242 4242 4242 4242';
                document.getElementById('fecha-tarjeta').value = '12/25';
                document.getElementById('cvv-tarjeta').value = '123';
                
                // Validar todos los campos después de autocompletar
                validarCampos();
                actualizarBotonPagar();
            }
            
            // Registrar funciones en el ámbito global
            window.validarCampo = validarCampo;
            window.actualizarBotonPagar = actualizarBotonPagar;
        },
        preConfirm: () => {
            const numeroTarjeta = document.getElementById('numero-tarjeta').value.replace(/\s/g, '');
            const fechaTarjeta = document.getElementById('fecha-tarjeta').value;
            
            return {
                nombre: document.getElementById('nombre-tarjeta').value,
                numero: numeroTarjeta,
                fecha: fechaTarjeta,
                cvv: document.getElementById('cvv-tarjeta').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Validación adicional (por si acaso)
            if (!/^\d{16}$/.test(result.value.numero)) {
                Swal.showValidationMessage('Número de tarjeta inválido (deben ser 16 dígitos)');
                return false;
            }
            
            if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(result.value.fecha)) {
                Swal.showValidationMessage('Fecha de expiración inválida (Use formato MM/AA)');
                return false;
            }

            Swal.fire({
                title: 'Procesando pago...',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => Swal.showLoading()
            }).then(() => {
                item.pagado = true;
                localStorage.setItem("historialPrecios", JSON.stringify(historialPrecios));
                verHistorial();
                
                Swal.fire(
                    '¡Pago exitoso!',
                    `$${item.precio} procesados a ${item.empresa}<br>
                    <small>ID: ${generarIdTransaccion()}</small>`,
                    'success'
                );
            });
        }
    });
}


window.formatearNumeroTarjeta = function(input) {
    let value = input.value.replace(/\s/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value.substring(0, 19);
}

window.formatearFechaTarjeta = function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value.substring(0, 5);
}

function generarIdTransaccion() {
    return 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
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